# MachineID-Manage

<div align="center">

![MachineID-Manage](src-tauri/icons/icon.png)

**[English](README.md)** | **[中文](README.zh-CN.md)**

*基于 Rust + Tauri 2 + Vue 3 开发的 Windows 机器码管理器*

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Rust](https://img.shields.io/badge/Rust-1.70+-orange.svg)](https://www.rust-lang.org/)
[![Tauri](https://img.shields.io/badge/Tauri-2-blue.svg)](https://tauri.app/)
[![Vue](https://img.shields.io/badge/Vue-3-4FC08D.svg)](https://vuejs.org/)
[![Windows](https://img.shields.io/badge/Windows-10/11-blue.svg)]()
[![Release](https://img.shields.io/github/v/release/luxiaosen8/MachineID-Manage)](https://github.com/luxiaosen8/MachineID-Manage/releases)

</div>

---

## 概述

MachineID-Manage 是一款基于 **Rust + Tauri 2 + Vue 3** 开发的 Windows 机器码管理工具。它可以帮助您读取、备份、替换和随机生成 Windows MachineGuid（机器标识符）。该应用程序提供了现代化的图形界面，帮助用户安全高效地执行系统注册表操作。
⚠️ 本项目的开发流程全程由 AI 完成，暂无法对产品的功能性、安全性提供任何保证；目前仅在 Windows 11 系统下测试验证有效。

### 主要功能

- 📖 **读取机器码** - 从 Windows 注册表读取 MachineGuid
- 💾 **备份管理** - 备份和管理机器码配置，支持自定义描述
- 🔄 **恢复备份** - 从备份恢复机器码
- 🎲 **随机生成** - 生成随机有效的 GUID，支持预览
- 🔧 **自定义替换** - 使用自定义机器码替换
- 📋 **复制功能** - 一键复制机器码到剪贴板
- 🔒 **权限检测** - 实时管理员权限状态

---

## 下载

### 最新版本 (v2.2.0)

| 平台 | 安装包 | 便携版 |
|------|--------|--------|
| Windows x64 | [MachineID-Manage_2.2.0_x64-setup.exe](https://github.com/luxiaosen8/MachineID-Manage/releases/latest) | [MachineID-Manage_2.2.0_windows_portable.zip](https://github.com/luxiaosen8/MachineID-Manage/releases/latest) |
| Windows MSI | [MachineID-Manage_2.2.0_x64_en-US.msi](https://github.com/luxiaosen8/MachineID-Manage/releases/latest) | - |

> **注意**: 所有下载可在 [Releases](https://github.com/luxiaosen8/MachineID-Manage/releases) 页面获取。

---

## 功能特性

| 图标 | 功能 | 描述 |
|:----:|------|------|
| 📖 | 读取机器码 | 从 Windows 注册表读取 MachineGuid |
| 💾 | 备份管理 | 备份和管理机器码配置 |
| 📝 | 编辑描述 | 添加或编辑备份描述 |
| 🔄 | 恢复备份 | 从备份恢复机器码 |
| 🎲 | 随机生成 | 生成随机有效的 GUID，支持预览 |
| 🔧 | 自定义替换 | 使用自定义机器码替换 |
| 📋 | 复制功能 | 一键复制机器码到剪贴板 |
| 🔒 | 权限检测 | 实时管理员权限状态 |
| 🛡️ | 自动备份 | 修改前自动备份 |

---

## 技术栈

### 后端
- **Rust** - 系统编程语言
- **Tauri 2** - 跨平台应用框架
- **winreg** - Windows 注册表操作
- **tracing** - 结构化日志

### 前端
- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全的 JavaScript
- **Vite** - 下一代前端构建工具
- **Pinia** - Vue 状态管理
- **Tailwind CSS** - 实用优先的 CSS 框架
- **VueUse** - Vue 组合式工具集

---

## 快速开始

### 系统要求

| 要求 | 详情 |
|------|------|
| 操作系统 | Windows 10/11 |
| Rust | 1.70 或更高版本 |
| Node.js | 18+ (开发环境) |
| 管理员权限 | 修改注册表需要 |

### 安装方法

#### 方法 1: 安装包 (推荐)
1. 从 [Releases](https://github.com/luxiaosen8/MachineID-Manage/releases) 下载最新的 `.msi` 或 `.exe` 安装包
2. 运行安装程序并按照向导操作
3. 从开始菜单启动 MachineID-Manage

#### 方法 2: 便携版 (无需安装)
1. 从 [Releases](https://github.com/luxiaosen8/MachineID-Manage/releases) 下载 `MachineID-Manage_*_windows_portable.zip`
2. 解压 ZIP 文件到您想要的位置
3. 直接运行 `machineid-manage.exe`

> **注意**: 便携版将数据存储在应用程序目录下的 `.data` 文件夹中。

#### 方法 3: 从源码构建
```bash
# 克隆仓库
git clone https://github.com/luxiaosen8/MachineID-Manage.git
cd MachineID-Manage

# 安装依赖
npm install

# 启动开发服务器
npm run tauri:dev

# 构建生产版本
npm run tauri:build
```

### 使用说明

1. **读取机器码** - 应用启动时自动读取当前 MachineGuid
2. **备份机器码** - 点击"备份机器码"保存当前机器码
3. **编辑描述** - 点击备份项的编辑图标添加/修改描述
4. **随机生成** - 点击"随机生成"创建新的随机 GUID（确认前显示预览）
5. **自定义替换** - 输入有效的 GUID 并确认替换
6. **恢复备份** - 从备份列表选择并恢复

---

## 项目结构

```
MachineID-Manage/
├── src-tauri/                # Tauri 后端 (Rust)
│   ├── src/
│   │   ├── main.rs          # Tauri 命令入口
│   │   ├── machine_id.rs    # 机器码读写逻辑
│   │   └── platform/        # 平台特定代码
│   ├── Cargo.toml           # Rust 依赖
│   ├── tauri.conf.json      # Tauri 配置
│   └── icons/               # 应用图标
├── src/                      # Vue 3 前端
│   ├── components/          # Vue 组件
│   │   ├── ui/             # 基础 UI 组件
│   │   ├── layout/         # 布局组件
│   │   ├── features/       # 功能组件
│   │   └── modals/         # 弹窗组件
│   ├── stores/             # Pinia 状态管理
│   ├── types/              # TypeScript 类型
│   ├── utils/              # 工具函数
│   ├── styles/             # 全局样式
│   ├── App.vue             # 根组件
│   └── main.ts             # 入口文件
├── package.json            # Node.js 依赖
├── vite.config.ts          # Vite 配置
├── tsconfig.json           # TypeScript 配置
├── tailwind.config.js      # Tailwind 配置
├── README.md               # 项目文档 (英文)
├── README.zh-CN.md         # 项目文档 (中文)
├── LICENSE                 # MIT 许可证
└── .github/workflows/      # CI/CD 工作流
```

---

## 开发指南

### 常用命令

```bash
# 安装依赖
npm install

# 开发模式 (热重载)
npm run dev

# Tauri 开发模式
npm run tauri:dev

# 构建生产版本
npm run build

# Tauri 构建
npm run tauri:build

# 运行测试
npm run test

# 代码检查
npm run lint

# 代码格式化
npm run format
```

### 开发环境设置

1. 安装 [Rust](https://rustup.rs/)
2. 安装 [Node.js](https://nodejs.org/) 18+
3. 安装 Tauri CLI: `cargo install tauri-cli`
4. 克隆项目并安装依赖

---

## 安全注意事项

> **警告**
>
> 修改 Windows 注册表存在固有风险。在执行任何操作前，请务必创建系统备份。

### 安全措施

| 图标 | 措施 | 描述 |
|:----:|------|------|
| 🔒 | 权限检测 | 写入操作前检查管理员权限 |
| 💾 | 自动备份 | 修改前自动备份 |
| ✅ | 用户确认 | 危险操作需要用户确认 |
| 📝 | 操作日志 | 记录所有注册表修改操作 |
| 🔍 | 输入验证 | 写入前验证 GUID 格式 |

### 安全建议

1. **始终备份** - 使用前导出并保存当前 MachineGuid
2. **先测试** - 在测试环境中验证操作
3. **最小权限** - 仅在必要时授予管理员权限

---

## 更新日志

### v2.2.0 (2026-01-30)
- ✨ **版本自动同步** - 版本号现在从 Cargo.toml 自动同步
- 🎯 **GUID 预览一致性** - 预览值现在与实际替换值一致
- 🔄 **自动刷新备份** - 操作后自动刷新备份列表
- 📝 **编辑备份描述** - 支持编辑备份描述
- 📁 **数据存储路径** - 改为在应用程序目录下的 `.data` 文件夹中存储数据
- 🖱️ **禁用右键菜单** - 禁用浏览器右键菜单，提升原生应用体验

### v2.1.0 (2026-01-29)
- 🔧 **修复 UAC 提权问题**
- 用原生 Windows API `ShellExecuteW` 替代基于 PowerShell 的提权
- 改进 UAC 取消的错误处理
- 添加详细的错误代码和消息
- 修复管理员重启功能
- 增强稳定性和可靠性

### v2.0.0 (2026-01-29)
- 🎉 **重大重构版本**
- 前端全面升级至 Vue 3 + TypeScript
- 用 Vite 替代传统构建工具
- 引入 Pinia 状态管理
- Tailwind CSS 现代化 UI
- 完整支持 Tauri 2.0
- 添加权限可视化
- 增强用户体验

### v1.4.0 (2026-01-28)
- 修复 Tauri v2 GitHub Actions 工作流
- 版本更新至 1.4.0
- 改进 CI/CD 流程

### v1.3.7
- 初始稳定版本
- 基础机器码管理功能
- 备份和恢复功能

---

## 贡献

欢迎贡献！请阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详情。

---

## 许可证

本项目基于 MIT 许可证开源。详情请查看 [LICENSE](LICENSE) 文件。

---

## 联系方式

- **GitHub**: [https://github.com/luxiaosen8/MachineID-Manage](https://github.com/luxiaosen8/MachineID-Manage)
- **Issues**: [https://github.com/luxiaosen8/MachineID-Manage/issues](https://github.com/luxiaosen8/MachineID-Manage/issues)
- **Releases**: [https://github.com/luxiaosen8/MachineID-Manage/releases](https://github.com/luxiaosen8/MachineID-Manage/releases)

---

<div align="center">

**感谢您使用 MachineID-Manage！**

</div>
