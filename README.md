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
git clone https://github.com/luxiaosen8/MachineID-Manage.git
cd MachineID-Manage

# 2. 安装依赖 / Install dependencies
npm install

# 3. 启动开发服务器 / Start development server
cargo tauri dev

# 4. 构建生产版本 / Build production version
cargo tauri build
```

### 操作说明 / Operations Guide

1. **读取机器码** - 点击"读取机器码"按钮获取当前 MachineGuid
2. **备份机器码** - 点击"备份"保存当前机器码到本地存储
3. **随机生成** - 点击"随机生成"创建新的随机 GUID 并替换
4. **自定义替换** - 输入有效的 GUID 格式并确认替换
5. **恢复备份** - 在备份列表中选择备份并点击恢复

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
├── tests/                   # 测试文件
├── README.md                # 项目说明
├── LICENSE                  # 开源协议
└── .github/
    └── workflows/           # GitHub Actions
```

---

## 技术栈 / Tech Stack

- **Rust** - 系统编程语言
- **Tauri 2** - 跨平台应用框架
- **Windows Registry** - 系统注册表操作 (winreg crate)
- **HTML/CSS/JavaScript** - 前端界面

---

## 安全注意事项 / Security Notes

> **警告 / WARNING**
>
> Modifying the Windows Registry carries inherent risks. Always create system backups before performing any operations.
>
> 修改 Windows 注册表存在固有风险。执行任何操作前，请务必创建系统备份。

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

---

## 贡献 / Contributing

欢迎贡献！请阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详情。

### 贡献者 / Contributors

感谢所有贡献者！

---

## 开源协议 / License

本项目采用 MIT 协议开源。详情请阅读 [LICENSE](LICENSE) 文件。

---

## 联系方式 / Contact

- **GitHub**: [https://github.com/luxiaosen8/MachineID-Manage](https://github.com/luxiaosen8/MachineID-Manage)
- **Issues**: [https://github.com/luxiaosen8/MachineID-Manage/issues](https://github.com/luxiaosen8/MachineID-Manage/issues)

---

<div align="center">

**感谢使用 MachineID-Manage！**

*Thank you for using MachineID-Manage!*

</div>
