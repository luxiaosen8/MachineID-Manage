use crate::machine_id::BackupError;
use serde::Serialize;
use std::path::PathBuf;
use tracing::{error, info, warn};

/// 权限检查结果
#[derive(Debug, Clone, Serialize)]
pub struct PermissionCheckResult {
    /// 是否有管理员权限
    pub has_permission: bool,
    /// 检查是否成功
    pub check_success: bool,
    /// 使用的检测方法
    pub method: String,
    /// 错误类型（如果有）
    pub error_type: Option<String>,
    /// 错误信息（如果有）
    pub error_message: Option<String>,
    /// 详细错误信息（调试用）
    pub debug_info: Option<String>,
}

impl PermissionCheckResult {
    /// 创建成功的权限检查结果
    pub fn success(has_permission: bool, method: &str) -> Self {
        Self {
            has_permission,
            check_success: true,
            method: method.to_string(),
            error_type: None,
            error_message: None,
            debug_info: None,
        }
    }

    /// 创建失败的权限检查结果
    pub fn error(error_type: &str, error_message: &str, debug_info: Option<String>) -> Self {
        Self {
            has_permission: false,
            check_success: false,
            method: "error".to_string(),
            error_type: Some(error_type.to_string()),
            error_message: Some(error_message.to_string()),
            debug_info,
        }
    }
}

/// 重启结果
#[derive(Debug, Clone, Serialize)]
pub struct RestartResult {
    pub success: bool,
    pub message: String,
    pub platform: String,
}

/// 检查是否以管理员身份运行
///
/// Windows: 使用注册表写入权限检测
/// macOS/Linux: 检查 uid 是否为 0
#[cfg(windows)]
pub fn check_admin_permissions() -> PermissionCheckResult {
    info!("开始检查管理员权限 (Windows)");

    // 方法1: 尝试打开注册表的写入权限
    let registry_check = check_registry_write_permission();

    // 如果注册表检测成功且有权限，直接返回
    if registry_check.has_permission {
        info!("权限检查通过: 具有注册表写入权限");
        return PermissionCheckResult::success(true, "registry_write");
    }

    // 如果注册表检测失败（不是权限问题），返回错误
    if !registry_check.check_success {
        warn!("权限检查失败: 无法访问注册表");
        return PermissionCheckResult::error(
            "registry_error",
            "无法访问注册表",
            registry_check.debug_info,
        );
    }

    // 注册表检测成功但没有权限，说明是普通用户
    info!("权限检查通过: 普通用户权限");
    PermissionCheckResult::success(false, "registry_write")
}

/// Windows: 检查注册表写入权限
#[cfg(windows)]
fn check_registry_write_permission() -> PermissionCheckResult {
    use winreg::enums::*;
    use winreg::RegKey;

    let hkcu = RegKey::predef(HKEY_LOCAL_MACHINE);
    let crypt_path = "SOFTWARE\\Microsoft\\Cryptography";

    match hkcu.open_subkey_with_flags(crypt_path, KEY_WRITE) {
        Ok(_) => PermissionCheckResult::success(true, "registry_write"),
        Err(e) => {
            let error_kind = e.kind();
            let debug_info = format!("Registry error: {:?}, kind: {:?}", e, error_kind);

            if error_kind == std::io::ErrorKind::PermissionDenied {
                // 权限被拒绝，说明是普通用户
                PermissionCheckResult::success(false, "registry_write")
            } else {
                // 其他错误（如注册表不存在等）
                PermissionCheckResult::error(
                    "registry_access_error",
                    &format!("注册表访问错误: {}", e),
                    Some(debug_info),
                )
            }
        }
    }
}

#[cfg(target_os = "macos")]
pub fn check_admin_permissions() -> PermissionCheckResult {
    info!("开始检查管理员权限 (macOS)");
    let uid = unsafe { libc::getuid() };
    let has_permission = uid == 0;

    info!(
        "权限检查结果: has_permission={}, uid={}",
        has_permission, uid
    );

    PermissionCheckResult::success(
        has_permission,
        if has_permission {
            "root_user"
        } else {
            "non_root_user"
        },
    )
}

