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

## 平台兼容性

### 功能兼容性矩阵

| 功能 | Windows | macOS | Linux | 备注 |
|:----:|:-------:|:-----:|:-----:|------|
| 读取机器码 | ✅ | ✅ | ✅ | 全平台支持 |
| 写入机器码 | ✅ | ❌ | ✅ | macOS 暂不支持写入（系统限制） |
| 备份功能 | ✅ | ✅ | ✅ | 全平台支持 |
| 恢复备份 | ✅ | ❌ | ✅ | macOS 暂不支持恢复 |
| 随机生成 | ✅ | ❌ | ❌ | 仅 Windows 支持 |
| 权限检查 | ✅ | ✅ | ✅ | 全平台支持 |
| 管理员重启 | ✅ | ✅ | ✅ | 全平台支持 |
| 界面渲染 | ✅ | ✅ | ✅ | 全平台支持 |
| 国际化 | ✅ | ✅ | ✅ | 全平台支持 |

### 平台说明

- **Windows**: 完整功能可用。修改注册表需要管理员权限。
- **macOS**: 支持读取和备份功能。不支持写入操作，因为 macOS 系统限制了对硬件 UUID 的修改。
- **Linux**: 支持读取和备份功能。写入操作需要 root 权限。

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

---

## 开发

### 环境准备

- **Rust** 1.70+ ([安装 Rust](https://rustup.rs/))
- **Node.js** 18+ ([安装 Node.js](https://nodejs.org/))
- **Tauri CLI**: `cargo install tauri-cli`

### 项目设置

```bash
# 克隆仓库
git clone https://github.com/luxiaosen8/MachineID-Manage.git
cd MachineID-Manage

# 安装依赖
npm install

# 开发模式运行（需要管理员权限）
npm run tauri dev

# 构建生产版本
npm run tauri build
```

---

## 技术架构

### 技术栈

- **后端**: Rust + Tauri 2
- **前端**: HTML5 + CSS3 + JavaScript (原生)
- **注册表操作**: winreg (Windows Registry API)
- **构建工具**: Tauri CLI
- **包管理器**: npm

### 项目结构

```
MachineID-Manage/
├── src/                    # 前端源代码
│   ├── index.html         # 主 HTML 文件
│   ├── style.css          # 样式表
│   ├── script.js          # JavaScript 逻辑
│   └── i18n/              # 国际化
│       ├── index.js       # i18n 核心
│       ├── en.json        # 英文翻译
│       └── zh-CN.json     # 中文翻译
├── src-tauri/             # Rust 后端
│   ├── src/
│   │   ├── main.rs        # 应用入口
│   │   ├── lib.rs         # 库导出
│   │   ├── machine_id.rs  # 机器码操作
│   │   └── commands.rs    # Tauri 命令
│   ├── Cargo.toml         # Rust 依赖
│   └── tauri.conf.json    # Tauri 配置
├── docs/                  # 文档
└── README.md              # 本文件
```

---

## 安全说明

⚠️ **重要安全提示**

- 本工具会修改 Windows 注册表设置。修改前请务必备份。
- 修改注册表需要管理员权限。
- 应用程序会对所有 GUID 输入进行验证，防止无效条目。
- 所有备份数据以 JSON 格式本地存储。

---

## 贡献指南

欢迎提交问题和改进建议！

### 开发规范

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

---

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件。

---

## 致谢

- [Tauri](https://tauri.app/) - 构建更小、更快、更安全的桌面应用
- [Rust](https://www.rust-lang.org/) - 一门赋予每个人构建可靠高效软件能力的语言
- [winreg](https://docs.rs/winreg/) - Rust Windows 注册表访问库

---

## 支持

如有问题或建议，请在 GitHub 上 [提交 Issue](https://github.com/luxiaosen8/MachineID-Manage/issues)。

---

<div align="center">

**[⬆ 返回顶部](#机器码管理器--machineid-manage)**

用 ❤️ 和 AI 制作

</div>
