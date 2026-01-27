# MachineID-Manage / 机器码管理器

<div align="center">

![MachineID-Manage](src-tauri/icons/icon.png)

**English** | [中文](#中文说明)

*A Windows MachineGuid Manager built with Rust + Tauri 2*

*基于 Rust + Tauri 2 的 Windows 机器码管理器*

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Rust](https://img.shields.io/badge/Rust-1.70+-orange.svg)](https://www.rust-lang.org/)
[![Tauri](https://img.shields.io/badge/Tauri-2-blue.svg)](https://tauri.app/)
[![Windows](https://img.shields.io/badge/Windows-10/11-blue.svg)]()

</div>

---

## 项目简介 / Project Overview

### English

MachineID-Manage is a Windows MachineGuid management tool developed primarily using **Rust + Tauri 2**. It enables users to read, backup, replace, and randomly generate Windows MachineGuid identifiers. The application provides a user-friendly graphical interface for performing system registry operations safely and efficiently.

This project was entirely developed by **AI** and cannot guarantee complete functionality or freedom from bugs. Testing has been primarily conducted on **Windows 11**, and compatibility with other Windows versions is not guaranteed.

### 中文

MachineID-Manage 是一款基于 **Rust + Tauri 2** 开发的 Windows 机器码管理工具。它使能够读取、备份、替换和随机生成 Windows MachineGuid（机器码标识符）。该应用程序提供友好的图形界面，帮助用户安全高效地执行系统注册表操作。

本项目**全程由 AI 开发**，无法保证功能性完善及无 BUG。项目已在 **Windows 11** 下测试有效，其他系统版本请自行测试。

---

## 功能特性 / Features

| Feature | 功能 | Description | 说明 |
|---------|------|-------------|------|
| 📖 | 读取机器码 | Read MachineGuid from Windows Registry | 从 Windows 注册表读取 MachineGuid |
| 💾 | 备份管理 | Backup and manage machine IDs | 备份和管理机器码配置 |
| 🔄 | 恢复备份 | Restore machine ID from backup | 从备份恢复机器码 |
| 🎲 | 随机生成 | Generate random valid GUID | 生成随机有效的 GUID |
| 🔧 | 自定义替换 | Replace with custom MachineGuid | 使用自定义机器码替换 |
| 📋 | 复制功能 | One-click copy to clipboard | 一键复制机器码到剪贴板 |

---

## 使用说明 / Usage Guide

### 系统要求 / System Requirements

| Requirement | 要求 | Details | 详情 |
|-------------|------|---------|------|
| Operating System | 操作系统 | Windows 10/11 | Windows 10/11 |
| Rust | Rust | Version 1.70+ | 1.70 或更高版本 |
| Node.js | Node.js | Version 18+ (for development) | 18+（用于开发） |
| Administrator Rights | 管理员权限 | Required for registry modification | 修改注册表时需要 |

### 快速开始 / Quick Start

```bash
# 1. 克隆仓库 / Clone the repository
git clone https://github.com/Trae-ai/MachineID-Manage.git
cd MachineID-Manage

# 2. 安装依赖 / Install dependencies
npm install

# 3. 启动开发模式 / Start development server
cargo tauri dev

# 4. 构建生产版本 / Build production version
cargo tauri build
```

### 操作说明 / Operations Guide

1. **读取机器码** - 点击"读取机器码"按钮获取当前 MachineGuid
2. **备份机器码** - 点击"备份"保存当前机器码到本地存储
3. **随机生成** - 点击"随机生成"创建新的随机 GUID 并替换
4. **自定义替换** - 输入有效的 GUID 格式并确认替换
5. **恢复备份** - 在备份列表中选择备份项并点击恢复

---

## 项目结构 / Project Structure

```
MachineID-Manage/
├── src-tauri/                # Tauri 后端 (Rust)
│   ├── src/
│   │   ├── main.rs          # Tauri 命令入口 / Command entry point
│   │   └── machine_id.rs    # 机器码读写逻辑 / Machine ID operations
│   ├── Cargo.toml           # Rust 依赖配置
│   ├── tauri.conf.json      # Tauri 配置
│   └── icons/               # 应用图标
├── src/                     # 前端源码
│   ├── index.html           # 主页面 / Main page
│   ├── style.css            # 样式文件 / Styles
│   └── script.js            # 交互逻辑 / Client-side logic
├── scripts/                 # 工具脚本
│   └── create-portable.ps1  # 免安装包制作脚本
├── tests/                   # 测试文件
├── AGENTS.md               # 项目开发规范
├── LICENSE                 # 英文开源许可证
├── LICENSE.zh-CN           # 中文开源许可证
├── DISCLAIMER.md           # 免责声明
├── CONTRIBUTING.md         # 贡献指南
├── SECURITY.md             # 安全政策
└── README.md               # 本文件
```

---

## 技术栈 / Technology Stack

### 后端 / Backend

- **Rust** - 系统编程语言，提供高性能和内存安全
- **Tauri 2** - 桌面应用框架，替代 Electron 的轻量级方案
- **winreg** - Rust crate，用于 Windows 注册表操作

### 前端 / Frontend

- **HTML5** - 结构化标记语言
- **CSS3** - 样式表，提供现代化 UI
- **JavaScript** - 交互逻辑，与 Tauri 后端通信

### 开发工具 / Development Tools

- **Cargo** - Rust 包管理器
- **npm** - Node.js 包管理器
- **Git** - 版本控制

---

## API 说明 / API Reference

### Tauri Commands / Tauri 命令

```rust
// 读取机器码
#[tauri::command]
fn read_machine_id() -> Result<MachineIdInfo, String>

// 备份当前机器码
#[tauri::command]
fn backup_current_machine_guid(description: Option<String>) -> Result<Option<MachineIdBackup>, BackupError>

// 写入机器码（替换）
#[tauri::command]
fn write_machine_guid_command(new_guid: String, description: Option<String>) -> Result<WriteGuidResponse, String>

// 随机生成机器码
#[tauri::command]
fn generate_random_guid_command(description: Option<String>) -> Result<GenerateRandomGuidResponse, String>

// 删除备份
#[tauri::command]
fn delete_backup_by_id(id: String) -> Result<BackupResponse, String>

// 清空所有备份
#[tauri::command]
fn clear_all_backups() -> Result<BackupResponse, String>

// 获取备份列表
#[tauri::command]
fn get_all_backups() -> Result<Vec<MachineIdBackup>, String>

// 测试写入权限
#[tauri::command]
fn test_write_access_command() -> Result<PermissionCheckResult, String>
```

### 数据结构 / Data Structures

```rust
// 机器码信息
struct MachineIdInfo {
    guid: String,
    source: String,
}

// 备份记录
struct MachineIdBackup {
    id: String,
    guid: String,
    source: String,
    timestamp: u64,
    description: Option<String>,
}

// 备份存储
struct BackupStore {
    backups: Vec<MachineIdBackup>,
}
```

---

## 安全注意事项 / Security Notes

⚠️ **警告 / WARNING**

> **English**: Modifying the Windows Registry carries inherent risks. Always create system backups before performing any operations.
>
> **中文**: 修改 Windows 注册表存在固有风险。执行任何操作前，请务必创建系统备份。

### 安全措施 / Security Measures

| Measure | 措施 | Description | 说明 |
|---------|------|-------------|------|
| 🔒 | 权限检测 | Check administrator rights before write operations | 写入操作前检测管理员权限 |
| 💾 | 自动备份 | Automatic backup before modification | 修改前自动备份 |
| ✅ | 用户确认 | Require user confirmation for dangerous operations | 危险操作需要用户确认 |
| 📝 | 操作日志 | Log all registry modifications | 记录所有注册表修改操作 |
| 🔍 | 输入验证 | Validate GUID format before writing | 写入前验证 GUID 格式 |

### 安全建议 / Security Recommendations

1. **Always backup** - 使用前导出并保存当前 MachineGuid
2. **Test first** - 在测试环境验证操作效果
3. **Minimal permissions** - 仅在需要时授予管理员权限
4. **Verify changes** - 操作后验证系统正常运行

详见 [DISCLAIMER.md](DISCLAIMER.md) 和 [SECURITY.md](SECURITY.md)

---

## 贡献 / Contributing

我们欢迎各种形式的贡献！/ We welcome contributions in various forms!

- 🐛 报告 Bug / Report bugs
- 💡 提出建议 / Suggest features
- 📝 改进文档 / Improve documentation
- 🔧 提交修复 / Submit fixes
- ✨ 添加功能 / Add new features

详见 [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 开源协议 / Open Source License

本项目采用 **MIT 许可证** 开源。/ This project is open source under the **MIT License**.

### 许可证文件 / License Files

| File | Language | Description |
|------|----------|-------------|
| [LICENSE](LICENSE) | English | MIT License |
| [LICENSE.zh-CN](LICENSE.zh-CN) | 中文 | MIT 许可证 |
| [DISCLAIMER.md](DISCLAIMER.md) | 中文 | 免责声明 |
| [CONTRIBUTING.md](CONTRIBUTING.md) | 中文 | 贡献指南 |

### 权利与义务 / Rights and Obligations

**您可以 / You May:**
- ✅ 免费使用 / Use freely
- ✅ 修改源码 / Modify source code
- ✅ 分发软件 / Distribute software
- ✅ 商业使用 / Commercial use
- ✅ 私有使用 / Private use

**您需要 / You Must:**
- 📋 保留版权声明 / Retain copyright notice
- 📋 包含许可证副本 / Include license copy

**您不得 / You May Not:**
- ❌ 删除版权声明 / Remove copyright notice
- ❌ 用于非法用途 / Use for illegal purposes

---

## 版权声明 / Copyright Notice

```
Copyright (c) 2025 MachineID-Manage Contributors

本项目采用 MIT 许可证开源，详见 LICENSE 文件。
This project is open source under the MIT License. See LICENSE file for details.
```

---

## 联系方式 / Contact

- **GitHub**: [https://github.com/Trae-ai/MachineID-Manage](https://github.com/Trae-ai/MachineID-Manage)
- **Issues**: [https://github.com/Trae-ai/MachineID-Manage/issues](https://github.com/Trae-ai/MachineID-Manage/issues)
- **贡献指南**: [CONTRIBUTING.md](CONTRIBUTING.md)
- **安全政策**: [SECURITY.md](SECURITY.md)
- **免责声明**: [DISCLAIMER.md](DISCLAIMER.md)

---

## 致谢 / Acknowledgments

- [Tauri Team](https://tauri.app/) - For the excellent desktop framework
- [Rust Team](https://www.rust-lang.org/) - For the safe and fast programming language
- [All Contributors](https://github.com/Trae-ai/MachineID-Manage/graphs/contributors) - For your support and contributions

---

<div align="center">

**MachineID-Manage** / 机器码管理器

*Built with ❤️ by AI / 由 AI 全程开发*

</div>
