# MachineID-Manage

MachineID-Manage 是一个基于 **Rust + Tauri 2** 的 Windows 机器码管理器。

## 功能特性

- 📖 **读取机器码**: 从 Windows 注册表读取 MachineGuid
- 💾 **备份恢复**: 备份和恢复机器码配置
- 🎲 **随机生成**: 生成新的机器码
- 🔄 **自定义替换**: 手动输入替换机器码
- 📋 **操作历史**: 记录所有操作历史

## 系统要求

- Windows 10/11
- Rust 1.70+
- Node.js 18+ (用于前端开发)

## 快速开始

### 安装依赖

```bash
# 安装 Rust（如果尚未安装）
cargo install tauri-cli

# 安装 Node.js 依赖
npm install
```

### 开发模式

```bash
# 启动开发服务器
cargo tauri dev
```

### 构建生产版本

```bash
cargo tauri build
```

## 项目结构

```
MachineID-Manage/
├── src-tauri/           # Tauri 后端 (Rust)
│   ├── src/            # 源代码
│   ├── Cargo.toml      # 依赖配置
│   ├── tauri.conf.json # Tauri 配置
│   └── icons/          # 应用图标
├── src/                # 前端源码
│   ├── index.html      # 主页面
│   ├── style.css       # 样式
│   └── script.js       # 交互逻辑
├── AGENTS.md          # 项目规范
├── LICENSE            # 开源许可证
├── DISCLAIMER.md      # 免责声明
├── CONTRIBUTING.md    # 贡献指南
└── README.md          # 本文件
```

## 技术栈

- **后端**: Rust + Tauri 2
- **系统集成**: `winreg` crate（Windows 注册表操作）
- **前端**: HTML/CSS/JavaScript

## 安全注意事项

⚠️ **重要**: 修改系统注册表存在风险。使用前请：

1. 创建完整的系统备份
2. 导出当前 MachineGuid 值
3. 了解如何手动恢复注册表

详见 [DISCLAIMER.md](DISCLAIMER.md)

## 贡献

欢迎贡献代码！详见 [CONTRIBUTING.md](CONTRIBUTING.md)

## 开源协议

本项目采用 **MIT 许可证** 开源。

### 许可证文件

| 文件 | 语言 | 说明 |
|-----|------|------|
| [LICENSE](LICENSE) | English | 英文版 MIT 许可证 |
| [LICENSE.zh-CN](LICENSE.zh-CN) | 中文 | 中文版 MIT 许可证 |
| [DISCLAIMER.md](DISCLAIMER.md) | 中文 | 免责声明 |
| [CONTRIBUTING.md](CONTRIBUTING.md) | 中文 | 贡献指南 |

### 权利与义务

**您可以：**
- ✅ 免费使用本软件
- ✅ 修改源代码
- ✅ 分发本软件
- ✅ 商业使用
- ✅ 私有使用

**您需要：**
- 📋 保留版权声明
- 📋 包含许可证副本

**您不得：**
- ❌ 删除或修改版权声明
- ❌ 将本软件用于非法用途

### 第三方组件

本软件使用的第三方组件及其许可证信息：

| 组件 | 用途 | 许可证 |
|-----|------|-------|
| [Tauri 2](https://tauri.app/) | 桌面应用框架 | MIT 或 Apache 2.0 |
| [Rust](https://www.rust-lang.org/) | 编程语言 | MIT 或 Apache 2.0 |
| [winreg](https://github.com/DoumanAsh/winreg-rs) | Windows 注册表操作 | MIT |

详情请查看 [Cargo.toml](src-tauri/Cargo.toml)。

## 版权声明

```
Copyright (c) 2025 MachineID-Manage Contributors

本项目采用 MIT 许可证开源，详见 LICENSE 文件。
```

## 联系方式

- GitHub: [https://github.com/Trae-ai/MachineID-Manage](https://github.com/Trae-ai/MachineID-Manage)
- Issues: [https://github.com/Trae-ai/MachineID-Manage/issues](https://github.com/Trae-ai/MachineID-Manage/issues)
- 贡献指南: [CONTRIBUTING.md](CONTRIBUTING.md)
