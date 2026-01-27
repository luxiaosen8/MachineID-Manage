# 机器码管理器 / MachineID-Manage

<div align="center">

![机器码管理器](src-tauri/icons/icon.png)

**[English](README.md)** | **[中文](README.zh-CN.md)**

*基于 Rust + Tauri 2 的 Windows 机器码管理器*

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Rust](https://img.shields.io/badge/Rust-1.70+-orange.svg)](https://www.rust-lang.org/)
[![Tauri](https://img.shields.io/badge/Tauri-2-blue.svg)](https://tauri.app/)
[![Windows](https://img.shields.io/badge/Windows-10/11-blue.svg)]()
[![Release](https://img.shields.io/github/v/release/luxiaosen8/MachineID-Manage)](https://github.com/luxiaosen8/MachineID-Manage/releases)

</div>

---

## 项目简介

MachineID-Manage 是一款基于 **Rust + Tauri 2** 开发的 Windows 机器码管理工具。它使能够读取、备份、替换和随机生成 Windows MachineGuid（机器码标识符）。该应用程序提供友好的图形界面，帮助用户安全高效地执行系统注册表操作。

本项目**全程由 AI 开发**，无法保证功能性完善及无 BUG。项目已在 **Windows 11** 下测试有效，其他系统版本请自行测试。

---

## 下载

### 最新版本 (v1.4.0)

| 平台 | 安装版 | 免安装版(便携版) |
|------|--------|------------------|
| Windows x64 | [MachineID-Manage_1.4.0_x64-setup.exe](https://github.com/luxiaosen8/MachineID-Manage/releases/latest) | [MachineID-Manage_1.4.0_windows_portable.zip](https://github.com/luxiaosen8/MachineID-Manage/releases/latest) |
| Windows MSI | [MachineID-Manage_1.4.0_x64_en-US.msi](https://github.com/luxiaosen8/MachineID-Manage/releases/latest) | - |

> **注意**: 所有下载均可在 [Releases](https://github.com/luxiaosen8/MachineID-Manage/releases) 页面获取。

---

## 功能特性

| 图标 | 功能 | 说明 |
|:----:|------|------|
| 📖 | 读取机器码 | 从 Windows 注册表读取 MachineGuid |
| 💾 | 备份管理 | 备份和管理机器码配置 |
| 🔄 | 恢复备份 | 从备份恢复机器码 |
| 🎲 | 随机生成 | 生成随机有效的 GUID |
| 🔧 | 自定义替换 | 使用自定义机器码替换 |
| 📋 | 复制功能 | 一键复制机器码到剪贴板 |

---

## 快速开始

### 系统要求

| 要求 | 详情 |
|------|------|
| 操作系统 | Windows 10/11 |
| Rust | 1.70 或更高版本 |
| Node.js | 18+（用于开发） |
| 管理员权限 | 修改注册表时需要 |

### 安装方法

#### 方式一：安装版（推荐）
1. 从 [Releases](https://github.com/luxiaosen8/MachineID-Manage/releases) 下载最新的 `.msi` 或 `.exe` 安装程序
2. 运行安装程序并按照向导完成安装
3. 从开始菜单启动 MachineID-Manage

#### 方式二：便携版（免安装）
1. 从 [Releases](https://github.com/luxiaosen8/MachineID-Manage/releases) 下载 `MachineID-Manage_*_windows_portable.zip`
2. 将 ZIP 文件解压到您想要的位置
3. 直接运行 `machineid-manage.exe`

#### 方式三：从源码构建
```bash
# 克隆仓库
git clone https://github.com/luxiaosen8/MachineID-Manage.git
cd MachineID-Manage

# 安装依赖
npm install

# 启动开发服务器
cargo tauri dev

# 构建生产版本
cargo tauri build
```

### 使用说明

1. **读取机器码** - 点击"读取机器码"按钮获取当前 MachineGuid
2. **备份机器码** - 点击"备份"保存当前机器码到本地存储
3. **随机生成** - 点击"随机生成"创建新的随机 GUID 并替换
4. **自定义替换** - 输入有效的 GUID 格式并确认替换
5. **恢复备份** - 在备份列表中选择备份并点击恢复

---

## 项目结构

```
MachineID-Manage/
├── src-tauri/                # Tauri 后端 (Rust)
│   ├── src/
│   │   ├── main.rs          # Tauri 命令入口
│   │   └── machine_id.rs    # 机器码读写逻辑
│   ├── Cargo.toml           # Rust 依赖配置
│   ├── tauri.conf.json      # Tauri 配置
│   └── icons/               # 应用图标
├── src/                     # 前端源码
│   ├── index.html           # 主页面
│   ├── style.css            # 样式文件
│   └── script.js            # 交互逻辑
├── tests/                   # 测试文件
├── README.md                # 项目说明（英文）
├── README.zh-CN.md          # 项目说明（中文）
├── CONTRIBUTING.md          # 贡献指南
├── LICENSE                  # MIT 开源协议
├── .github/
│   └── workflows/           # GitHub Actions CI/CD
```

---

## 技术栈

- **Rust** - 系统编程语言
- **Tauri 2** - 跨平台应用框架
- **Windows Registry** - 系统注册表操作（winreg crate）
- **HTML/CSS/JavaScript** - 前端界面

---

## 安全注意事项

> **警告**
>
> 修改 Windows 注册表存在固有风险。执行任何操作前，请务必创建系统备份。

### 安全措施

| 图标 | 措施 | 说明 |
|:----:|------|------|
| 🔒 | 权限检测 | 写入操作前检测管理员权限 |
| 💾 | 自动备份 | 修改前自动备份 |
| ✅ | 用户确认 | 危险操作需要用户确认 |
| 📝 | 操作日志 | 记录所有注册表修改操作 |
| 🔍 | 输入验证 | 写入前验证 GUID 格式 |

### 安全建议

1. **务必备份** - 使用前导出并保存当前 MachineGuid
2. **先测后用** - 在测试环境验证操作效果
3. **最小权限** - 仅在需要时授予管理员权限

---

## 更新日志

### v1.4.0 (2026-01-28)
- 修复 Tauri v2 的 GitHub Actions 工作流
- 版本更新至 1.4.0
- 改进 CI/CD 流程

### v1.3.7 (上一版本)
- 初始稳定版本
- 基础机器码管理功能
- 备份和恢复功能

---

## 贡献

欢迎贡献！请阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详情。

---

## 开源协议

本项目采用 MIT 协议开源。详情请阅读 [LICENSE](LICENSE) 文件。

---

## 联系方式

- **GitHub**: [https://github.com/luxiaosen8/MachineID-Manage](https://github.com/luxiaosen8/MachineID-Manage)
- **Issues**: [https://github.com/luxiaosen8/MachineID-Manage/issues](https://github.com/luxiaosen8/MachineID-Manage/issues)
- **Releases**: [https://github.com/luxiaosen8/MachineID-Manage/releases](https://github.com/luxiaosen8/MachineID-Manage/releases)

---

<div align="center">

**感谢使用 MachineID-Manage！**

</div>
