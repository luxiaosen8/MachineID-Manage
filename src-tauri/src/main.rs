#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use crate::machine_id::{read_machine_guid, backup_current_machine_guid, delete_backup, MachineIdBackup, write_machine_guid};
use crate::machine_id::list_backups as machine_id_list_backups;
use crate::machine_id::clear_all_backups as machine_id_clear_all_backups;
use crate::machine_id::get_backup_count as machine_id_get_backup_count;

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
    match read_machine_guid() {
        Ok(machine_id) => Ok(MachineIdResponse {
            success: true,
            guid: machine_id.guid,
            source: machine_id.source,
            error: None,
        }),
        Err(e) => Ok(MachineIdResponse {
            success: false,
            guid: String::new(),
            source: String::new(),
            error: Some(e.to_string()),
        }),
    }
}

#[tauri::command]
fn backup_machine_guid(description: Option<String>) -> Result<BackupResponse, String> {
    match backup_current_machine_guid(description) {
        Ok(backup) => Ok(BackupResponse {
            success: true,
            backup: Some(backup),
            error: None,
        }),
        Err(e) => Ok(BackupResponse {
            success: false,
            backup: None,
            error: Some(e.to_string()),
        }),
    }
}

#[tauri::command]
fn list_backups() -> Result<BackupListResponse, String> {
    match machine_id_list_backups() {
        Ok(backups) => Ok(BackupListResponse {
            success: true,
            backups: backups.clone(),
            count: backups.len(),
            error: None,
        }),
        Err(e) => Ok(BackupListResponse {
            success: false,
            backups: Vec::new(),
            count: 0,
            error: Some(e.to_string()),
        }),
    }
}

#[tauri::command]
fn delete_backup_by_id(id: String) -> Result<BackupResponse, String> {
    match delete_backup(&id) {
        Ok(_) => Ok(BackupResponse {
            success: true,
            backup: None,
            error: None,
        }),
        Err(e) => Ok(BackupResponse {
            success: false,
            backup: None,
            error: Some(e.to_string()),
        }),
    }
}

#[tauri::command]
fn clear_all_backups() -> Result<BackupResponse, String> {
    match machine_id_clear_all_backups() {
        Ok(_) => Ok(BackupResponse {
            success: true,
            backup: None,
            error: None,
        }),
        Err(e) => Ok(BackupResponse {
            success: false,
            backup: None,
            error: Some(e.to_string()),
        }),
    }
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
struct BackupCountResponse {
    success: bool,
    count: usize,
    error: Option<String>,
}

#[derive(serde::Serialize)]
struct WriteGuidResponse {
    success: bool,
    backup: Option<MachineIdBackup>,
    message: String,
    error: Option<String>,
}

#[tauri::command]
fn write_machine_guid_command(new_guid: String, description: Option<String>) -> Result<WriteGuidResponse, String> {
    match write_machine_guid(&new_guid, description) {
        Ok(backup) => Ok(WriteGuidResponse {
            success: true,
            backup: Some(backup),
            message: format!("成功将 MachineGuid 替换为: {}", new_guid),
            error: None,
        }),
        Err(e) => Ok(WriteGuidResponse {
            success: false,
            backup: None,
            message: String::new(),
            error: Some(e.to_string()),
        }),
    }
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! This is MachineID-Manage.", name)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            greet,
            read_machine_id,
            backup_machine_guid,
            list_backups,
            delete_backup_by_id,
            clear_all_backups,
            get_backup_count,
            write_machine_guid_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
