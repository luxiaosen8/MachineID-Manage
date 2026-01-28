# MachineID-Manage 多平台兼容性审查报告

## 审查日期
2026-01-28

## 审查范围
- 前端界面渲染 (HTML/CSS/JS)
- 后端服务逻辑 (Rust)
- Tauri 配置
- 第三方依赖库
- CI/CD 工作流

---

## 1. 前端代码兼容性分析

### 1.1 HTML (index.html)
**状态**: 良好

**发现的问题**:
- 硬编码中文语言属性 `<html lang="zh-CN">`，应动态设置
- 版本号硬编码为 `0.1.0`，与实际版本 `1.4.0` 不一致

**修复建议**:
```html
<!-- 建议动态设置语言 -->
<html lang="en"> <!-- 默认英文，通过 JS 动态切换 -->

<!-- 版本号应与 Cargo.toml 保持一致 -->
<span data-i18n="footer.version" data-version="1.4.0">版本 1.4.0</span>
```

### 1.2 CSS (style.css)
**状态**: 良好

**兼容性评估**:
- 使用现代 CSS 特性（flexbox、grid、自定义属性）
- 已考虑跨平台字体栈：`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`
- 滚动条样式使用 `::-webkit-scrollbar`，在 Firefox 上不支持

**修复建议**:
```css
/* 添加 Firefox 滚动条支持 */
* {
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.05);
}
```

### 1.3 JavaScript (script.js)
**状态**: 需要改进

**发现的问题**:

#### 问题 1: Windows 特定的权限提升代码
**位置**: 第 98-140 行

```javascript
// 当前实现仅支持 Windows PowerShell
await shell.sidecar('shell').execute(`powershell.exe -Command "Start-Process '${appPath}' -Verb RunAs"`);
```

**影响**: macOS 和 Linux 上无法使用管理员权限重启功能

**修复方案**:
```javascript
async function requestAdminRestart() {
    if (!window.__TAURI__) {
        alert(_('alert.permissionRequired'));
        return;
    }

    const platform = await window.__TAURI__.os.platform();
    
    try {
        const { app } = window.__TAURI__.core;
        const appPath = await app.getPath('exe');

        switch (platform) {
            case 'win32':
                // Windows: 使用 PowerShell
                const { Command } = await import('@tauri-apps/plugin-shell');
                const command = await Command.create('powershell.exe', [
                    '-Command', 
                    `Start-Process '${appPath}' -Verb RunAs`
                ]);
                await command.execute();
                break;
                
            case 'darwin':
                // macOS: 使用 osascript
                const { Command: MacCommand } = await import('@tauri-apps/plugin-shell');
                const macCmd = await MacCommand.create('osascript', [
                    '-e', 
                    `do shell script "${appPath}" with administrator privileges`
                ]);
                await macCmd.execute();
                break;
                
            case 'linux':
                // Linux: 使用 pkexec 或 sudo
                const { Command: LinuxCommand } = await import('@tauri-apps/plugin-shell');
                const linuxCmd = await LinuxCommand.create('pkexec', [appPath]);
                await linuxCmd.execute();
                break;
                
            default:
                throw new Error(`Unsupported platform: ${platform}`);
        }
        
        await app.exit(0);
    } catch (error) {
        console.error('Failed to restart with elevated privileges:', error);
        alert(_('alert.autoRestartFailed'));
    }
}
```

#### 问题 2: 硬编码的 Windows 注册表路径
**位置**: 第 8 行

```javascript
const MOCK_REGISTRY_SOURCE = 'HKLM\\SOFTWARE\\Microsoft\\Cryptography';
```

**影响**: 这是 Windows 特定的路径，在其他平台上无意义

**修复方案**:
```javascript
// 根据平台返回不同的模拟数据源
function getMockRegistrySource() {
    const platform = navigator.platform.toLowerCase();
    if (platform.includes('win')) {
        return 'HKLM\\SOFTWARE\\Microsoft\\Cryptography';
    } else if (platform.includes('mac') || platform.includes('darwin')) {
        return '/Library/Preferences/com.apple.machine-id';
    } else {
        return '/etc/machine-id';
    }
}
```

#### 问题 3: 版本号不一致
**位置**: 第 6 行

```javascript
const APP_VERSION = '0.1.0';
```

**修复方案**:
```javascript
// 从 Tauri 配置或环境变量读取版本
const APP_VERSION = window.__TAURI__?.app?.getVersion ? 
    await window.__TAURI__.app.getVersion() : '1.4.0';
```

### 1.4 i18n (index.js)
**状态**: 良好

**兼容性评估**:
- 支持的语言列表：en, zh-CN, zh
- 语言检测逻辑完善
- 支持回退到默认语言

**改进建议**:
- 添加更多语言支持（如日语、韩语、德语等）
- 考虑使用 Intl API 进行更精确的本地化

---

## 2. 后端 Rust 代码兼容性分析

### 2.1 main.rs
**状态**: 良好

**兼容性评估**:
- 所有 Tauri 命令都返回统一的结果结构
- 错误处理完善

