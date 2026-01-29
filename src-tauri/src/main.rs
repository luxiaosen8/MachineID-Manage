#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use crate::machine_id::clear_all_backups as machine_id_clear_all_backups;
use crate::machine_id::get_backup_count as machine_id_get_backup_count;
use crate::machine_id::list_backups as machine_id_list_backups;
use crate::machine_id::{
    backup_current_machine_guid, delete_backup, generate_random_machine_guid, read_machine_guid,
    restore_backup_by_id, test_registry_write_access, write_machine_guid, BackupError,
    MachineIdBackup, RestoreInfo, WriteResult,
};
use crate::platform::permissions::{
    check_admin_permissions, check_restart_state, request_elevation, RestartResult,
};
use tracing::{error, info, warn};

mod machine_id;
mod platform;

/// 将内部错误转换为用户友好的错误信息
/// 避免泄露敏感信息如文件路径等
fn sanitize_error_for_user(error: &BackupError) -> String {
    match error {
        BackupError::InsufficientPermissions => {
            "权限不足，需要管理员权限才能执行此操作".to_string()
        }
        BackupError::InvalidGuidFormat(_) => "GUID 格式无效，请检查输入".to_string(),
        BackupError::NotFound => "未找到 MachineGuid，系统可能尚未初始化".to_string(),
        BackupError::BackupNotFound(_) => "指定的备份不存在".to_string(),
        BackupError::RegistryWriteError(_) => "注册表写入失败，请检查权限或系统状态".to_string(),
        BackupError::RegistryError(_) => "注册表读取失败，请检查系统状态".to_string(),
        BackupError::StorageError(_) => "存储操作失败，请检查磁盘空间".to_string(),
        BackupError::ParseError(_) => "数据解析失败".to_string(),
        BackupError::UnsupportedPlatform => "当前操作系统不支持此功能".to_string(),
    }
}

#[derive(serde::Serialize)]
struct MachineIdResponse {
    success: bool,
    guid: String,
    source: String,
    error: Option<String>,
}

#[derive(serde::Serialize)]
struct BackupResponse {
    success: bool,
    backup: Option<MachineIdBackup>,
    skipped: bool,
    error: Option<String>,
}

#[derive(serde::Serialize)]
struct BackupListResponse {
    success: bool,
    backups: Vec<MachineIdBackup>,
    count: usize,
    error: Option<String>,
}

#[tauri::command]
fn read_machine_id() -> Result<MachineIdResponse, String> {
    info!("读取机器码");
    match read_machine_guid() {
        Ok(machine_id) => Ok(MachineIdResponse {
            success: true,
            guid: machine_id.guid,
            source: machine_id.source,
            error: None,
        }),
        Err(e) => {
            warn!("读取机器码失败: {}", e);
            Ok(MachineIdResponse {
                success: false,
                guid: String::new(),
                source: String::new(),
                error: Some(sanitize_error_for_user(&e)),
            })
        }
    }
}

#[tauri::command]
fn backup_machine_guid(description: Option<String>) -> Result<BackupResponse, String> {
    info!("备份机器码");
    match backup_current_machine_guid(description) {
        Ok(backup) => {
            let skipped = backup.is_none();
            Ok(BackupResponse {
                success: true,
                backup,
                skipped,
                error: None,
            })
        }
        Err(e) => {
            warn!("备份机器码失败: {}", e);
            Ok(BackupResponse {
                success: false,
                backup: None,
                skipped: false,
                error: Some(sanitize_error_for_user(&e)),
            })
        }
    }
}

#[tauri::command]
fn list_backups() -> Result<BackupListResponse, String> {
    info!("获取备份列表");
    match machine_id_list_backups() {
        Ok(backups) => Ok(BackupListResponse {
            success: true,
            backups: backups.clone(),
            count: backups.len(),
            error: None,
        }),
        Err(e) => {
            warn!("获取备份列表失败: {}", e);
            Ok(BackupListResponse {
                success: false,
                backups: Vec::new(),
                count: 0,
                error: Some(sanitize_error_for_user(&e)),
            })
        }
    }
}

#[tauri::command]
fn delete_backup_by_id(id: String) -> Result<BackupResponse, String> {
    info!("删除备份: {}", id);
    match delete_backup(&id) {
        Ok(_) => Ok(BackupResponse {
            success: true,
            backup: None,
            skipped: false,
            error: None,
        }),
        Err(e) => {
            warn!("删除备份失败: {}", e);
            Ok(BackupResponse {
                success: false,
                backup: None,
                skipped: false,
                error: Some(sanitize_error_for_user(&e)),
            })
        }
    }
}

