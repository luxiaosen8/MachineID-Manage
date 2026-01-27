use std::fs;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};
use winreg::enums::*;
use winreg::RegKey;

#[derive(Debug, thiserror::Error)]
#[error(transparent)]
pub enum BackupError {
    #[error("注册表读取失败: {0}")]
    RegistryError(String),
    #[error("注册表写入失败: {0}")]
    RegistryWriteError(String),
    #[error("MachineGuid 值不存在")]
    NotFound,
    #[error("MachineGuid 值解析失败: {0}")]
    ParseError(String),
    #[error("备份存储失败: {0}")]
    StorageError(String),
    #[error("备份不存在: {0}")]
    BackupNotFound(String),
    #[error("无效的 GUID 格式: {0}")]
    InvalidGuidFormat(String),
    #[error("权限不足，需要管理员权限才能修改注册表")]
    InsufficientPermissions,
    #[error("机器码 {0} 已存在备份，跳过重复备份")]
    DuplicateBackup(String),
}

impl Serialize for BackupError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MachineIdBackup {
    pub id: String,
    pub guid: String,
    pub source: String,
    pub timestamp: u64,
    pub description: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BackupStore {
    pub backups: Vec<MachineIdBackup>,
}

impl BackupStore {
    pub fn new() -> Self {
        BackupStore {
            backups: Vec::new(),
        }
    }

    pub fn add_backup(&mut self, backup: MachineIdBackup) {
        self.backups.insert(0, backup);
    }

    pub fn remove_backup(&mut self, id: &str) -> Result<MachineIdBackup, BackupError> {
        let index = self
            .backups
            .iter()
            .position(|b| b.id == id)
            .ok_or(BackupError::BackupNotFound(id.to_string()))?;
        Ok(self.backups.remove(index))
    }

    pub fn get_backup(&self, id: &str) -> Option<&MachineIdBackup> {
        self.backups.iter().find(|b| b.id == id)
    }

    pub fn len(&self) -> usize {
        self.backups.len()
    }

    pub fn is_empty(&self) -> bool {
        self.backups.is_empty()
    }

    pub fn has_guid(&self, guid: &str) -> bool {
        self.backups.iter().any(|b| b.guid == guid)
    }

