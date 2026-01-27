#!/usr/bin/env pwsh
<#
.SYNOPSIS
    快速创建 GitHub 仓库并推送代码
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$GitHubUsername,

    [Parameter(Mandatory=$false)]
    [string]$GitHubToken
)

$ErrorActionPreference = "Stop"

# 颜色
$Green = [System.ConsoleColor]::Green
$Yellow = [System.ConsoleColor]::Yellow
$Cyan = [System.ConsoleColor]::Cyan
$White = [System.ConsoleColor]::White

function Write-Step {
    param([string]$Text)
    Write-Host "`n[→] $Text`n" -ForegroundColor $Cyan
}

function Write-Done {
    param([string]$Text)
    Write-Host "[✓] $Text`n" -ForegroundColor $Green
}

# 读取参数
if (-not $GitHubUsername) {
    $GitHubUsername = Read-Host "GitHub 用户名"
}

if (-not $GitHubToken) {
    Write-Host "`n如何获取 Token:" -ForegroundColor $Yellow
    Write-Host "1. https://github.com/settings/tokens" -ForegroundColor $White
    Write-Host "2. Generate new token (classic)" -ForegroundColor $White
    Write-Host "3. 勾选 'repo' 权限" -ForegroundColor $White
    Write-Host "4. 复制 token`n" -ForegroundColor $White

    $SecureToken = Read-Host "GitHub Token" -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecureToken)
    $GitHubToken = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
}

$RepoName = "MachineID-Manage"
$RepoFullName = "${GitHubUsername}/${RepoName}"
$Description = "A Windows MachineGuid Manager built with Rust + Tauri 2"

# 认证
$Base64Auth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${GitHubUsername}:${GitHubToken}"))
$Headers = @{
    "Authorization" = "Basic $Base64Auth"
    "Accept" = "application/vnd.github.v3+json"
    "Content-Type" = "application/json"
}

# Step 1: 检查并创建仓库
Write-Step "检查仓库是否存在..."
try {
    $Response = Invoke-RestMethod -Uri "https://api.github.com/repos/${RepoFullName}" -Headers $Headers -Method Get
    Write-Done "仓库已存在: https://github.com/${RepoFullName}"
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Step "创建仓库..."
        $Body = @{
            name = $RepoName
            description = $Description
            private = $false
            auto_init = $false
        } | ConvertTo-Json

        $Response = Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Headers $Headers -Method Post -Body $Body
        Write-Done "仓库创建成功"
    } else {
        throw "检查仓库失败: $_"
    }
}

# Step 2: 推送代码
Write-Step "推送代码到 GitHub..."

$ProjectRoot = (Get-Item (Split-Path (Split-Path $PSCommandPath -Parent) -Parent)).FullName
Push-Location $ProjectRoot

# 添加远程仓库
try {
    git remote remove origin 2>$null
    git remote add origin "https://github.com/${RepoFullName}.git"
    Write-Done "添加远程仓库"
} catch {
    Write-Step "更新远程仓库 URL"
}

# 推送
git push -u origin master --force
Write-Done "代码推送成功"

Pop-Location

# Step 3: 创建初始 Release
Write-Step "创建 Release..."
$TagName = "v1.0.0"
$ReleaseBody = @"
# MachineID-Manage v1.0.0

## 首次发布

### 功能
- 📖 读取机器码
- 💾 备份管理
- 🔄 恢复备份
- 🎲 随机生成
- 🔧 自定义替换
- 📋 一键复制

### 系统要求
- Windows 10/11
- 管理员权限（修改机器码时需要）

### 构建产物
- Windows: .msi, .exe
- macOS: .dmg, .app
- Linux: .deb, .appimage
"@

$ReleaseJson = @{
    tag_name = $TagName
    name = "v1.0.0 Initial Release"
    body = $ReleaseBody
    draft = $true
    prerelease = $false
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "https://api.github.com/repos/${RepoFullName}/releases" -Headers $Headers -Method Post -Body $ReleaseJson
    Write-Done "Release 草稿创建成功"
} catch {
    Write-Step "Release 创建失败（可能需要手动创建）: $_"
}

# 完成
Write-Host "`n========================================" -ForegroundColor $Cyan
Write-Host " 🎉 完成！" -ForegroundColor $Green
Write-Host "========================================" -ForegroundColor $Cyan
Write-Host "`n仓库地址: https://github.com/${RepoFullName}" -ForegroundColor $White
Write-Host "Release: https://github.com/${RepoFullName}/releases" -ForegroundColor $White
Write-Host "Actions: https://github.com/${RepoFullName}/actions" -ForegroundColor $White
Write-Host "`n后续步骤:" -ForegroundColor $Yellow
Write-Host "1. 访问 Release 页面编辑发布说明" -ForegroundColor $White
Write-Host "2. 点击 'Edit' 移除草稿并发布" -ForegroundColor $White
Write-Host "3. 或运行工作流手动触发构建`n" -ForegroundColor $White