#[cfg(target_os = "linux")]
pub fn check_admin_permissions() -> PermissionCheckResult {
    info!("开始检查管理员权限 (Linux)");
    let uid = unsafe { libc::getuid() };
    let has_permission = uid == 0;

    info!(
        "权限检查结果: has_permission={}, uid={}",
        has_permission, uid
    );

    PermissionCheckResult::success(
        has_permission,
        if has_permission {
            "root_user"
        } else {
            "non_root_user"
        },
    )
}

#[cfg(not(any(target_os = "windows", target_os = "macos", target_os = "linux")))]
pub fn check_admin_permissions() -> PermissionCheckResult {
    warn!("在不支持的操作系统上检查权限");
    PermissionCheckResult::error("unsupported_platform", "不支持的操作系统", None)
}

/// 申请提升权限（以管理员身份重启）
/// 使用 Windows ShellExecute API 触发 UAC 提权对话框
///
/// 返回 RestartResult，成功后会延迟退出当前进程
#[cfg(windows)]
pub fn request_elevation() -> Result<RestartResult, BackupError> {
    use std::env;
    use std::ffi::OsStr;
    use std::os::windows::ffi::OsStrExt;
    use std::ptr;
    use std::thread;
    use std::time::Duration;
    use windows::Win32::Foundation::HWND;
    use windows::Win32::UI::Shell::ShellExecuteW;
    use windows::Win32::UI::WindowsAndMessaging::SHOW_WINDOW_CMD;

    info!("开始申请管理员权限重启 (Windows)");

    let current_exe = env::current_exe().map_err(|e| {
        error!("无法获取当前程序路径: {}", e);
        BackupError::StorageError(format!("无法获取当前程序路径: {}", e))
    })?;

    // 获取当前工作目录
    let current_dir = env::current_dir().map_err(|e| {
        error!("无法获取当前工作目录: {}", e);
        BackupError::StorageError(format!("无法获取当前工作目录: {}", e))
    })?;

    // 保存重启状态，以便重启后恢复
    if let Err(e) = save_restart_state() {
        warn!("保存重启状态失败: {}", e);
    }

    // 将路径转换为宽字符 (UTF-16)
    let exe_path_wide: Vec<u16> = current_exe
        .as_os_str()
        .encode_wide()
        .chain(Some(0))
        .collect();

    let working_dir_wide: Vec<u16> = current_dir
        .as_os_str()
        .encode_wide()
        .chain(Some(0))
        .collect();

    // "runas" 操作 verb - 这会触发 UAC 提权
    let runas_verb: Vec<u16> = OsStr::new("runas").encode_wide().chain(Some(0)).collect();

    info!("准备以管理员身份启动程序: {:?}", current_exe);
    info!("工作目录: {:?}", current_dir);

    // 使用 ShellExecuteW 触发 UAC 提权对话框
    // 这是 Windows 上启动管理员进程的标准方法
    let result = unsafe {
        ShellExecuteW(
            HWND(0),                                          // hwnd - 无父窗口
            windows::core::PCWSTR(runas_verb.as_ptr()),       // lpOperation - "runas" 触发 UAC
            windows::core::PCWSTR(exe_path_wide.as_ptr()),    // lpFile - 可执行文件路径
            windows::core::PCWSTR(ptr::null()),               // lpParameters - 无参数
            windows::core::PCWSTR(working_dir_wide.as_ptr()), // lpDirectory - 工作目录
            SHOW_WINDOW_CMD(1),                               // nShowCmd - SW_SHOWNORMAL
        )
    };

    // ShellExecuteW 返回值大于 32 表示成功
    // HINSTANCE 的 0 字段是 isize 类型
    let result_ptr = result.0;
    if result_ptr > 32 {
        info!("成功启动管理员进程，返回值: {:?}", result);

        // 延迟退出，给前端时间处理响应，也给新进程时间启动
        thread::spawn(move || {
            thread::sleep(Duration::from_secs(2));
            info!("当前进程即将退出，新进程将以管理员身份运行");
            std::process::exit(0);
        });

        Ok(RestartResult {
            success: true,
            message: "程序将以管理员身份重启".to_string(),
            platform: "windows".to_string(),
        })
    } else {
        // 返回值小于等于 32 表示错误
        let error_code = result_ptr as u32;
        let error_msg = match error_code {
            0 => "内存不足",
            2 => "文件未找到",
            3 => "路径未找到",
            5 => "访问被拒绝（用户可能取消了 UAC 提示）",
            8 => "内存不足",
            11 => "EXE 文件无效",
            26 => "共享错误",
            27 => "文件关联不完整",
            28 => "无法加载应用程序",
            31 => "没有应用程序关联",
            106 => "用户取消了 UAC 提示",
            1223 => "用户取消了操作",
            _ => "未知错误",
        };

        error!(
            "无法以管理员身份启动，错误码: {} - {}",
            error_code, error_msg
        );

        // 如果用户取消了 UAC，返回更友好的错误信息
        if error_code == 5 || error_code == 106 || error_code == 1223 {
            Err(BackupError::StorageError(
                "用户取消了权限提升请求".to_string(),
            ))
        } else {
            Err(BackupError::StorageError(format!(
                "无法以管理员身份启动: {} (错误码: {})",
                error_msg, error_code
            )))
        }
    }
}

