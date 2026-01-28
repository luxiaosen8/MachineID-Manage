#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use crate::machine_id::clear_all_backups as machine_id_clear_all_backups;
use crate::machine_id::get_backup_count as machine_id_get_backup_count;
use crate::machine_id::list_backups as machine_id_list_backups;
use crate::machine_id::{
    backup_current_machine_guid, check_admin_permissions, delete_backup,
    generate_random_machine_guid, read_machine_guid, restore_backup_by_id, test_registry_write_access,
    write_machine_guid, MachineIdBackup, RestoreInfo, WriteResult,
};
use tracing::{info, warn};

mod machine_id;

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
                error: Some(e.to_string()),
            })
        }
    }
}

#[tauri::command]
fn backup_machine_guid(description: Option<String>) -> Result<BackupResponse, String> {
    info!("备份机器码");
    match backup_current_machine_guid(description) {
        Ok(backup) => Ok(BackupResponse {
            success: true,
            backup,
            skipped: backup.is_none(),
            error: None,
        }),
        Err(e) => {
            warn!("备份机器码失败: {}", e);
            Ok(BackupResponse {
                success: false,
                backup: None,
                skipped: false,
                error: Some(e.to_string()),
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
                error: Some(e.to_string()),
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
                error: Some(e.to_string()),
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
                error: Some(e.to_string()),
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
            error: Some(e.to_string()),
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

#[tauri::command]
fn write_machine_guid_command(
    new_guid: String,
    description: Option<String>,
) -> Result<WriteGuidResponse, String> {
    info!("写入机器码: {}", new_guid);
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
                error: Some(e.to_string()),
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
                error: Some(e.to_string()),
            })
        }
    }
}

#[tauri::command]
fn generate_random_guid_command(
    description: Option<String>,
) -> Result<GenerateRandomGuidResponse, String> {
    info!("生成随机机器码");
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
                error: Some(e.to_string()),
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
    error: Option<String>,
}

#[tauri::command]
fn check_permission_command() -> Result<PermissionCheckResponse, String> {
    let has_permission = check_admin_permissions();
    info!("权限检查: {}", has_permission);
    Ok(PermissionCheckResponse {
        success: true,
        has_permission,
        error: None,
    })
}

#[tauri::command]
fn test_write_access_command() -> Result<PermissionCheckResponse, String> {
    match test_registry_write_access() {
        Ok(_) => Ok(PermissionCheckResponse {
            success: true,
            has_permission: true,
            error: None,
        }),
        Err(e) => Ok(PermissionCheckResponse {
            success: false,
            has_permission: false,
            error: Some(e.to_string()),
        }),
    }
}

fn main() {
    // 初始化日志
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
        .init();

    info!("MachineID-Manage v2.0 启动");

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
            test_write_access_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
