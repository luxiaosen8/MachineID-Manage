use crate::machine_id::BackupError;

#[cfg(target_os = "macos")]
pub fn check_admin_permissions() -> bool {
    unsafe {
        libc::getuid() == 0
    }
}

#[cfg(target_os = "linux")]
pub fn check_admin_permissions() -> bool {
    unsafe {
        libc::getuid() == 0
    }
}

#[cfg(target_os = "macos")]
pub fn request_elevation() -> Result<(), BackupError> {
    Err(BackupError::UnsupportedPlatform(
        "Please restart the application with sudo".to_string()
    ))
}

#[cfg(target_os = "linux")]
pub fn request_elevation() -> Result<(), BackupError> {
    Err(BackupError::UnsupportedPlatform(
        "Please restart the application with sudo or pkexec".to_string()
    ))
}