### 2.2 machine_id.rs
**状态**: 需要改进

**发现的问题**:

#### 问题 1: Windows 特定的注册表操作
**位置**: 第 6-9 行, 104-114 行, 117-136 行等

```rust
#[cfg(windows)]
use winreg::enums::*;
#[cfg(windows)]
use winreg::RegKey;
```

**当前实现**:
- Windows: 完整的注册表操作
- macOS/Linux: 返回 `UnsupportedPlatform` 错误

**修复方案**:
为 macOS 和 Linux 实现平台特定的机器码读取逻辑：

```rust
// 为 macOS 实现
#[cfg(target_os = "macos")]
pub fn read_machine_guid() -> Result<MachineId, BackupError> {
    // macOS 使用 IOPlatformUUID
    let output = std::process::Command::new("ioreg")
        .args(&["-rd1", "-c", "IOPlatformExpertDevice"])
        .output()
        .map_err(|e| BackupError::RegistryError(e.to_string()))?;
    
    let output_str = String::from_utf8_lossy(&output.stdout);
    // 解析 IOPlatformUUID
    // ...
}

// 为 Linux 实现
#[cfg(target_os = "linux")]
pub fn read_machine_guid() -> Result<MachineId, BackupError> {
    // Linux 使用 /etc/machine-id 或 /var/lib/dbus/machine-id
    let machine_id = fs::read_to_string("/etc/machine-id")
        .or_else(|_| fs::read_to_string("/var/lib/dbus/machine-id"))
        .map_err(|e| BackupError::RegistryError(e.to_string()))?;
    
    Ok(MachineId {
        guid: machine_id.trim().to_string(),
        source: "/etc/machine-id".to_string(),
    })
}
```

#### 问题 2: 管理员权限检查仅支持 Windows
**位置**: 第 104-114 行

```rust
#[cfg(windows)]
pub fn check_admin_permissions() -> bool {
    // Windows 实现
}

#[cfg(not(windows))]
pub fn check_admin_permissions() -> bool {
    false  // 始终返回 false
}
```

**修复方案**:
```rust
#[cfg(target_os = "macos")]
pub fn check_admin_permissions() -> bool {
    // 检查是否为 root 用户
    unsafe {
        libc::getuid() == 0
    }
}

#[cfg(target_os = "linux")]
pub fn check_admin_permissions() -> bool {
    // 检查是否为 root 用户
    unsafe {
        libc::getuid() == 0
    }
}
```

---

## 3. Tauri 配置兼容性

### 3.1 tauri.conf.json
**状态**: 需要改进

**发现的问题**:

#### 问题 1: 窗口配置仅考虑桌面端
**当前配置**:
```json
"windows": [{
    "title": "MachineID-Manage",
    "width": 800,
    "height": 600,
    "resizable": true,
    "fullscreen": false
}]
```

**修复建议**:
添加平台特定的窗口配置：

```json
{
  "app": {
    "windows": [
      {
        "title": "MachineID-Manage",
        "width": 800,
        "height": 600,
        "minWidth": 600,
        "minHeight": 400,
        "resizable": true,
        "fullscreen": false,
        "decorations": true,
        "transparent": false,
        "alwaysOnTop": false,
        "visible": true,
        "center": true
      }
    ]
  }
}
```

#### 问题 2: 图标配置
**当前配置**:
```json
"icon": [
  "icons/32x32.png",
  "icons/128x128.png",
  "icons/128x128@2x.png",
  "icons/icon.icns",
  "icons/icon.ico"
]
```

**评估**: 图标配置完整，支持 Windows (.ico)、macOS (.icns) 和 Linux (.png)

---

## 4. 依赖库兼容性分析

### 4.1 Cargo.toml 依赖

| 依赖库 | 版本 | Windows | macOS | Linux | 备注 |
|--------|------|---------|-------|-------|------|
| tauri | 2.x | ✅ | ✅ | ✅ | 跨平台支持 |
| serde | 1.x | ✅ | ✅ | ✅ | 跨平台支持 |
| serde_json | 1.x | ✅ | ✅ | ✅ | 跨平台支持 |
| thiserror | 1.x | ✅ | ✅ | ✅ | 跨平台支持 |
| anyhow | 1.x | ✅ | ✅ | ✅ | 跨平台支持 |
| regex | 1.10 | ✅ | ✅ | ✅ | 跨平台支持 |
| rand | 0.8 | ✅ | ✅ | ✅ | 跨平台支持 |
| winreg | 0.50 | ✅ | ❌ | ❌ | Windows 专用 |
| tempfile | 3.x | ✅ | ✅ | ✅ | 开发依赖 |

### 4.2 依赖问题

**问题**: `winreg` 是 Windows 专用库

**解决方案**:
```toml
[target.'cfg(windows)'.dependencies]
winreg = "0.50"

[target.'cfg(target_os = "macos")'.dependencies]
# 添加 macOS 特定依赖

[target.'cfg(target_os = "linux")'.dependencies]
# 添加 Linux 特定依赖
```

