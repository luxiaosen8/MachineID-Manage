use crate::machine_id::{MachineId, BackupError};
use std::fs;

#[cfg(target_os = "macos")]
pub fn read_machine_guid() -> Result<MachineId, BackupError> {
    use std::process::Command;
    
    let output = Command::new("ioreg")
        .args(&["-rd1", "-c", "IOPlatformExpertDevice"])
        .output()
        .map_err(|e| BackupError::RegistryError(format!("Failed to execute ioreg: {}", e)))?;
    
    let output_str = String::from_utf8_lossy(&output.stdout);
    
    for line in output_str.lines() {
        if line.contains("IOPlatformUUID") {
            if let Some(start) = line.find("\"") {
                if let Some(end) = line[start + 1..].find("\"") {
                    let uuid = &line[start + 1..start + 1 + end];
                    return Ok(MachineId {
                        guid: uuid.to_string(),
                        source: "IOPlatformUUID".to_string(),
                    });
                }
            }
        }
    }
    
    Err(BackupError::RegistryError("Could not find IOPlatformUUID".to_string()))
}

#[cfg(target_os = "macos")]
pub fn write_machine_guid(guid: &str) -> Result<(), BackupError> {
    Err(BackupError::UnsupportedPlatform(
        "Writing machine ID is not supported on macOS".to_string()
    ))
}

#[cfg(target_os = "linux")]
pub fn read_machine_guid() -> Result<MachineId, BackupError> {
    let machine_id = fs::read_to_string("/etc/machine-id")
        .or_else(|_| fs::read_to_string("/var/lib/dbus/machine-id"))
        .map_err(|e| BackupError::RegistryError(format!("Failed to read machine-id: {}", e)))?;
    
    Ok(MachineId {
        guid: machine_id.trim().to_string(),
        source: "/etc/machine-id".to_string(),
    })
}

#[cfg(target_os = "linux")]
pub fn write_machine_guid(guid: &str) -> Result<(), BackupError> {
    use std::io::Write;
    
    let mut file = fs::OpenOptions::new()
        .write(true)
        .truncate(true)
        .open("/etc/machine-id")
        .map_err(|e| BackupError::RegistryError(format!("Failed to open machine-id: {}", e)))?;
    
    file.write_all(guid.as_bytes())
        .map_err(|e| BackupError::RegistryError(format!("Failed to write machine-id: {}", e)))?;
    
    Ok(())
}