#[tauri::command]
fn clear_all_backups() -> Result<BackupResponse, String> {
    info!("清空所有备份");
    match machine_id_clear_all_backups() {
        Ok(_) => Ok(BackupResponse {
            success: true,
            backup: None,
            skipped: false,
            error: None,
        }),
        Err(e) => {
            warn!("清空备份失败: {}", e);
            Ok(BackupResponse {
                success: false,
                backup: None,
                skipped: false,
                error: Some(sanitize_error_for_user(&e)),
            })
        }
    }
}

#[derive(serde::Serialize)]
struct BackupCountResponse {
    success: bool,
    count: usize,
    error: Option<String>,
}

#[tauri::command]
fn get_backup_count() -> Result<BackupCountResponse, String> {
    match machine_id_get_backup_count() {
        Ok(count) => Ok(BackupCountResponse {
            success: true,
            count,
            error: None,
        }),
        Err(e) => Ok(BackupCountResponse {
            success: false,
            count: 0,
            error: Some(sanitize_error_for_user(&e)),
        }),
    }
}

#[derive(serde::Serialize)]
struct WriteGuidResponse {
    success: bool,
    previous_guid: String,
    new_guid: String,
    pre_backup: Option<MachineIdBackup>,
    post_backup: Option<MachineIdBackup>,
    message: String,
    error: Option<String>,
}

// 常量定义
const MAX_DESCRIPTION_LENGTH: usize = 200;
const GUID_LENGTH: usize = 36;

#[tauri::command]
fn write_machine_guid_command(
    new_guid: String,
    description: Option<String>,
) -> Result<WriteGuidResponse, String> {
    info!("写入机器码: {}", new_guid);

    // 验证 GUID 长度
    if new_guid.len() != GUID_LENGTH {
        return Ok(WriteGuidResponse {
            success: false,
            previous_guid: String::new(),
            new_guid: String::new(),
            pre_backup: None,
            post_backup: None,
            message: String::new(),
            error: Some(format!("GUID 长度必须为 {} 个字符", GUID_LENGTH)),
        });
    }

    // 限制描述长度
    let description = description.map(|d| {
        if d.len() > MAX_DESCRIPTION_LENGTH {
            d.chars().take(MAX_DESCRIPTION_LENGTH).collect()
        } else {
            d
        }
    });

    // 服务端二次验证权限
    let perm_check = check_admin_permissions();
    if !perm_check.has_permission {
        warn!("权限不足，拒绝写入操作");
        return Ok(WriteGuidResponse {
            success: false,
            previous_guid: String::new(),
            new_guid: String::new(),
            pre_backup: None,
            post_backup: None,
            message: String::new(),
            error: Some("权限不足，需要管理员权限".to_string()),
        });
    }

    match write_machine_guid(&new_guid, description) {
        Ok(WriteResult {
            previous_guid,
            new_guid: current_guid,
            pre_backup,
            post_backup,
        }) => Ok(WriteGuidResponse {
            success: true,
            previous_guid,
            new_guid: current_guid.clone(),
            pre_backup,
            post_backup,
            message: format!("成功将 MachineGuid 替换为: {}", current_guid),
            error: None,
        }),
        Err(e) => {
            warn!("写入机器码失败: {}", e);
            Ok(WriteGuidResponse {
                success: false,
                previous_guid: String::new(),
                new_guid: String::new(),
                pre_backup: None,
                post_backup: None,
                message: String::new(),
                error: Some(sanitize_error_for_user(&e)),
            })
        }
    }
}

#[derive(serde::Serialize)]
struct GenerateRandomGuidResponse {
    success: bool,
    previous_guid: String,
    new_guid: String,
    pre_backup: Option<MachineIdBackup>,
    post_backup: Option<MachineIdBackup>,
    message: String,
    error: Option<String>,
}

#[derive(serde::Serialize)]
struct RestoreBackupResponse {
    success: bool,
    previous_guid: String,
    restored_guid: String,
    pre_backup: Option<MachineIdBackup>,
    restored_from: Option<MachineIdBackup>,
    message: String,
    error: Option<String>,
}

