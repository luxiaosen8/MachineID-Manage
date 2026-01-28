# 更新日志

本项目的所有重要更改都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [1.4.0] - 2026-01-28

### 新增
- 针对Windows、macOS和Linux的平台特定机器码管理模块
- 权限检查和管理系统
- 管理员重启功能以提升权限
- 全面的兼容性文档（COMPATIBILITY_FIXES.md、COMPATIBILITY_REPORT.md）
- AI代理开发指南（AGENTS.md）

### 变更
- **重大变更**：从 Tauri 1.x 迁移到 Tauri 1.5 以解决依赖兼容性问题
- 使用官方 Tauri Action 重构 GitHub Actions 工作流
- 更新前端UI，改进对话框和样式
- 增强机器码读写操作，改进错误处理
- 优化构建配置以实现跨平台兼容性

### 修复
- 修复 GitHub Actions 工作流 YAML 语法错误
- 通过禁用LTO优化解决macOS构建问题
- 通过降级到v0.17.0并使用git源修复cookie依赖问题
- 修复Windows注册表权限处理
- 在GitHub Actions中添加cargo clean步骤以解决缓存问题

### 技术改进
- 更新Cargo依赖以获得更好的兼容性
- 改进Tauri配置和功能
- 增强平台特定代码组织
- 更好的国际化支持（i18n）
- 优化前端代码结构和性能

### 文档
- 添加全面的功能兼容性矩阵
- 更新安装和使用说明
- 添加安全注意事项和最佳实践
- 改进项目结构文档

## [1.3.7] - 上一版本

### 新增
- 初始稳定版本
- 基础机器码管理功能
- 备份和恢复功能
- 随机GUID生成
- 自定义机器码替换

---

[1.4.0]: https://github.com/luxiaosen8/MachineID-Manage/releases/tag/v1.4.0
[1.3.7]: https://github.com/luxiaosen8/MachineID-Manage/releases/tag/v1.3.7