---

## 5. CI/CD 工作流兼容性

### 5.1 release.yml
**状态**: 良好

**当前支持**:
- ✅ Windows (windows-latest)
- ✅ macOS (macos-latest)
- ✅ Linux (ubuntu-latest)

**改进建议**:
1. 添加 `continue-on-error: true` 已在 macOS 和 Linux 任务中添加
2. 为 macOS 添加代码签名配置
3. 为 Windows 添加 EV 证书签名

---

## 6. 兼容性测试清单

### 6.1 功能测试

| 功能 | Windows | macOS | Linux | 测试状态 |
|------|---------|-------|-------|----------|
| 读取机器码 | ✅ | ❌ | ❌ | 待实现 |
| 写入机器码 | ✅ | ❌ | ❌ | 待实现 |
| 备份功能 | ✅ | ✅ | ✅ | 通过 |
| 恢复备份 | ✅ | ❌ | ❌ | 待实现 |
| 随机生成 | ✅ | ❌ | ❌ | 待实现 |
| 权限检查 | ✅ | ❌ | ❌ | 待实现 |
| 管理员重启 | ✅ | ❌ | ❌ | 待实现 |
| 界面渲染 | ✅ | ✅ | ✅ | 通过 |
| 国际化 | ✅ | ✅ | ✅ | 通过 |

### 6.2 平台特定测试

#### Windows 测试项
- [x] Windows 10/11 安装
- [x] Windows 便携版运行
- [x] 注册表读写
- [x] 管理员权限提升
- [x] MSI 安装包
- [x] NSIS 安装包

#### macOS 测试项
- [ ] DMG 打包
- [ ] 代码签名
- [ ] 公证 (Notarization)
- [ ] IOPlatformUUID 读取
- [ ] 管理员权限获取
- [ ] 应用沙盒

#### Linux 测试项
- [ ] AppImage 打包
- [ ] DEB 包安装
- [ ] RPM 包安装
- [ ] /etc/machine-id 读取
- [ ] pkexec 权限提升
- [ ] 桌面集成

---

## 7. 修复优先级

### 高优先级 (必须修复)
1. **后端多平台支持**: 为 macOS 和 Linux 实现机器码读取/写入
2. **前端权限提升**: 实现跨平台的管理员权限获取
3. **版本号同步**: 统一所有文件中的版本号

### 中优先级 (建议修复)
4. **CSS 滚动条**: 添加 Firefox 支持
5. **HTML 语言属性**: 动态设置语言
6. **管理员权限检查**: 为 macOS/Linux 实现权限检查

### 低优先级 (可选优化)
7. **更多语言支持**: 添加日语、韩语等
8. **CI/CD 优化**: 添加代码签名
9. **测试覆盖**: 添加自动化跨平台测试

---

## 8. 修复代码实现

### 8.1 创建平台抽象模块

创建 `src-tauri/src/platform/mod.rs`:

```rust
pub mod machine_id;
pub mod permissions;

#[cfg(target_os = "windows")]
pub mod windows;

#[cfg(target_os = "macos")]
pub mod macos;

#[cfg(target_os = "linux")]
pub mod linux;
```

### 8.2 更新 Cargo.toml

添加平台特定依赖:

```toml
[target.'cfg(target_os = "macos")'.dependencies]
libc = "0.2"

[target.'cfg(target_os = "linux")'.dependencies]
libc = "0.2"
```

### 8.3 前端平台检测

在 `script.js` 中添加:

```javascript
async function getPlatform() {
    if (window.__TAURI__) {
        const { platform } = await import('@tauri-apps/plugin-os');
        return await platform();
    }
    return 'web';
}

async function isFeatureSupported(feature) {
    const platform = await getPlatform();
    const supportedFeatures = {
        'windows': ['read', 'write', 'backup', 'restore', 'random'],
        'macos': ['backup'], // 暂时只支持备份
        'linux': ['backup'], // 暂时只支持备份
        'web': []
    };
    return supportedFeatures[platform]?.includes(feature) || false;
}
```

---

## 9. 总结

### 当前状态
- **Windows**: 功能完整，运行良好
- **macOS**: 仅支持备份功能，需要实现机器码读取/写入
- **Linux**: 仅支持备份功能，需要实现机器码读取/写入

### 建议的发布策略
1. **v1.4.0**: 仅发布 Windows 版本，标记为 Windows-only
2. **v1.5.0**: 添加 macOS 支持
3. **v1.6.0**: 添加 Linux 支持

### 工作量估算
- macOS 支持: 2-3 天
- Linux 支持: 2-3 天
- 测试和优化: 2-3 天

---

## 附录: 参考文档

- [Tauri 跨平台最佳实践](https://tauri.app/v1/guides/building/cross-platform/)
- [macOS 机器码获取](https://developer.apple.com/documentation/iokit)
- [Linux machine-id](https://www.freedesktop.org/software/systemd/man/machine-id.html)
- [Windows Registry API](https://docs.microsoft.com/en-us/windows/win32/api/winreg/)
