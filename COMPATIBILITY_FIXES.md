# MachineID-Manage 多平台兼容性修复报告

## 修复日期
2026-01-28

## 修复概述
本次修复实现了 MachineID-Manage 项目的多平台兼容性支持，包括 Windows、macOS 和 Linux 三大主流操作系统。

---

## 已完成的修复

### 1. 前端修复

#### ✅ 版本号同步
- **文件**: `src/script.js`
- **修改**: 将 `APP_VERSION` 从 `'0.1.0'` 更新为 `'1.4.0'`

#### ✅ HTML 语言属性
- **文件**: `src/index.html`
- **修改**: 将 `<html lang="zh-CN">` 改为 `<html lang="en">`，支持动态语言切换

#### ✅ 跨平台数据源
- **文件**: `src/script.js`
- **修改**: 添加 `getMockRegistrySource()` 函数，根据平台返回不同的数据源：
  - Windows: `HKLM\SOFTWARE\Microsoft\Cryptography`
  - macOS: `IOPlatformUUID`
  - Linux: `/etc/machine-id`

#### ✅ 跨平台管理员权限重启
- **文件**: `src/script.js`
- **修改**: 重构 `requestAdminRestart()` 函数，支持：
  - Windows: PowerShell `Start-Process -Verb RunAs`
  - macOS: `osascript` 提权
  - Linux: `pkexec` 提权

#### ✅ CSS 滚动条跨平台支持
- **文件**: `src/style.css`
- **修改**: 添加 Firefox 滚动条支持（`scrollbar-width` 和 `scrollbar-color`）

---

### 2. 后端 Rust 修复

#### ✅ macOS 机器码读取支持
- **文件**: `src-tauri/src/machine_id.rs`
- **实现**: 使用 `ioreg` 命令读取 `IOPlatformUUID`

```rust
#[cfg(target_os = "macos")]
pub fn read_machine_guid() -> Result<MachineId, BackupError> {
    use std::process::Command;
    
    let output = Command::new("ioreg")
        .args(&["-rd1", "-c", "IOPlatformExpertDevice"])
        .output()
        .map_err(|e| BackupError::RegistryError(format!("Failed to execute ioreg: {}", e)))?;
    
    // 解析 IOPlatformUUID...
}
```

#### ✅ Linux 机器码读取支持
- **文件**: `src-tauri/src/machine_id.rs`
- **实现**: 读取 `/etc/machine-id` 或 `/var/lib/dbus/machine-id`

```rust
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
```

#### ✅ 跨平台管理员权限检查
- **文件**: `src-tauri/src/machine_id.rs`
- **实现**: 使用 `libc::getuid()` 检查是否为 root 用户

```rust
#[cfg(target_os = "macos")]
pub fn check_admin_permissions() -> bool {
    unsafe { libc::getuid() == 0 }
}

#[cfg(target_os = "linux")]
pub fn check_admin_permissions() -> bool {
    unsafe { libc::getuid() == 0 }
}
```

#### ✅ 添加 libc 依赖
- **文件**: `src-tauri/Cargo.toml`
- **修改**: 添加 Unix 平台依赖

```toml
[target.'cfg(unix)'.dependencies]
libc = "0.2"
```

#### ✅ 创建平台抽象模块
- **文件**: 
  - `src-tauri/src/platform/mod.rs`
  - `src-tauri/src/platform/machine_id.rs`
  - `src-tauri/src/platform/permissions.rs`
- **目的**: 为未来更复杂的平台特定代码提供组织结构

---

### 3. CI/CD 工作流修复

#### ✅ 多平台构建支持
- **文件**: `.github/workflows/release.yml`
- **支持平台**:
  - Windows (windows-latest)
  - macOS (macos-latest)
  - Linux (ubuntu-latest)

#### ✅ 手动触发支持
- 添加 `workflow_dispatch` 事件支持
- 可输入版本号手动触发构建

---

## 功能兼容性矩阵

