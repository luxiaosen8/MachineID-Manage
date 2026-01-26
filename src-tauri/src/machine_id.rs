use winreg::enums::*;
use winreg::RegKey;

/// MachineID 错误类型
#[derive(Debug, thiserror::Error)]
pub enum MachineIdError {
    #[error("注册表读取失败: {0}")]
    RegistryError(String),
    #[error("MachineGuid 值不存在")]
    NotFound,
    #[error("MachineGuid 值解析失败: {0}")]
    ParseError(String),
}

/// MachineID 结构体
#[derive(Debug, Clone)]
pub struct MachineId {
    pub guid: String,
    pub source: String,
}

/// 从 Windows 注册表读取 MachineGuid
/// 
/// 注册表路径: HKLM\SOFTWARE\Microsoft\Cryptography
/// 值名称: MachineGuid
/// 
/// # Returns
/// 
/// 成功返回 MachineId，失败返回错误信息
/// 
/// # Example
/// 
/// ```rust
/// let machine_id = read_machine_guid()?;
/// println!("MachineGuid: {}", machine_id.guid);
/// ```
pub fn read_machine_guid() -> Result<MachineId, MachineIdError> {
    // 打开注册表路径
    let hkcu = RegKey::predef(HKEY_LOCAL_MACHINE);
    
    // 尝试打开 HKLM\SOFTWARE\Microsoft\Cryptography
    let crypt_path = r"SOFTWARE\Microsoft\Cryptography";
    
    let crypt_key = hkcu.open_subkey_with_flags(crypt_path, KEY_READ)
        .map_err(|e| MachineIdError::RegistryError(e.to_string()))?;
    
    // 读取 MachineGuid 值
    let machine_guid: String = crypt_key.get_value("MachineGuid")
        .map_err(|e| {
            if e.kind() == std::io::ErrorKind::NotFound {
                MachineIdError::NotFound
            } else {
                MachineIdError::RegistryError(e.to_string())
            }
        })?;
    
    // 验证 GUID 格式
    validate_guid_format(&machine_guid)?;
    
    Ok(MachineId {
        guid: machine_guid,
        source: "HKLM\\SOFTWARE\\Microsoft\\Cryptography".to_string(),
    })
}

/// 验证 GUID 格式
/// 
/// 标准的 GUID 格式: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
fn validate_guid_format(guid: &str) -> Result<(), MachineIdError> {
    let guid_pattern = regex::Regex::new(
        r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
    ).map_err(|e| MachineIdError::ParseError(e.to_string()))?;
    
    if !guid_pattern.is_match(guid) {
        return Err(MachineIdError::ParseError(
            format!("无效的 GUID 格式: {}", guid)
        ));
    }
    
    Ok(())
}

/// 获取 MachineGuid 的纯字节表示（用于验证）
/// 
/// 返回格式: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"（32位十六进制）
pub fn read_machine_guid_bytes() -> Result<String, MachineIdError> {
    let machine_id = read_machine_guid()?;
    
    // 移除连字符
    let bytes: String = machine_id.guid
        .chars()
        .filter(|c| *c != '-')
        .collect();
    
    Ok(bytes)
}

#[cfg(test)]
mod tests {
    use super::*;
    
    /// 测试读取 MachineGuid
    #[test]
    fn test_read_machine_guid() {
        let result = read_machine_guid();
        
        // 在 Windows 系统上应该能成功读取
        // 在非 Windows 系统上应该返回错误
        if cfg!(target_os = "windows") {
            assert!(result.is_ok(), "应该能成功读取 MachineGuid: {:?}", result.err());
            let machine_id = result.unwrap();
            assert!(!machine_id.guid.is_empty(), "MachineGuid 不应为空");
            assert_eq!(machine_id.guid.len(), 36, "MachineGuid 长度应为36（含连字符）");
        } else {
            assert!(result.is_err(), "非 Windows 系统应该返回错误");
        }
    }
    
    /// 测试 GUID 格式验证
    #[test]
    fn test_guid_format_validation() {
        // 有效 GUID
        assert!(validate_guid_format("00000000-0000-0000-0000-000000000000").is_ok());
        assert!(validate_guid_format("12345678-1234-1234-1234-123456789012").is_ok());
        
        // 无效 GUID
        assert!(validate_guid_format("invalid-guid-format").is_err());
        assert!(validate_guid_format("12345678123412341234123456789012").is_err()); // 无连字符
        assert!(validate_guid_format("").is_err());
    }
    
    /// 测试读取纯字节格式
    #[test]
    fn test_read_machine_guid_bytes() {
        if cfg!(target_os = "windows") {
            let result = read_machine_guid_bytes();
            assert!(result.is_ok(), "应该能成功读取 MachineGuid 字节: {:?}", result.err());
            let bytes = result.unwrap();
            assert_eq!(bytes.len(), 32, "纯字节长度应为32");
            assert!(bytes.chars().all(|c| c.is_ascii_hexdigit()), "所有字符应为十六进制");
        }
    }
}
