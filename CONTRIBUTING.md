# 贡献指南 / Contributing Guidelines

感谢您对 MachineID-Manage 项目的兴趣！我们欢迎各种形式的贡献，包括但不限于：

- 🐛 报告 Bug
- 💡 提出新功能建议
- 📝 改进文档
- 🔧 提交代码修复
- 🌐 翻译项目

---

## 如何贡献 / How to Contribute

### 1. 报告 Bug / Reporting Bugs

如果您发现了 Bug，请通过 [GitHub Issues](https://github.com/luxiaosen8/MachineID-Manage/issues) 报告。报告时请包含：

- Bug 的清晰描述
- 复现步骤
- 预期行为与实际行为
- 截图或日志（如果有）
- 您的环境信息（操作系统、版本等）

### 2. 提出建议 / Suggesting Features

我们欢迎新想法！请通过 [GitHub Issues](https://github.com/luxiaosen8/MachineID-Manage/issues) 提出功能建议，包括：

- 功能描述
- 使用场景
- 可能的实现方案

### 3. 提交代码 / Submitting Code

#### Fork 并克隆仓库

```bash
# Fork 本仓库
# 点击 GitHub 页面上的 "Fork" 按钮

# 克隆您的 Fork
git clone https://github.com/YOUR-USERNAME/MachineID-Manage.git
cd MachineID-Manage

# 添加上游仓库
git remote add upstream https://github.com/luxiaosen8/MachineID-Manage.git
```

#### 创建分支

```bash
# 确保从最新 master 分支创建
git fetch upstream
git checkout upstream/master -b feature/your-feature-name

# 或修复 bug
git checkout upstream/master -b bugfix/issue-description
```

#### 开发与测试

```bash
# 安装依赖
npm install

# 启动开发服务器
cargo tauri dev

# 运行测试
cargo test
```

#### 提交更改

```bash
# 创建有意义的提交信息
git add .
git commit -m "feat: 添加新功能描述"

# 推送到您的 Fork
git push origin feature/your-feature-name
```

#### 创建 Pull Request

1. 访问原仓库
2. 点击 "New Pull Request"
3. 选择您的分支并填写 PR 模板
4. 提交 PR

### 4. 改进文档 / Improving Documentation

文档改进同样欢迎！您可以：

- 修正拼写或语法错误
- 改进解释的清晰度
- 添加示例或教程
- 翻译成其他语言

---

## 代码规范 / Code Standards

### Rust 代码规范

- 遵循 [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/)
- 使用 `cargo fmt` 格式化代码
- 使用 `cargo clippy` 检查代码质量
- 添加适当的注释和文档

```bash
# 格式化代码
cargo fmt

# 检查代码
cargo clippy
```

### 前端代码规范

- 遵循 HTML/CSS/JS 最佳实践
- 保持代码简洁可读
- 添加必要的注释

### 提交信息规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

常用类型：

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更改
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建或辅助工具更改

---

## 项目结构 / Project Structure

```
MachineID-Manage/
├── src-tauri/           # Tauri 后端 (Rust)
│   ├── src/
│   │   ├── main.rs     # 入口点
│   │   └── machine_id.rs # 机器码操作逻辑
│   ├── Cargo.toml      # 依赖配置
│   └── tauri.conf.json # Tauri 配置
├── src/                # 前端源码
│   ├── index.html      # 主页面
│   ├── style.css       # 样式
│   └── script.js       # 交互逻辑
├── tests/              # 测试文件
└── .github/
    └── workflows/      # CI/CD 配置
```

---

## 开发环境设置 / Development Setup

### 前置条件

- Windows 10/11
- Rust 1.70+
- Node.js 18+
- Git

### 安装步骤

1. 安装 Rust：
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. 安装 Node.js：
   从 [nodejs.org](https://nodejs.org/) 下载并安装

3. 克隆并设置项目：
   ```bash
   git clone https://github.com/luxiaosen8/MachineID-Manage.git
   cd MachineID-Manage
   npm install
   ```

4. 运行开发版本：
   ```bash
   cargo tauri dev
   ```

---

## 行为准则 / Code of Conduct

### 我们的承诺

为了营造一个开放包容的社区，我们承诺让每个人参与这个项目时都免受骚扰，无论其：

- 性别、性取向、种族、宗教、残障

### 我们的标准

**鼓励的行为：**

- 使用友好和包容的语言
- 尊重不同的观点和经验
- 优雅地接受建设性批评
- 关注对社区最有利的事情

**不可接受的行为：**

- 使用性暗示语言或图像
- 骚扰、侮辱或贬低的评论
- 公开或私下骚扰
- 未经许可发布他人的私人信息
- 其他不当行为

### 我们的责任

项目维护者有责任解释和执行这些标准，并对任何不可接受的行为做出适当回应。

### 适用范围

本行为准则适用于所有项目空间和社区场合，当个人代表项目时也适用。

---

## 联系方式 / Contact

如果您有任何问题或建议，请通过以下方式联系我们：

- **GitHub Issues**: [https://github.com/luxiaosen8/MachineID-Manage/issues](https://github.com/luxiaosen8/MachineID-Manage/issues)
- **项目 Wiki**: [https://github.com/luxiaosen8/MachineID-Manage/wiki](https://github.com/luxiaosen8/MachineID-Manage/wiki)

---

感谢您的贡献！

*Thank you for your contribution!*
