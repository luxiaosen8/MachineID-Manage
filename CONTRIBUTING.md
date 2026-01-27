# 贡献指南

感谢您对 MachineID-Manage 项目的兴趣！我们欢迎各种形式的贡献，包括但不限于：

- 🐛 报告 Bug
- 💡 提出新功能建议
- 📝 改进文档
- 🔧 提交代码修复
- ✨ 添加新功能
- 🎨 改进用户界面
- 🌐 翻译文档

## 目录

1. [行为准则](#行为准则)
2. [如何贡献](#如何贡献)
3. [开发环境设置](#开发环境设置)
4. [提交规范](#提交规范)
5. [代码审查流程](#代码审查流程)
6. [社区资源](#社区资源)

---

## 行为准则

我们承诺为社区提供一个友好、安全、包容的环境。请遵守以下准则：

### 期望的行为
- 使用欢迎和包容的语言
- 尊重不同的观点和经历
- 优雅地接受建设性批评
- 关注对社区最有利的事情
- 对其他社区成员表现出同理心

### 不可接受的行为
- 使用性别歧视的语言或图像
- 跟踪或骚扰任何人
- 发布他人的私人信息
- 任何形式的歧视、骚扰或贬低

## 如何贡献

### 报告 Bug

在报告 Bug 之前，请：
1. 搜索现有 Issues，确认问题尚未报告
2. 使用最新的稳定版本
3. 准备复现 Bug 的详细步骤

Bug 报告应包含：
- 清晰的问题描述
- 复现步骤（1、2、3...）
- 预期行为与实际行为
- 截图或日志（如适用）
- 环境信息（操作系统、版本等）

### 建议新功能

我们欢迎新功能建议！请：
1. 搜索现有 Issues，确认建议尚未存在
2. 详细描述功能需求
3. 解释为什么此功能对项目有价值
4. 提供可能的实现方案

### 提交代码

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/AmazingFeature`
3. 提交更改：`git commit -m 'Add some AmazingFeature'`
4. 推送分支：`git push origin feature/AmazingFeature`
5. 打开 Pull Request

## 开发环境设置

### 前置条件
- Windows 10/11
- Rust 1.70+
- Node.js 18+
- Git

### 设置步骤

```bash
# 1. 克隆仓库
git clone https://github.com/Trae-ai/MachineID-Manage.git
cd MachineID-Manage

# 2. 安装依赖
npm install

# 3. 安装 Rust 依赖
cargo fetch

# 4. 启动开发服务器
cargo tauri dev
```

### 代码结构

```
MachineID-Manage/
├── src-tauri/           # Tauri 后端 (Rust)
│   ├── src/            # 源代码
│   │   ├── main.rs     # Tauri 命令入口
│   │   └── machine_id.rs # 机器码读写逻辑
│   ├── Cargo.toml      # 依赖配置
│   └── tauri.conf.json # Tauri 配置
├── src/                # 前端源码
│   ├── index.html      # 主页面
│   ├── script.js       # 前端交互逻辑
│   └── style.css       # 样式文件
├── tests/              # 测试文件
├── AGENTS.md          # 项目规范
├── CONTRIBUTING.md    # 本贡献指南
└── README.md          # 项目说明
```

### 运行测试

```bash
# 运行 Rust 测试
cargo test

# 运行前端测试（如有）
npm test
```

## 提交规范

我们遵循[约定式提交](https://www.conventionalcommits.org/)规范：

```
<类型>[可选范围]: <描述>

[可选正文]

[可选脚注]
```

### 类型说明

| 类型 | 说明 |
|-----|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 文档变更 |
| `style` | 代码格式（不影响功能） |
| `refactor` | 代码重构 |
| `perf` | 性能优化 |
| `test` | 测试相关 |
| `chore` | 构建过程或辅助工具变更 |

### 示例

```
feat(machine-id): 添加随机生成机器码功能

- 实现随机 GUID 生成算法
- 添加格式验证
- 包含单元测试

Closes #123
```

## 代码审查流程

### Pull Request 要求

1. **代码质量**
   - 通过所有测试
   - 通过 Clippy 检查
   - 代码格式正确

2. **文档要求**
   - 更新相关文档
   - 添加必要的注释
   - 更新 CHANGELOG（如需要）

3. **提交信息**
   - 使用清晰的提交信息
   - 遵循提交规范
   - 包含关联的 Issue 编号

### 审查标准

- 功能正确性
- 代码可读性
- 性能影响
- 安全性
- 向后兼容性
- 测试覆盖

## 社区资源

### 交流渠道
- GitHub Issues：用于报告问题和提出建议
- GitHub Discussions：用于一般讨论

### 有用的链接
- [项目 Wiki](https://github.com/Trae-ai/MachineID-Manage/wiki)
- [API 文档](https://docs.rs/machineid-manage)
- [Tauri 文档](https://tauri.app/)

---

## 贡献者

感谢所有为 MachineID-Manage 做出贡献的人！

<a href="https://github.com/Trae-ai/MachineID-Manage/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Trae-ai/MachineID-Manage" />
</a>

---

## 许可协议

通过向 MachineID-Manage 项目贡献代码，您同意您的贡献将按照 [MIT 许可证](LICENSE) 的条款进行许可。

---

**感谢您的贡献！**

---

**最后更新**：2025年1月27日