#[cfg(target_os = "macos")]
pub fn request_elevation() -> Result<RestartResult, BackupError> {
    info!("申请管理员权限重启 (macOS)");

    // 保存重启状态
    if let Err(e) = save_restart_state() {
        warn!("保存重启状态失败: {}", e);
    }

    Err(BackupError::UnsupportedPlatform(
        "请使用 sudo 重新启动应用程序".to_string(),
    ))
}

#[cfg(target_os = "linux")]
pub fn request_elevation() -> Result<RestartResult, BackupError> {
    info!("申请管理员权限重启 (Linux)");

    // 保存重启状态
    if let Err(e) = save_restart_state() {
        warn!("保存重启状态失败: {}", e);
    }

    Err(BackupError::UnsupportedPlatform(
        "请使用 sudo 或 pkexec 重新启动应用程序".to_string(),
    ))
}

#[cfg(not(any(target_os = "windows", target_os = "macos", target_os = "linux")))]
pub fn request_elevation() -> Result<RestartResult, BackupError> {
    warn!("在不支持的操作系统上申请权限提升");
    Err(BackupError::UnsupportedPlatform(
        "不支持的操作系统".to_string(),
    ))
}

/// 获取应用程序数据目录
/// 使用程序所在目录下的 .data 文件夹存储数据
#[cfg(windows)]
fn get_app_data_dir() -> Result<PathBuf, Box<dyn std::error::Error>> {
    let exe_path = std::env::current_exe()?;
    let exe_dir = exe_path
        .parent()
        .ok_or("无法获取程序目录")?;

    let mut path = exe_dir.to_path_buf();
    path.push(".data");
    Ok(path)
}

/// 保存重启状态，以便重启后恢复
#[cfg(windows)]
fn save_restart_state() -> Result<(), Box<dyn std::error::Error>> {
    use serde_json::json;
    use std::fs;

    let mut state_path = get_app_data_dir()?;

    // 确保目录存在
    if !state_path.exists() {
        fs::create_dir_all(&state_path)?;
    }

    state_path.push("restart_state.json");

    let state = json!({
        "timestamp": std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)?
            .as_secs(),
        "was_restarted": true,
        "platform": "windows"
    });

    fs::write(&state_path, state.to_string())?;
    info!("重启状态已保存到: {:?}", state_path);

    Ok(())
}

#[cfg(not(windows))]
fn save_restart_state() -> Result<(), Box<dyn std::error::Error>> {
    // 非 Windows 平台暂时不实现
    Ok(())
}