    pub fn get_latest_backup_by_guid(&self, guid: &str) -> Option<&MachineIdBackup> {
        self.backups.iter().find(|b| b.guid == guid)
    }
}

fn get_backup_file_path() -> PathBuf {
    if let Ok(path_str) = std::env::var("BACKUP_TEST_PATH") {
        return PathBuf::from(path_str);
    }
    let mut path = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    path.push("backups.json");
    path
}

pub fn check_admin_permissions() -> bool {
    if !cfg!(target_os = "windows") {
        return false;
    }

    let hkcu = RegKey::predef(HKEY_LOCAL_MACHINE);
    let crypt_path = r"SOFTWARE\Microsoft\Cryptography";

    match hkcu.open_subkey_with_flags(crypt_path, KEY_WRITE | KEY_READ) {
        Ok(_) => true,
        Err(_) => false,
    }
}

pub fn test_registry_write_access() -> Result<(), BackupError> {
    if !cfg!(target_os = "windows") {
        return Err(BackupError::InsufficientPermissions);
    }

    let hkcu = RegKey::predef(HKEY_LOCAL_MACHINE);
    let crypt_path = r"SOFTWARE\Microsoft\Cryptography";

    match hkcu.open_subkey_with_flags(crypt_path, KEY_WRITE | KEY_READ) {
        Ok(_) => Ok(()),
        Err(e) => {
            if e.kind() == std::io::ErrorKind::PermissionDenied {
                Err(BackupError::InsufficientPermissions)
            } else {
                Err(BackupError::RegistryWriteError(e.to_string()))
            }
        }
    }
}

fn load_backup_store() -> Result<BackupStore, BackupError> {
    let path = get_backup_file_path();

    if !path.exists() {
        return Ok(BackupStore::new());
    }

    let content =
        fs::read_to_string(&path).map_err(|e| BackupError::StorageError(e.to_string()))?;

    serde_json::from_str(&content).map_err(|e| BackupError::StorageError(e.to_string()))
}

fn save_backup_store(store: &BackupStore) -> Result<(), BackupError> {
    let path = get_backup_file_path();
    let content = serde_json::to_string_pretty(store)
        .map_err(|e| BackupError::StorageError(e.to_string()))?;

    fs::write(&path, content).map_err(|e| BackupError::StorageError(e.to_string()))
}

fn generate_backup_id() -> String {
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_millis();
    format!("backup_{}", timestamp)
}

pub fn backup_current_machine_guid(
    description: Option<String>,
) -> Result<MachineIdBackup, BackupError> {
    let machine_id = read_machine_guid()?;

    let store = load_backup_store()?;
    if store.has_guid(&machine_id.guid) {
        return Err(BackupError::DuplicateBackup(machine_id.guid.clone()));
    }

    let backup = MachineIdBackup {
        id: generate_backup_id(),
        guid: machine_id.guid.clone(),
        source: machine_id.source.clone(),
        timestamp: SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs(),
        description,
    };

    let mut store = load_backup_store()?;
    store.add_backup(backup.clone());
    save_backup_store(&store)?;

    Ok(backup)
}

pub fn list_backups() -> Result<Vec<MachineIdBackup>, BackupError> {
    let store = load_backup_store()?;
    Ok(store.backups)
}

pub fn delete_backup(id: &str) -> Result<(), BackupError> {
    let mut store = load_backup_store()?;
    store.remove_backup(id)?;
    save_backup_store(&store)?;
    Ok(())
}

pub fn clear_all_backups() -> Result<(), BackupError> {
    let store = BackupStore::new();
    save_backup_store(&store)?;
    Ok(())
}

pub fn get_backup_count() -> Result<usize, BackupError> {
    let store = load_backup_store()?;
    Ok(store.len())
}

pub fn get_backup_by_id(id: &str) -> Result<MachineIdBackup, BackupError> {
    let store = load_backup_store()?;
    store
        .get_backup(id)
        .cloned()
        .ok_or(BackupError::BackupNotFound(id.to_string()))
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RestoreInfo {
    pub previous_guid: String,
    pub restored_guid: String,
    pub pre_backup: MachineIdBackup,
    pub restored_from: MachineIdBackup,
}

fn set_machine_guid_value(new_guid: &str) -> Result<(), BackupError> {
    let hkcu = RegKey::predef(HKEY_LOCAL_MACHINE);
    let crypt_path = r"SOFTWARE\Microsoft\Cryptography";
    let crypt_key = hkcu
        .open_subkey_with_flags(crypt_path, KEY_WRITE | KEY_READ)
        .map_err(|e| BackupError::RegistryWriteError(e.to_string()))?;
    crypt_key
        .set_value("MachineGuid", &new_guid)
        .map_err(|e| BackupError::RegistryWriteError(e.to_string()))?;
    Ok(())
}

pub fn restore_backup_by_id(id: &str) -> Result<RestoreInfo, BackupError> {
    let target = get_backup_by_id(id)?;
    validate_guid_format(&target.guid)?;

    let previous = read_machine_guid()?;
    let pre_backup = backup_current_machine_guid(Some(format!(
        "恢复前自动备份: 从备份 {} 恢复到 {}",
        target.id, target.guid
    )))?;

    set_machine_guid_value(&target.guid)?;
    let restored = read_machine_guid()?;

    Ok(RestoreInfo {
        previous_guid: previous.guid,
        restored_guid: restored.guid,
        pre_backup,
        restored_from: target,
    })
}

#[derive(Debug, Clone)]
pub struct MachineId {
    pub guid: String,
    pub source: String,
}

pub fn read_machine_guid() -> Result<MachineId, BackupError> {
    let hkcu = RegKey::predef(HKEY_LOCAL_MACHINE);
    let crypt_path = r"SOFTWARE\Microsoft\Cryptography";
    let crypt_key = hkcu
        .open_subkey_with_flags(crypt_path, KEY_READ)
        .map_err(|e| BackupError::RegistryError(e.to_string()))?;
    let machine_guid: String = crypt_key.get_value("MachineGuid").map_err(|e| {
        if e.kind() == std::io::ErrorKind::NotFound {
            BackupError::NotFound
        } else {
            BackupError::RegistryError(e.to_string())
        }
    })?;
    validate_guid_format(&machine_guid)?;
    Ok(MachineId {
        guid: machine_guid,
        source: "HKLM\\SOFTWARE\\Microsoft\\Cryptography".to_string(),
    })
}

fn validate_guid_format(guid: &str) -> Result<(), BackupError> {
    let guid_pattern = regex::Regex::new(
        r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
    )
    .map_err(|e| BackupError::ParseError(e.to_string()))?;
    if !guid_pattern.is_match(guid) {
        return Err(BackupError::InvalidGuidFormat(guid.to_string()));
    }
    Ok(())
}

pub fn write_machine_guid(
    new_guid: &str,
    description: Option<String>,
) -> Result<MachineIdBackup, BackupError> {
    validate_guid_format(new_guid)?;

    backup_current_machine_guid(description)?;

    let hkcu = RegKey::predef(HKEY_LOCAL_MACHINE);
    let crypt_path = r"SOFTWARE\Microsoft\Cryptography";
    let crypt_key = hkcu
        .open_subkey_with_flags(crypt_path, KEY_WRITE | KEY_READ)
        .map_err(|e| BackupError::RegistryWriteError(e.to_string()))?;

    crypt_key
        .set_value("MachineGuid", &new_guid)
        .map_err(|e| BackupError::RegistryWriteError(e.to_string()))?;

    backup_current_machine_guid(Some(format!("替换后自动备份: {}", new_guid)))?;

    let machine_id = read_machine_guid()?;
    Ok(MachineIdBackup {
        id: generate_backup_id(),
        guid: machine_id.guid,
        source: machine_id.source,
        timestamp: SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs(),
        description: Some(format!("自定义替换: {}", new_guid)),
    })
}

pub fn read_machine_guid_bytes() -> Result<String, BackupError> {
    let machine_id = read_machine_guid()?;
    let bytes: String = machine_id.guid.chars().filter(|c| *c != '-').collect();
    Ok(bytes)
}

pub fn generate_random_guid() -> String {
    let mut rng = rand::thread_rng();
    let bytes: [u8; 16] = rand::Rng::gen(&mut rng);

    format!(
         "{:02x}{:02x}{:02x}{:02x}-{:02x}{:02x}-{:02x}{:02x}-{:02x}{:02x}-{:02x}{:02x}{:02x}{:02x}{:02x}{:02x}",
         bytes[0], bytes[1], bytes[2], bytes[3],
         bytes[4], bytes[5],
         bytes[6], bytes[7],
         bytes[8], bytes[9],
         bytes[10], bytes[11], bytes[12], bytes[13], bytes[14], bytes[15]
     )
}

pub fn generate_random_machine_guid(
    description: Option<String>,
) -> Result<MachineIdBackup, BackupError> {
    let new_guid = generate_random_guid();
    write_machine_guid(&new_guid, description)
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    struct TempBackupDir {
        _guard: TempDir,
        path: PathBuf,
    }

    impl TempBackupDir {
        fn new() -> Self {
            let temp_dir = TempDir::new().unwrap();
            let backup_path = temp_dir.path().join("backups.json");
            std::env::set_var("BACKUP_TEST_PATH", backup_path.to_string_lossy().as_ref());
            Self {
                _guard: temp_dir,
                path: backup_path,
            }
        }
    }

    impl Drop for TempBackupDir {
        fn drop(&mut self) {
            std::env::remove_var("BACKUP_TEST_PATH");
        }
    }

    static TEST_MUTEX: std::sync::Mutex<()> = std::sync::Mutex::new(());

    fn with_temp_backup_dir<F>(test: F)
    where
        F: FnOnce(&TempBackupDir) + std::panic::UnwindSafe,
    {
        let guard_result = TEST_MUTEX.lock();
        let _lock = match guard_result {
            Ok(lock) => lock,
            Err(_) => {
                println!("⚠️ Mutex 被污染，尝试恢复...");
                std::thread::sleep(std::time::Duration::from_millis(100));
                TEST_MUTEX.lock().unwrap_or_else(|e| e.into_inner())
            }
        };
        let temp_dir = TempBackupDir::new();

        let result = std::panic::catch_unwind(|| {
            test(&temp_dir);
        });

        if result.is_err() {
            panic!("Test panicked");
        }
    }

    #[test]
    fn test_backup_store_add_and_remove() {
        with_temp_backup_dir(|_temp_dir| {
            let mut store = BackupStore::new();
            assert!(store.is_empty());

            let backup = MachineIdBackup {
                id: "test_1".to_string(),
                guid: "test-guid-1".to_string(),
                source: "test".to_string(),
                timestamp: 1234567890,
                description: None,
            };

            store.add_backup(backup.clone());
            assert_eq!(store.len(), 1);
            assert_eq!(store.get_backup("test_1").unwrap().guid, "test-guid-1");

            let removed = store.remove_backup("test_1").unwrap();
            assert_eq!(removed.id, "test_1");
            assert!(store.is_empty());
        });
    }

    #[test]
    fn test_backup_machine_guid() {
        if !cfg!(target_os = "windows") {
            return;
        }

        with_temp_backup_dir(|_temp_dir| {
            let result = backup_current_machine_guid(Some("测试备份".to_string()));
            assert!(result.is_ok(), "备份应该成功: {:?}", result.err());

            let backup = result.unwrap();
            assert!(!backup.id.is_empty());
            assert!(backup.guid.len() == 36);
            assert_eq!(backup.description, Some("测试备份".to_string()));

            let count = get_backup_count().unwrap();
            assert_eq!(count, 1);
        });
    }

    #[test]
    fn test_list_backups() {
        if !cfg!(target_os = "windows") {
            return;
        }

        with_temp_backup_dir(|_temp_dir| {
            clear_all_backups().ok();

            let original_guid = read_machine_guid().unwrap();
            let test_guid = "550E8400-E29B-41D4-A716-446655440000";

            backup_current_machine_guid(Some("备份1".to_string())).unwrap();

            let write_result = write_machine_guid(test_guid, Some("切换到测试GUID".to_string()));
            if let Err(BackupError::RegistryWriteError(_)) = write_result {
                println!("⚠️ 跳过测试: 需要管理员权限");
                return;
            }

            backup_current_machine_guid(Some("备份2".to_string())).unwrap();

            let backups = list_backups().unwrap();
            assert_eq!(backups.len(), 2);

            write_machine_guid(&original_guid.guid, None).ok();
        });
    }

    #[test]
    fn test_delete_backup() {
        if !cfg!(target_os = "windows") {
            return;
        }

        with_temp_backup_dir(|_temp_dir| {
            let backup = backup_current_machine_guid(Some("待删除备份".to_string())).unwrap();
            assert_eq!(get_backup_count().unwrap(), 1);

            let result = delete_backup(&backup.id);
            assert!(result.is_ok());
            assert_eq!(get_backup_count().unwrap(), 0);

            let result = delete_backup("nonexistent_id");
            assert!(result.is_err());
        });
    }

    #[test]
    fn test_clear_all_backups() {
        if !cfg!(target_os = "windows") {
            return;
        }

        with_temp_backup_dir(|_temp_dir| {
            clear_all_backups().ok();

            let original_guid = read_machine_guid().unwrap();
            let test_guid = "550E8400-E29B-41D4-A716-446655440000";

            let result1 = backup_current_machine_guid(Some("备份1".to_string()));
            match result1 {
                Ok(_) => {}
                Err(BackupError::DuplicateBackup(_)) => {
                    println!("⚠️ 当前机器码已有备份，跳过创建");
                }
                Err(e) => panic!("备份失败: {:?}", e),
            }

            let write_result = write_machine_guid(test_guid, Some("切换到测试GUID".to_string()));
            if let Err(BackupError::RegistryWriteError(_)) = write_result {
                println!("⚠️ 跳过测试: 需要管理员权限");
                write_machine_guid(&original_guid.guid, None).ok();
                return;
            }

            let result2 = backup_current_machine_guid(Some("备份2".to_string()));
            match result2 {
                Ok(_) => assert_eq!(get_backup_count().unwrap(), 2),
                Err(BackupError::DuplicateBackup(_)) => {
                    println!("⚠️ 测试GUID已有备份，使用1个备份");
                    assert_eq!(get_backup_count().unwrap(), 1);
                }
                Err(e) => panic!("备份失败: {:?}", e),
            }

            clear_all_backups().unwrap();
            assert_eq!(get_backup_count().unwrap(), 0);

            write_machine_guid(&original_guid.guid, None).ok();
        });
    }

    #[test]
    fn test_read_machine_guid() {
        let result = read_machine_guid();
        if cfg!(target_os = "windows") {
            assert!(
                result.is_ok(),
                "应该能成功读取 MachineGuid: {:?}",
                result.err()
            );
            let machine_id = result.unwrap();
            assert!(!machine_id.guid.is_empty());
            assert_eq!(machine_id.guid.len(), 36);
        } else {
            assert!(result.is_err());
        }
    }

    #[test]
    fn test_read_machine_guid_bytes() {
        if cfg!(target_os = "windows") {
            let result = read_machine_guid_bytes();
            assert!(result.is_ok());
            let bytes = result.unwrap();
            assert_eq!(bytes.len(), 32);
            assert!(bytes.chars().all(|c| c.is_ascii_hexdigit()));
        }
    }

    #[test]
    fn test_validate_guid_format_valid() {
        let valid_guids = vec![
            "550E8400-E29B-41D4-A716-446655440000",
            "12345678-1234-1234-1234-123456789012",
            "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF",
            "00000000-0000-0000-0000-000000000000",
        ];
        for guid in valid_guids {
            let result = validate_guid_format(guid);
            assert!(result.is_ok(), "应该验证通过: {}", guid);
        }
    }

    #[test]
    fn test_validate_guid_format_invalid() {
        let invalid_guids = vec![
            "invalid-guid",
            "550E8400-E29B-41D4-A716",
            "550E8400E29B41D4A716446655440000",
            "550E8400-E29B-41D4-A716-44665544000",   // 少一位
            "550E8400-E29B-41D4-A716-4466554400000", // 多一位
            "550E8400-E29B-41D4-A716-44665544000g",  // 包含非法字符
            "",
            "not-a-guid",
        ];
        for guid in invalid_guids {
            let result = validate_guid_format(guid);
            assert!(result.is_err(), "应该验证失败: {}", guid);
        }
    }

    #[test]
    fn test_write_machine_guid_with_auto_backup() {
        if !cfg!(target_os = "windows") {
            return;
        }

        with_temp_backup_dir(|_temp_dir| {
            clear_all_backups().ok();

            let original_guid = read_machine_guid().unwrap();
            let test_guid = "550E8400-E29B-41D4-A716-446655440000";

            let result = write_machine_guid(test_guid, Some("自动备份测试".to_string()));

            if let Err(BackupError::RegistryWriteError(_)) = result {
                println!("⚠️ 跳过注册表写入测试: 需要管理员权限");
                return;
            }

            assert!(result.is_ok(), "写入应该成功: {:?}", result.err());

            let new_guid = read_machine_guid().unwrap();
            assert_eq!(new_guid.guid, test_guid);

            let backups = list_backups().unwrap();
            assert!(!backups.is_empty());
            assert_eq!(backups.first().unwrap().guid, original_guid.guid);

            let restore_result = write_machine_guid(&original_guid.guid, None);
            assert!(restore_result.is_ok());

            let restored_guid = read_machine_guid().unwrap();
            assert_eq!(restored_guid.guid, original_guid.guid);
        });
    }

    #[test]
    fn test_restore_backup_by_id() {
        if !cfg!(target_os = "windows") {
            return;
        }

        with_temp_backup_dir(|_temp_dir| {
            clear_all_backups().ok();

            let original = read_machine_guid().unwrap();
            let target_backup =
                backup_current_machine_guid(Some("恢复目标备份".to_string())).unwrap();

            let test_guid = "550E8400-E29B-41D4-A716-446655440000";
            let change_result = write_machine_guid(test_guid, Some("准备恢复测试".to_string()));

            if let Err(BackupError::RegistryWriteError(_)) = change_result {
                println!("⚠️ 跳过恢复测试: 需要管理员权限");
                return;
            }

            assert!(
                change_result.is_ok(),
                "切换到测试GUID应成功: {:?}",
                change_result.err()
            );
            let changed = read_machine_guid().unwrap();
            assert_eq!(changed.guid, test_guid);

            let restore_result = restore_backup_by_id(&target_backup.id);
            if let Err(BackupError::RegistryWriteError(_)) = restore_result {
                println!("⚠️ 跳过恢复测试: 需要管理员权限");
                write_machine_guid(&original.guid, None).ok();
                return;
            }
            assert!(
                restore_result.is_ok(),
                "恢复应成功: {:?}",
                restore_result.err()
            );

            let restored = read_machine_guid().unwrap();
            assert_eq!(restored.guid, original.guid);
        });
    }

    #[test]
    fn test_write_machine_guid_invalid_format() {
        if !cfg!(target_os = "windows") {
            return;
        }

        with_temp_backup_dir(|_temp_dir| {
            clear_all_backups().ok();

            let invalid_guids = vec![
                "invalid-guid",
                "550E8400-E29B-41D4-A716",
                "550E8400E29B41D4A716446655440000",
            ];

            for invalid_guid in invalid_guids {
                let result = write_machine_guid(invalid_guid, None);
                assert!(result.is_err(), "应该拒绝无效格式: {}", invalid_guid);
            }
        });
    }

    #[test]
    fn test_generate_random_guid_format() {
        let guid = generate_random_guid();
        let result = validate_guid_format(&guid);
        assert!(result.is_ok(), "随机生成的GUID应该格式正确: {}", guid);
        assert_eq!(guid.len(), 36);

        let parts: Vec<&str> = guid.split('-').collect();
        assert_eq!(parts.len(), 5);
        assert_eq!(parts[0].len(), 8);
        assert_eq!(parts[1].len(), 4);
        assert_eq!(parts[2].len(), 4);
        assert_eq!(parts[3].len(), 4);
        assert_eq!(parts[4].len(), 12);
    }

    #[test]
    fn test_generate_random_guid_uniqueness() {
        let mut guids = std::collections::HashSet::new();
        for _ in 0..100 {
            let guid = generate_random_guid();
            assert!(guids.insert(guid), "应该生成唯一的GUID");
        }
    }

    #[test]
    fn test_backup_store_has_guid() {
        with_temp_backup_dir(|_temp_dir| {
            let mut store = BackupStore::new();
            assert!(!store.has_guid("any-guid"));

            let backup1 = MachineIdBackup {
                id: "backup_1".to_string(),
                guid: "550E8400-E29B-41D4-A716-446655440000".to_string(),
                source: "test".to_string(),
                timestamp: 1234567890,
                description: None,
            };
            store.add_backup(backup1.clone());
            assert!(store.has_guid("550E8400-E29B-41D4-A716-446655440000"));
            assert!(!store.has_guid("different-guid"));

            let backup2 = MachineIdBackup {
                id: "backup_2".to_string(),
                guid: "12345678-1234-1234-1234-123456789012".to_string(),
                source: "test".to_string(),
                timestamp: 1234567891,
                description: None,
            };
            store.add_backup(backup2.clone());
            assert!(store.has_guid("550E8400-E29B-41D4-A716-446655440000"));
            assert!(store.has_guid("12345678-1234-1234-1234-123456789012"));
            assert!(!store.has_guid("nonexistent-guid"));
        });
    }

    #[test]
    fn test_backup_store_get_latest_backup_by_guid() {
        with_temp_backup_dir(|_temp_dir| {
            let mut store = BackupStore::new();

            let backup1 = MachineIdBackup {
                id: "backup_1".to_string(),
                guid: "550E8400-E29B-41D4-A716-446655440000".to_string(),
                source: "test".to_string(),
                timestamp: 1234567890,
                description: None,
            };
            store.add_backup(backup1.clone());

            let result = store.get_latest_backup_by_guid("550E8400-E29B-41D4-A716-446655440000");
            assert!(result.is_some());
            assert_eq!(result.unwrap().id, "backup_1");

            let result = store.get_latest_backup_by_guid("nonexistent-guid");
            assert!(result.is_none());
        });
    }

    #[test]
    fn test_duplicate_backup_skip() {
        if !cfg!(target_os = "windows") {
            return;
        }

        with_temp_backup_dir(|_temp_dir| {
            clear_all_backups().ok();

            let result1 = backup_current_machine_guid(Some("第一次备份".to_string()));
            assert!(result1.is_ok(), "第一次备份应该成功: {:?}", result1.err());
            let backup1 = result1.unwrap();
            assert_eq!(get_backup_count().unwrap(), 1);

            let result2 = backup_current_machine_guid(Some("第二次备份相同GUID".to_string()));
            match result2 {
                Ok(_) => panic!("重复备份应该失败"),
                Err(BackupError::DuplicateBackup(guid)) => {
                    assert_eq!(guid, backup1.guid);
                    println!("✅ 正确检测到重复备份: {}", guid);
                }
                Err(e) => panic!("期望 DuplicateBackup 错误，得到: {:?}", e),
            }

            assert_eq!(get_backup_count().unwrap(), 1, "备份数量应该保持不变");
        });
    }

    #[test]
    fn test_duplicate_backup_with_different_guid() {
        if !cfg!(target_os = "windows") {
            return;
        }

        with_temp_backup_dir(|_temp_dir| {
            clear_all_backups().ok();

            let original_guid = read_machine_guid().unwrap();

            let result1 = backup_current_machine_guid(Some("第一次备份".to_string()));
            assert!(result1.is_ok());
            let _backup1 = result1.unwrap();

            let test_guid = "550E8400-E29B-41D4-A716-446655440000";
            let write_result = write_machine_guid(test_guid, Some("切换到测试GUID".to_string()));

            if let Err(BackupError::RegistryWriteError(_)) = write_result {
                println!("⚠️ 跳过测试: 需要管理员权限");
                return;
            }

            assert!(write_result.is_ok());

            let result2 = backup_current_machine_guid(Some("备份测试GUID".to_string()));
            assert!(result2.is_ok());
            let backup2 = result2.unwrap();
            assert_eq!(backup2.guid, test_guid);

            assert_eq!(get_backup_count().unwrap(), 2);

            let restore_result = write_machine_guid(&original_guid.guid, None);
            assert!(restore_result.is_ok());
        });
    }

    #[test]
    fn test_check_admin_permissions() {
        let result = check_admin_permissions();
        if cfg!(target_os = "windows") {
            println!("管理员权限检测结果: {}", result);
        } else {
            assert!(!result);
        }
    }

    #[test]
    fn test_test_registry_write_access() {
        let result = test_registry_write_access();
        if cfg!(target_os = "windows") {
            match result {
                Ok(_) => println!("✅ 注册表写入权限可用"),
                Err(BackupError::InsufficientPermissions) => {
                    println!("⚠️ 注册表写入权限不可用（预期在非管理员模式）")
                }
                Err(e) => println!("⚠️ 注册表访问错误: {:?}", e),
            }
        } else {
            assert!(result.is_err());
        }
    }

    #[test]
    fn test_backup_error_messages() {
        assert_eq!(
            BackupError::InsufficientPermissions.to_string(),
            "权限不足，需要管理员权限才能修改注册表"
        );
        assert_eq!(
            BackupError::DuplicateBackup("test-guid".to_string()).to_string(),
            "机器码 test-guid 已存在备份，跳过重复备份"
        );
    }

    #[test]
    fn test_backup_duplicate_detection_data_driven() {
        #[derive(Debug)]
        struct DuplicateTestCase {
            name: String,
            existing_guids: Vec<&'static str>,
            new_guid: &'static str,
            should_skip: bool,
        }

        let test_cases = vec![
            DuplicateTestCase {
                name: "空列表，无重复".to_string(),
                existing_guids: vec![],
                new_guid: "550E8400-E29B-41D4-A716-446655440000",
                should_skip: false,
            },
            DuplicateTestCase {
                name: "存在相同GUID，重复".to_string(),
                existing_guids: vec!["550E8400-E29B-41D4-A716-446655440000"],
                new_guid: "550E8400-E29B-41D4-A716-446655440000",
                should_skip: true,
            },
            DuplicateTestCase {
                name: "存在不同GUID，不重复".to_string(),
                existing_guids: vec!["12345678-1234-1234-1234-123456789012"],
                new_guid: "550E8400-E29B-41D4-A716-446655440000",
                should_skip: false,
            },
            DuplicateTestCase {
                name: "多个不同GUID，不重复".to_string(),
                existing_guids: vec![
                    "12345678-1234-1234-1234-123456789012",
                    "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF",
                ],
                new_guid: "550E8400-E29B-41D4-A716-446655440000",
                should_skip: false,
            },
            DuplicateTestCase {
                name: "多个中有一个相同，重复".to_string(),
                existing_guids: vec![
                    "12345678-1234-1234-1234-123456789012",
                    "550E8400-E29B-41D4-A716-446655440000",
                ],
                new_guid: "550E8400-E29B-41D4-A716-446655440000",
                should_skip: true,
            },
        ];

        for case in test_cases {
            let mut store = BackupStore::new();
            for guid in &case.existing_guids {
                let backup = MachineIdBackup {
                    id: format!("backup_{}", guid),
                    guid: guid.to_string(),
                    source: "test".to_string(),
                    timestamp: 1234567890,
                    description: None,
                };
                store.add_backup(backup);
            }

            let has_duplicate = store.has_guid(case.new_guid);
            assert_eq!(
                has_duplicate, case.should_skip,
                "测试用例 '{}' 失败: has_duplicate={}, expected should_skip={}",
                case.name, has_duplicate, case.should_skip
            );
            println!("✅ 测试用例通过: {}", case.name);
        }
    }

    #[test]
    fn test_generate_random_machine_guid() {
        if !cfg!(target_os = "windows") {
            return;
        }

        with_temp_backup_dir(|_temp_dir| {
            clear_all_backups().ok();

            let original_guid = read_machine_guid().unwrap();

            let result = generate_random_machine_guid(None);

            if let Err(BackupError::RegistryWriteError(_)) = result {
                println!("⚠️ 跳过注册表写入测试: 需要管理员权限");
                return;
            }

            assert!(result.is_ok(), "生成随机GUID应该成功: {:?}", result.err());

            let new_guid = read_machine_guid().unwrap();
            assert_ne!(
                new_guid.guid, original_guid.guid,
                "新GUID应该与原始GUID不同"
            );

            let parts: Vec<&str> = new_guid.guid.split('-').collect();
            assert_eq!(parts.len(), 5);

            let backups = list_backups().unwrap();
            assert!(!backups.is_empty(), "应该存在备份记录");

            let restore_result = write_machine_guid(&original_guid.guid, None);
            assert!(restore_result.is_ok());

            let restored_guid = read_machine_guid().unwrap();
            assert_eq!(restored_guid.guid, original_guid.guid);
        });
    }
}
