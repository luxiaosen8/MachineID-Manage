use serde::Serialize;
use crate::machine_id::BackupError;

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

/// 检查是否以管理员身份运行
/// 
/// Windows: 使用注册表写入权限检测
/// macOS/Linux: 检查 uid 是否为 0
#[cfg(windows)]
pub fn check_admin_permissions() -> PermissionCheckResult {
    // 方法1: 尝试打开注册表的写入权限
    let registry_check = check_registry_write_permission();
    
    // 如果注册表检测成功且有权限，直接返回
    if registry_check.has_permission {
        return PermissionCheckResult::success(true, "registry_write");
    }
    
    // 如果注册表检测失败（不是权限问题），返回错误
    if !registry_check.check_success {
        return PermissionCheckResult::error(
            "registry_error",
            "无法访问注册表",
            registry_check.debug_info,
        );
    }
    
    // 注册表检测成功但没有权限，说明是普通用户
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
    let uid = unsafe { libc::getuid() };
    let has_permission = uid == 0;
    
    PermissionCheckResult::success(
        has_permission,
        if has_permission { "root_user" } else { "non_root_user" }
    )
}

#[cfg(target_os = "linux")]
pub fn check_admin_permissions() -> PermissionCheckResult {
    let uid = unsafe { libc::getuid() };
    let has_permission = uid == 0;
    
    PermissionCheckResult::success(
        has_permission,
        if has_permission { "root_user" } else { "non_root_user" }
    )
}

#[cfg(not(any(target_os = "windows", target_os = "macos", target_os = "linux")))]
pub fn check_admin_permissions() -> PermissionCheckResult {
    PermissionCheckResult::error(
        "unsupported_platform",
        "不支持的操作系统",
        None,
    )
}

/// 申请提升权限（以管理员身份重启）
/// 使用安全的参数传递方式，避免命令注入风险
#[cfg(windows)]
pub fn request_elevation() -> Result<(), BackupError> {
    use std::process::Command;
    use std::env;
    
    let current_exe = env::current_exe()
        .map_err(|e| BackupError::StorageError(format!("无法获取当前程序路径: {}", e)))?;
    
    // 使用 PowerShell 的 Start-Process 命令以管理员身份运行
    // 使用 -LiteralPath 参数避免路径解析问题，并对路径进行转义
    let exe_path = current_exe.to_string_lossy();
    // 对单引号进行转义 (PowerShell 中使用两个单引号转义)
    let safe_path = exe_path.replace("'", "''");
    
    let result = Command::new("powershell.exe")
        .args(&[
            "-NoProfile",
            "-ExecutionPolicy", "Bypass",
            "-Command",
            &format!(
                "Start-Process -LiteralPath '{}' -Verb RunAs -Wait:$false",
                safe_path
            ),
        ])
        .spawn();
    
    match result {
        Ok(_) => {
            // 成功启动后退出当前进程
            std::process::exit(0);
        }
        Err(e) => Err(BackupError::StorageError(
            format!("无法以管理员身份启动: {}", e)
        )),
    }
}

#[cfg(target_os = "macos")]
pub fn request_elevation() -> Result<(), BackupError> {
    Err(BackupError::UnsupportedPlatform(
        "请使用 sudo 重新启动应用程序".to_string()
    ))
}

#[cfg(target_os = "linux")]
pub fn request_elevation() -> Result<(), BackupError> {
    Err(BackupError::UnsupportedPlatform(
        "请使用 sudo 或 pkexec 重新启动应用程序".to_string()
    ))
}

#[cfg(not(any(target_os = "windows", target_os = "macos", target_os = "linux")))]
pub fn request_elevation() -> Result<(), BackupError> {
    Err(BackupError::UnsupportedPlatform(
        "不支持的操作系统".to_string()
    ))
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
        let result = PermissionCheckResult::error("test_error", "test message", Some("debug".to_string()));
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
            println!("权限检查结果: has_permission={}, method={}", 
                result.has_permission, result.method);
        } else {
            println!("权限检查失败: error_type={:?}, error_message={:?}",
                result.error_type, result.error_message);
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
}
