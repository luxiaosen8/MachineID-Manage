#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use crate::machine_id::read_machine_guid;

mod machine_id;

/// Tauri 命令：读取 MachineGuid
/// 
/// 从 Windows 注册表读取机器码
/// 
/// # Returns
/// 
/// 返回 JSON 对象，包含:
/// - success: 是否成功
/// - guid: MachineGuid 值
/// - source: 注册表路径
/// - error: 错误信息（如果失败）
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

/// 读取机器码响应结构
#[derive(serde::Serialize)]
struct MachineIdResponse {
    success: bool,
    guid: String,
    source: String,
    error: Option<String>,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! This is MachineID-Manage.", name)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, read_machine_id])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