#[tauri::command]
fn restore_backup_by_id_command(id: String) -> Result<RestoreBackupResponse, String> {
    info!("恢复备份: {}", id);

    // 服务端二次验证权限
    let perm_check = check_admin_permissions();
    if !perm_check.has_permission {
        warn!("权限不足，拒绝恢复操作");
        return Ok(RestoreBackupResponse {
            success: false,
            previous_guid: String::new(),
            restored_guid: String::new(),
            pre_backup: None,
            restored_from: None,
            message: String::new(),
            error: Some("权限不足，需要管理员权限".to_string()),
        });
    }

    match restore_backup_by_id(&id) {
        Ok(RestoreInfo {
            previous_guid,
            restored_guid,
            pre_backup,
            restored_from,
        }) => Ok(RestoreBackupResponse {
            success: true,
            previous_guid,
            restored_guid: restored_guid.clone(),
            pre_backup,
            restored_from: Some(restored_from),
            message: format!("恢复成功: {}", restored_guid),
            error: None,
        }),
        Err(e) => {
            warn!("恢复备份失败: {}", e);
            Ok(RestoreBackupResponse {
                success: false,
                previous_guid: String::new(),
                restored_guid: String::new(),
                pre_backup: None,
                restored_from: None,
                message: String::new(),
                error: Some(sanitize_error_for_user(&e)),
            })
        }
    }
}

#[tauri::command]
fn generate_random_guid_command(
    description: Option<String>,
) -> Result<GenerateRandomGuidResponse, String> {
    info!("生成随机机器码");

    // 限制描述长度
    let description = description.map(|d| {
        if d.len() > MAX_DESCRIPTION_LENGTH {
            d.chars().take(MAX_DESCRIPTION_LENGTH).collect()
        } else {
            d
        }
    });

    // 服务端二次验证权限
    let perm_check = check_admin_permissions();
    if !perm_check.has_permission {
        warn!("权限不足，拒绝生成操作");
        return Ok(GenerateRandomGuidResponse {
            success: false,
            previous_guid: String::new(),
            new_guid: String::new(),
            pre_backup: None,
            post_backup: None,
            message: String::new(),
            error: Some("权限不足，需要管理员权限".to_string()),
        });
    }

    match generate_random_machine_guid(description) {
        Ok(WriteResult {
            previous_guid,
            new_guid: current_guid,
            pre_backup,
            post_backup,
        }) => Ok(GenerateRandomGuidResponse {
            success: true,
            previous_guid,
            new_guid: current_guid.clone(),
            pre_backup,
            post_backup,
            message: format!("成功生成并替换 MachineGuid: {}", current_guid),
            error: None,
        }),
        Err(e) => {
            warn!("生成随机机器码失败: {}", e);
            Ok(GenerateRandomGuidResponse {
                success: false,
                previous_guid: String::new(),
                new_guid: String::new(),
                pre_backup: None,
                post_backup: None,
                message: String::new(),
                error: Some(sanitize_error_for_user(&e)),
            })
        }
    }
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! This is MachineID-Manage v2.0.", name)
}

#[derive(serde::Serialize)]
struct PermissionCheckResponse {
    success: bool,
    has_permission: bool,
    method: String,
    error_type: Option<String>,
    error_message: Option<String>,
    debug_info: Option<String>,
}

#[tauri::command]
fn check_permission_command() -> Result<PermissionCheckResponse, String> {
    let result = check_admin_permissions();
    info!(
        "权限检查: has_permission={}, method={}, check_success={}",
        result.has_permission, result.method, result.check_success
    );

    Ok(PermissionCheckResponse {
        success: result.check_success,
        has_permission: result.has_permission,
        method: result.method,
        error_type: result.error_type,
        error_message: result.error_message,
        debug_info: result.debug_info,
    })
}

#[tauri::command]
fn test_write_access_command() -> Result<PermissionCheckResponse, String> {
    match test_registry_write_access() {
        Ok(_) => Ok(PermissionCheckResponse {
            success: true,
            has_permission: true,
            method: "registry_write".to_string(),
            error_type: None,
            error_message: None,
            debug_info: None,
        }),
        Err(e) => {
            let error_str = e.to_string();
            let has_permission = !error_str.contains("权限不足");
            Ok(PermissionCheckResponse {
                success: false,
                has_permission,
                method: "registry_write".to_string(),
                error_type: Some("registry_error".to_string()),
                error_message: Some(error_str),
                debug_info: None,
            })
        }
    }
}

#[derive(serde::Serialize)]
struct RestartAsAdminResponse {
    success: bool,
    message: String,
    platform: String,
    error: Option<String>,
}