/// 检查是否是重启后的状态
#[cfg(windows)]
pub fn check_restart_state() -> Option<serde_json::Value> {
    use std::fs;

    let mut state_path = get_app_data_dir().ok()?;
    state_path.push("restart_state.json");

    if !state_path.exists() {
        return None;
    }

    let content = fs::read_to_string(&state_path).ok()?;
    let state: serde_json::Value = serde_json::from_str(&content).ok()?;

    // 检查时间戳，如果超过 60 秒则认为不是当前的重启
    let timestamp = state.get("timestamp")?.as_u64()?;
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .ok()?
        .as_secs();

    if now - timestamp > 60 {
        // 清理过期的状态文件
        let _ = fs::remove_file(&state_path);
        return None;
    }

    // 清理已使用的状态文件
    let _ = fs::remove_file(&state_path);

    info!("检测到重启状态: {:?}", state);
    Some(state)
}

#[cfg(not(windows))]
pub fn check_restart_state() -> Option<serde_json::Value> {
    None
}

/// 清除重启状态
#[cfg(windows)]
#[allow(dead_code)]
pub fn clear_restart_state() -> Result<(), Box<dyn std::error::Error>> {
    use std::fs;
    use std::path::PathBuf;

    let app_data = std::env::var("APPDATA")?;
    let mut state_path = PathBuf::from(app_data);
    state_path.push("MachineID-Manage");
    state_path.push("restart_state.json");

    if state_path.exists() {
        fs::remove_file(&state_path)?;
        info!("重启状态已清除");
    }

    Ok(())
}

#[cfg(not(windows))]
pub fn clear_restart_state() -> Result<(), Box<dyn std::error::Error>> {
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_permission_check_result_success() {
        let result = PermissionCheckResult::success(true, "test_method");
        assert!(result.has_permission);
        assert!(result.check_success);
        assert_eq!(result.method, "test_method");
        assert!(result.error_type.is_none());
    }

    #[test]
    fn test_permission_check_result_error() {
        let result =
            PermissionCheckResult::error("test_error", "test message", Some("debug".to_string()));
        assert!(!result.has_permission);
        assert!(!result.check_success);
        assert_eq!(result.error_type, Some("test_error".to_string()));
        assert_eq!(result.error_message, Some("test message".to_string()));
        assert_eq!(result.debug_info, Some("debug".to_string()));
    }

    #[test]
    fn test_check_admin_permissions() {
        let result = check_admin_permissions();
        // 检查结果是否有效
        assert!(result.check_success || result.error_type.is_some());

        // 如果检查成功，has_permission 应该是 true 或 false
        if result.check_success {
            // 在测试环境中，权限状态取决于测试运行方式
            println!(
                "权限检查结果: has_permission={}, method={}",
                result.has_permission, result.method
            );
        } else {
            println!(
                "权限检查失败: error_type={:?}, error_message={:?}",
                result.error_type, result.error_message
            );
        }
    }

    #[cfg(windows)]
    #[test]
    fn test_registry_write_permission() {
        let result = check_registry_write_permission();
        println!("注册表权限检查结果: {:?}", result);

        // 检查应该成功执行（无论是否有权限）
        assert!(result.check_success || result.error_type.is_some());
    }

    #[cfg(target_os = "macos")]
    #[test]
    fn test_macos_permission_check() {
        let result = check_admin_permissions();
        assert!(result.check_success);

        let uid = unsafe { libc::getuid() };
        let expected = uid == 0;
        assert_eq!(result.has_permission, expected);
    }

    #[cfg(target_os = "linux")]
    #[test]
    fn test_linux_permission_check() {
        let result = check_admin_permissions();
        assert!(result.check_success);

        let uid = unsafe { libc::getuid() };
        let expected = uid == 0;
        assert_eq!(result.has_permission, expected);
    }

    #[test]
    fn test_restart_result() {
        let result = RestartResult {
            success: true,
            message: "测试消息".to_string(),
            platform: "test".to_string(),
        };

        assert!(result.success);
        assert_eq!(result.message, "测试消息");
        assert_eq!(result.platform, "test");
    }
}
