# MachineID-Manage v2.0 重构文档

## 重构概述

本次重构将 MachineID-Manage 从 Tauri 1.5 + 原生 JavaScript 升级到 **Tauri 2.0 + Vue 3 + TypeScript** 技术栈，实现了现代化的架构设计和更好的开发体验。

## 技术栈变更

### 后端 (Rust)
| 组件 | 旧版本 | 新版本 |
|------|--------|--------|
| Tauri | 1.5 | 2.0 |
| 日志 | println | tracing |
| 异步 | 同步 | tokio |
| winreg | 0.50 | 0.52 |

### 前端
| 组件 | 旧版本 | 新版本 |
|------|--------|--------|
| 框架 | 原生 JS | Vue 3 + TypeScript |
| 构建工具 | 无 | Vite 5 |
| 状态管理 | 无 | Pinia |
| 样式 | 原生 CSS | Tailwind CSS |
| 组件库 | 自定义 | Radix Vue + 自定义 |
| 工具库 | 无 | VueUse |

## 架构改进

### 1. 分层架构

```
src-tauri/
├── src/
│   ├── main.rs              # Tauri 命令入口
│   └── machine_id.rs        # 机器码业务逻辑

src/
├── components/              # Vue 组件
│   ├── ui/                  # 基础 UI 组件
│   ├── layout/              # 布局组件
│   ├── features/            # 功能组件
│   └── modals/              # 模态框组件
├── stores/                  # Pinia 状态管理
├── types/                   # TypeScript 类型
├── utils/                   # 工具函数
└── styles/                  # 全局样式
```

### 2. 状态管理

使用 Pinia 实现集中式状态管理：
- `machineIdStore`: 机器码相关状态
- `backupStore`: 备份相关状态
- `dialogStore`: 对话框状态

### 3. 类型安全

全面使用 TypeScript 类型：
- 接口定义清晰
- 类型推导完善
- 运行时类型检查

## 功能改进

### 新增功能
1. **权限可视化**: 实时显示当前权限状态
2. **加载状态**: 所有异步操作都有加载指示
3. **动画效果**: 平滑的过渡动画
4. **响应式设计**: 适配不同窗口大小

### 体验优化
1. **确认对话框**: 危险操作需要二次确认
2. **Toast 提示**: 操作结果即时反馈
3. **键盘快捷键**: ESC 关闭对话框
4. **剪贴板集成**: 一键复制 GUID

## 性能优化

### 构建优化
- Vite 极速 HMR
- 代码分割与懒加载
- Tree shaking
- 资源压缩

### 运行时优化
- 组件按需渲染
- 状态变更精确追踪
- 内存泄漏防护

## 测试覆盖

### 单元测试
- 工具函数测试
- Store 逻辑测试
- 组件行为测试

### E2E 测试
- 用户操作流程
- 跨平台兼容性

## 迁移指南

### 数据兼容
- 备份文件格式保持不变
- 配置文件自动迁移

### 开发环境
```bash
# 安装依赖
npm install

# 开发模式
npm run tauri:dev

# 构建生产版本
npm run tauri:build

# 运行测试
npm run test
```

## 项目结构

```
MachineID-Manage/
├── src-tauri/              # Tauri 后端
│   ├── src/
│   │   ├── main.rs
│   │   └── machine_id.rs
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── capabilities/
├── src/                    # Vue 前端
│   ├── components/
│   ├── stores/
│   ├── types/
│   ├── utils/
│   ├── styles/
│   ├── App.vue
│   └── main.ts
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js
```

## 后续计划

1. **插件系统**: 支持扩展功能
2. **主题定制**: 多主题切换
3. **国际化**: 多语言支持
4. **自动更新**: 在线更新机制

## 贡献指南

1. 遵循 TypeScript 严格模式
2. 组件使用 Composition API
3. 状态管理使用 Pinia
4. 样式使用 Tailwind CSS
5. 提交前运行测试

## 许可证

MIT OR Apache-2.0
