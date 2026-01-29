# MachineID-Manage 项目开发规范

## 技术栈约束

### 核心技术
- **后端**: Rust + Tauri 2
- **前端**: HTML/CSS/JavaScript（或 React/Vue.js）
- **系统集成**: Windows 注册表操作 (`winreg` crate)

### 依赖管理规则
- 严格限制在 Rust + Tauri 技术栈范围内
- 禁止引入未经授权的第三方库或框架
- 所有依赖添加必须经过评估和确认
- 优先使用 MCP 和 SKILLS 处理特定技术栈任务

## 已实现功能

### 核心功能
- **读取机器码**: 从 `HKLM\SOFTWARE\Microsoft\Cryptography` 读取 MachineGuid
- **备份机器码**: 将机器码备份到 JSON 文件，支持多个备份
- **自定义替换**: 接受用户输入的自定义机器码，格式验证后替换注册表
- **复制功能**: 一键复制机器码到剪贴板
- **删除备份**: 从备份列表中删除指定备份
- **清空备份**: 清除所有备份记录

### 安全机制
- GUID 格式验证（正则表达式匹配）
- 替换前自动备份当前机器码
- 需要管理员权限进行注册表写入
- 用户确认对话框

### 测试覆盖
- GUID 格式验证测试
- 备份/恢复功能测试
- 注册表读写测试
- 测试隔离（临时目录）

## 开发规范

### Git 工作流
- 每次代码修改后提交 commit
- 提交信息使用中文描述，遵循约定式提交规范
- 分支命名: `feature/*`, `bugfix/*`, `hotfix/*`

### 代码规范
- 检索用英文，输出/注释用简体中文
- 遵循 Docstring 中文规范
- 代码优化后执行 `@agent-code-simplifier:code-simplifier`
- 使用 TDD 开发规范

### TDD 规范
1. 先编写测试
2. 实现功能代码
3. 重构优化
4. 确保测试通过

## 项目结构

```
MachineID-Manage/
├── src-tauri/           # Tauri 后端 (Rust)
│   ├── src/            # 源代码
│   │   ├── main.rs     # Tauri 命令入口
│   │   └── machine_id.rs # 机器码读写逻辑
│   ├── Cargo.toml      # 依赖配置
│   ├── tauri.conf.json # Tauri 配置
│   └── icons/          # 应用图标
├── src/                # 前端源码
│   ├── index.html      # 主页面
│   ├── script.js       # 前端交互逻辑
│   └── style.css       # 样式文件
├── tests/              # 测试文件
├── AGENTS.md          # 本规则文件
├── LICENSE            # 开源许可证
├── CONTRIBUTING.md    # 贡献指南
├── SECURITY.md        # 安全政策
└── README.md          # 项目说明
```

## 命令约定


### Tauri CLI 命令
- `cargo tauri dev` - 开发模式运行
- `cargo tauri build` - 构建生产版本
- `cargo tauri info` - 查看项目信息

## 安全注意事项

### 注册表操作风险
- 操作前必须备份 MachineGuid
- 任何修改前需要用户确认
- 提供回滚功能
- 记录所有操作日志

### 代码安全
- 禁止在代码中硬编码密钥或敏感信息
- 所有用户输入必须验证
- 使用安全的随机数生成器 (OsRng / crypto.getRandomValues)
- 遵循最小权限原则
- 错误信息脱敏处理，避免泄露敏感路径
- 命令注入防护 (使用 -LiteralPath 和参数转义)

## 代码审查与优化记录

### 2026-01-29 版本 2.0.1 发布

**版本号**: 2.0.1

**更新类型**: 补丁版本 (安全修复 + 性能优化)

**变更内容**:

#### 已修复问题

**🔴 高优先级 - 安全问题**
1. **命令注入漏洞修复** (src-tauri/src/machine_id.rs, src/platform/permissions.rs)
   - 使用 `-LiteralPath` 替代 `-FilePath`
   - 对单引号进行转义处理
   - 添加 `-NoProfile` 和 `-ExecutionPolicy Bypass` 参数

2. **不安全随机数生成修复** (src-tauri/src/machine_id.rs)
   - 替换 `rand::thread_rng()` 为 `OsRng`
   - 遵循 RFC 4122 版本 4 UUID 标准
   - 正确设置版本和变体位

3. **错误信息脱敏处理** (src-tauri/src/main.rs)
   - 添加 `sanitize_error_for_user()` 函数
   - 将内部错误映射为用户友好信息
   - 避免泄露敏感路径和系统信息

**🟡 中优先级 - 性能优化**
4. **备份存储重复加载修复** (src-tauri/src/machine_id.rs)
   - 将两次 `load_backup_store()` 合并为一次
   - 减少 50% 的 I/O 操作

5. **正则表达式缓存** (src-tauri/src/machine_id.rs)
   - 使用 `lazy_static` 缓存编译后的正则
   - 避免每次验证时重复编译

6. **前端 GUID 生成安全化** (src/domains/machine-id/value-objects/guid.vo.ts, src/utils/index.ts)
   - 替换 `Math.random()` 为 `crypto.getRandomValues()`
   - 与后端使用相同的密码学安全随机数生成器

**🟢 低优先级 - 代码质量**
7. **输入长度限制** (src-tauri/src/main.rs)
   - GUID 长度严格验证 (36 字符)
   - 描述长度限制 (200 字符)

8. **单元测试增强** (src-tauri/src/main.rs)
   - 添加错误脱敏测试
   - 添加 GUID 长度验证测试
   - 添加描述长度限制测试

9. **CI/CD 流程完善** (.github/workflows/release.yml)
   - 添加代码质量检查 (rustfmt, clippy, eslint)
   - 添加安全审计 (cargo-audit, npm audit)
   - 添加自动化测试步骤
   - PR 触发构建检查

#### 技术改进

**依赖更新**
- 添加 `lazy_static = "1.4"` 到 Cargo.toml

**测试覆盖**
- 28 个测试全部通过
- 新增 3 个测试模块

**性能提升**
- 备份操作 I/O 减少 50%
- 正则编译开销消除
- 随机数生成安全性提升

## 质量标准

### 测试要求
- 单元测试覆盖率 > 80%
- 集成测试覆盖核心功能
- 手动测试验证 UI/UX

### 代码审查
- 所有 PR 需要审查后才能合并
- 重点检查安全性和稳定性
- 确保文档更新

## 贡献指南

详见 [CONTRIBUTING.md](CONTRIBUTING.md)

## 安全政策

详见 [SECURITY.md](SECURITY.md)

## GitHub Actions 自动发布规则

### 触发条件（全部自动触发，无需手动操作）

1. **Push 到 master/main 分支** - 自动触发构建和发布
2. **PR 合并到 master/main 分支** - 自动触发构建和发布
3. **推送标签 (v*)** - 自动触发版本发布

### 禁止手动触发
- ❌ 不使用 `workflow_dispatch`
- ❌ 不需要手动点击 "Run workflow"
- ✅ 所有发布流程完全自动化

### 工作流配置位置
- 文件: `.github/workflows/release.yml`
- 平台: Windows x64, macOS x64, macOS ARM64, Linux x64
- 输出: 安装版 + 便携版

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
- **GitHub Actions 全部自动触发，禁止手动触发工作流**
