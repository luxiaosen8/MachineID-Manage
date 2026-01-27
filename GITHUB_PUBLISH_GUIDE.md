# GitHub 发布流程说明

## 前置准备

### 1. 获取 GitHub Personal Access Token

1. 访问 https://github.com/settings/tokens
2. 点击 **Generate new token (classic)**
3. 设置 Note: `MachineID-Manage Release`
4. 勾选 `repo` 权限（完整仓库访问）
5. 点击 **Generate token** 并复制

### 2. 运行发布脚本

```powershell
cd "c:\Users\78221\Desktop\workspace\trae\MachineID-Manage"

# 方法 1: 交互式输入（推荐）
.\github-publish.ps1

# 方法 2: 直接提供参数
.\github-publish.ps1 -Username "您的GitHub用户名" -Token "ghp_xxxxx"
```

## 脚本功能

脚本会自动执行以下操作：

| 步骤 | 操作 | 说明 |
|------|------|------|
| 1 | 检查仓库 | 确认仓库是否存在，不存在则创建 |
| 2 | 配置远程 | 设置 GitHub 远程仓库地址 |
| 3 | 推送代码 | 将本地提交推送到 GitHub |
| 4 | 更新链接 | 更新 README、LICENSE 等文件中的 URL |
| 5 | 创建 Release | 生成 v1.0.0 Release 草稿 |

## 发布后操作

### 1. 编辑 Release

1. 访问 https://github.com/[用户名]/MachineID-Manage/releases
2. 点击 **Edit** 按钮
3. 更新发布说明（支持 Markdown）
4. 移除 **This is a pre-release** 勾选（如果需要正式版）
5. 点击 **Publish release**

### 2. 等待构建完成

GitHub Actions 会自动构建各平台安装包：

- **Windows**: `.msi`, `.exe`
- **macOS**: `.dmg`, `.app`
- **Linux**: `.deb`, `.appimage`

构建完成后，Assets 会自动添加到 Release 中。

### 3. 验证构建状态

1. 访问 https://github.com/[用户名]/MachineID-Manage/actions
2. 查看 Workflow 运行状态
3. 确认所有平台的构建都成功

## 文件说明

| 文件 | 用途 |
|------|------|
| `github-publish.ps1` | 一键发布脚本 |
| `.github/workflows/release.yml` | GitHub Actions 构建工作流 |
| `create-github-repo.ps1` | 简化版仓库创建脚本 |
| `publish-to-github.ps1` | 完整发布脚本（更多选项） |

## 常见问题

### Q: Token 权限不足
A: 确保 Token 勾选了 `repo` 权限。

### Q: 仓库已存在
A: 脚本会自动跳过创建，使用现有仓库。

### Q: 推送失败
A: 检查网络连接和 Token 权限。

### Q: 构建失败
A: 查看 Actions 日志排查问题，通常是依赖或权限问题。