#[tauri::command]
fn restart_as_admin_command() -> Result<RestartAsAdminResponse, String> {
    info!("收到以管理员权限重启请求");

    match request_elevation() {
        Ok(RestartResult {
            success,
            message,
            platform,
        }) => {
            info!("重启请求成功: {}", message);
            Ok(RestartAsAdminResponse {
                success,
                message,
                platform,
                error: None,
            })
        }
        Err(e) => {
            let error_msg = e.to_string();
            error!("重启请求失败: {}", error_msg);
            Ok(RestartAsAdminResponse {
                success: false,
                message: "重启失败".to_string(),
                platform: std::env::consts::OS.to_string(),
                error: Some(error_msg),
            })
        }
    }
}

#[derive(serde::Serialize)]
struct RestartStateResponse {
    was_restarted: bool,
    timestamp: Option<u64>,
    platform: Option<String>,
}

#[tauri::command]
fn check_restart_state_command() -> Result<RestartStateResponse, String> {
    match check_restart_state() {
        Some(state) => {
            info!("检测到程序是从重启状态恢复");
            Ok(RestartStateResponse {
                was_restarted: state
                    .get("was_restarted")
                    .and_then(|v| v.as_bool())
                    .unwrap_or(false),
                timestamp: state.get("timestamp").and_then(|v| v.as_u64()),
                platform: state
                    .get("platform")
                    .and_then(|v| v.as_str())
                    .map(|s| s.to_string()),
            })
        }
        None => Ok(RestartStateResponse {
            was_restarted: false,
            timestamp: None,
            platform: None,
        }),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sanitize_error_for_user() {
        // 测试权限错误
        let perm_error = BackupError::InsufficientPermissions;
        assert_eq!(
            sanitize_error_for_user(&perm_error),
            "权限不足，需要管理员权限才能执行此操作"
        );

        // 测试无效 GUID 错误
        let guid_error = BackupError::InvalidGuidFormat("test".to_string());
        assert_eq!(
            sanitize_error_for_user(&guid_error),
            "GUID 格式无效，请检查输入"
        );

        // 测试未找到错误
        let not_found_error = BackupError::NotFound;
        assert_eq!(
            sanitize_error_for_user(&not_found_error),
            "未找到 MachineGuid，系统可能尚未初始化"
        );

        // 测试备份不存在错误
        let backup_error = BackupError::BackupNotFound("123".to_string());
        assert_eq!(sanitize_error_for_user(&backup_error), "指定的备份不存在");

        // 测试不支持的系统错误
        let unsupported_error = BackupError::UnsupportedPlatform;
        assert_eq!(
            sanitize_error_for_user(&unsupported_error),
            "当前操作系统不支持此功能"
        );
    }

    #[test]
    fn test_guid_length_validation() {
        // 测试 GUID 长度常量
        assert_eq!(GUID_LENGTH, 36);

        // 测试有效 GUID 长度
        let valid_guid = "550E8400-E29B-41D4-A716-446655440000";
        assert_eq!(valid_guid.len(), GUID_LENGTH);

        // 测试无效 GUID 长度
        let short_guid = "550E8400-E29B-41D4-A716";
        assert_ne!(short_guid.len(), GUID_LENGTH);

        let long_guid = "550E8400-E29B-41D4-A716-4466554400000";
        assert_ne!(long_guid.len(), GUID_LENGTH);
    }

    #[test]
    fn test_description_length_limit() {
        // 测试描述长度限制
        let long_description = "a".repeat(MAX_DESCRIPTION_LENGTH + 100);
        let truncated: String = long_description
            .chars()
            .take(MAX_DESCRIPTION_LENGTH)
            .collect();
        assert_eq!(truncated.len(), MAX_DESCRIPTION_LENGTH);
    }
}

fn main() {
    // 初始化日志
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
        .init();

    info!("MachineID-Manage v2.0 启动");

    // 检查是否是重启后的状态
    if let Some(state) = check_restart_state() {
        info!("程序是从权限提升重启后启动的: {:?}", state);
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            read_machine_id,
            backup_machine_guid,
            list_backups,
            delete_backup_by_id,
            clear_all_backups,
            get_backup_count,
            write_machine_guid_command,
            generate_random_guid_command,
            restore_backup_by_id_command,
            check_permission_command,
            test_write_access_command,
            restart_as_admin_command,
            check_restart_state_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