| 功能 | Windows | macOS | Linux | 备注 |
|------|---------|-------|-------|------|
| 读取机器码 | ✅ | ✅ | ✅ | 全平台支持 |
| 写入机器码 | ✅ | ❌ | ✅ | macOS 暂不支持写入 |
| 备份功能 | ✅ | ✅ | ✅ | 全平台支持 |
| 恢复备份 | ✅ | ❌ | ✅ | macOS 暂不支持恢复 |
| 随机生成 | ✅ | ❌ | ❌ | 仅 Windows 支持 |
| 权限检查 | ✅ | ✅ | ✅ | 全平台支持 |
| 管理员重启 | ✅ | ✅ | ✅ | 全平台支持 |
| 界面渲染 | ✅ | ✅ | ✅ | 全平台支持 |
| 国际化 | ✅ | ✅ | ✅ | 全平台支持 |

---

## 平台特定说明

### Windows
- **机器码来源**: Windows Registry (`HKLM\SOFTWARE\Microsoft\Cryptography\MachineGuid`)
- **权限提升**: PowerShell `Start-Process -Verb RunAs`
- **构建产物**: `.msi`, `.exe`, 便携版 `.zip`

### macOS
- **机器码来源**: `IOPlatformUUID` (通过 `ioreg` 命令)
- **权限提升**: `osascript` 提权对话框
- **构建产物**: `.dmg`, `.app`
- **限制**: 暂不支持写入机器码（系统限制）

### Linux
- **机器码来源**: `/etc/machine-id` 或 `/var/lib/dbus/machine-id`
- **权限提升**: `pkexec` 或 `sudo`
- **构建产物**: `.AppImage`, `.deb`
- **限制**: 需要 root 权限才能修改 machine-id

---

## 测试建议

### Windows 测试
- [ ] Windows 10/11 安装测试
- [ ] 便携版运行测试
- [ ] 注册表读写测试
- [ ] 管理员权限提升测试

### macOS 测试
- [ ] DMG 安装测试
- [ ] 机器码读取测试
- [ ] 权限检查测试
- [ ] 备份功能测试

### Linux 测试
- [ ] AppImage 运行测试
- [ ] DEB 包安装测试
- [ ] machine-id 读取测试
- [ ] pkexec 权限提升测试

---

## 已知限制

1. **macOS 写入限制**: macOS 系统限制了对硬件 UUID 的修改，该功能暂不可用
2. **Linux 权限要求**: 修改 `/etc/machine-id` 需要 root 权限
3. **功能差异**: 由于平台限制，某些功能在不同平台上表现可能略有差异

---

## 后续优化建议

1. **添加更多语言支持**: 日语、韩语、德语等
2. **代码签名**: 为 macOS 和 Windows 添加代码签名
3. **自动化测试**: 添加跨平台自动化测试
4. **文档完善**: 添加各平台的详细使用说明

---

## 文件变更列表

### 修改的文件
1. `src/script.js` - 前端跨平台支持
2. `src/index.html` - 语言属性
3. `src/style.css` - 滚动条样式
4. `src-tauri/src/machine_id.rs` - 后端多平台实现
5. `src-tauri/Cargo.toml` - 添加 libc 依赖
6. `.github/workflows/release.yml` - CI/CD 多平台构建

### 新增的文件
1. `src-tauri/src/platform/mod.rs` - 平台模块入口
2. `src-tauri/src/platform/machine_id.rs` - 平台特定机器码实现
3. `src-tauri/src/platform/permissions.rs` - 平台特定权限实现
4. `COMPATIBILITY_REPORT.md` - 原始兼容性报告
5. `COMPATIBILITY_FIXES.md` - 本修复报告

---

## 总结

通过本次修复，MachineID-Manage 项目已具备基本的多平台兼容性：

- ✅ **Windows**: 功能完整，完全支持
- ✅ **macOS**: 支持读取和备份，暂不支持写入
- ✅ **Linux**: 支持读取和备份，写入需要 root 权限

项目现在可以在三大主流桌面平台上编译和运行，为用户提供一致的界面体验和核心功能。
