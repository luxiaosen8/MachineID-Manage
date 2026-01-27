param(
    [Parameter(Mandatory=$false)]
    [string]$Username,
    
    [Parameter(Mandatory=$false)]
    [string]$Token
)

$ErrorActionPreference = "Stop"
$RepoName = "MachineID-Manage"
$Description = "A Windows MachineGuid Manager built with Rust + Tauri 2"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  GitHub 仓库创建与发布脚本" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

if (-not $Username) {
    $Username = Read-Host "请输入您的 GitHub 用户名"
}

if (-not $Token) {
    Write-Host "`n获取 Token 方法:" -ForegroundColor Yellow
    Write-Host "1. 访问 https://github.com/settings/tokens" -ForegroundColor White
    Write-Host "2. 点击 'Generate new token (classic)'" -ForegroundColor White  
    Write-Host "3. 设置 Note: 'MachineID-Manage'" -ForegroundColor White
    Write-Host "4. 勾选 'repo' 权限" -ForegroundColor White
    Write-Host "5. 点击 Generate 并复制 Token`n" -ForegroundColor White
    
    $SecureToken = Read-Host "请输入 GitHub Personal Access Token" -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecureToken)
    $Token = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
}

$Auth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${Username}:${Token}"))
$Headers = @{
    "Authorization" = "basic $Auth"
    "Accept" = "application/vnd.github.v3+json"
}

$RepoFullName = "${Username}/${RepoName}"
$ProjectRoot = $PSScriptRoot

Write-Host "[1/5] 检查仓库是否存在..." -ForegroundColor Cyan
try {
    $null = Invoke-RestMethod -Uri "https://api.github.com/repos/${RepoFullName}" -Headers $Headers -Method Get
    Write-Host "  仓库已存在，将使用现有仓库" -ForegroundColor Yellow
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "  创建仓库中..." -ForegroundColor Yellow
        $Body = @{ name = $RepoName; description = $Description; private = $false; auto_init = $false } | ConvertTo-Json
        $Response = Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Headers $Headers -Method Post -Body $Body
        Write-Host "  ✓ 仓库创建成功" -ForegroundColor Green
    }
    else { throw }
}

Write-Host "[2/5] 配置远程仓库..." -ForegroundColor Cyan
Push-Location $ProjectRoot
git remote remove origin 2>$null
git remote add origin "https://github.com/${RepoFullName}.git"
Pop-Location
Write-Host "  ✓ 远程仓库配置完成" -ForegroundColor Green

Write-Host "[3/5] 推送代码..." -ForegroundColor Cyan
Push-Location $ProjectRoot
git push -u origin master --force
Pop-Location
Write-Host "  ✓ 代码推送成功" -ForegroundColor Green

Write-Host "[4/5] 更新文档链接..." -ForegroundColor Cyan
$FilesToUpdate = @(
    "$ProjectRoot\README.md",
    "$ProjectRoot\CONTRIBUTING.md",
    "$ProjectRoot\DISCLAIMER.md",
    "$ProjectRoot\LICENSE",
    "$ProjectRoot\LICENSE.zh-CN"
)
$OldUrl = "github.com/Trae-ai/MachineID-Manage"
$NewUrl = "github.com/${Username}/MachineID-Manage"

foreach ($File in $FilesToUpdate) {
    if (Test-Path $File) {
        $Content = Get-Content $File -Raw
        if ($Content -match $OldUrl) {
            $Content = $Content -replace $OldUrl, $NewUrl
            $Content | Set-Content $File -Encoding UTF8
            Write-Host "  ✓ 已更新: $(Split-Path $File -Leaf)" -ForegroundColor Green
        }
    }
}
git add -A
git commit -m "docs: 更新文档链接指向新仓库地址" --allow-empty
git push origin master

Write-Host "[5/5] 创建 Release..." -ForegroundColor Cyan
$ReleaseNotes = @"
# MachineID-Manage v1.0.0

## 关于 / About
MachineID-Manage 是一款基于 Rust + Tauri 2 开发的 Windows 机器码管理工具。

MachineID-Manage is a Windows MachineGuid management tool built with Rust + Tauri 2.

## 功能特性 / Features
- 📖 读取机器码 / Read MachineGuid
- 💾 备份管理 / Backup management  
- 🔄 恢复备份 / Restore backup
- 🎲 随机生成 / Random GUID generation
- 🔧 自定义替换 / Custom replacement
- 📋 一键复制 / One-click copy

## 系统要求 / System Requirements
- Windows 10/11
- 管理员权限 / Administrator privileges (for modifications)

## 使用方法 / Usage
1. 下载对应平台的安装包
2. 安装并运行程序
3. 使用管理员权限执行机器码操作

## 注意事项 / Notes
- 修改机器码前请备份当前值
- 请谨慎操作，避免系统识别问题
- 首次修改需要管理员权限

## 下载 / Downloads
请访问 GitHub Releases 页面下载：
https://github.com/${Username}/MachineID-Manage/releases
"@

$ReleaseBody = @{
    tag_name = "v1.0.0"
    name = "v1.0.0 Initial Release"
    body = $ReleaseNotes
    draft = $true
    prerelease = $false
} | ConvertTo-Json

try {
    $null = Invoke-RestMethod -Uri "https://api.github.com/repos/${RepoFullName}/releases" -Headers $Headers -Method Post -Body $ReleaseBody
    Write-Host "  ✓ Release 草稿创建成功" -ForegroundColor Green
} catch {
    Write-Host "  ⚠ Release 创建失败，请手动创建" -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  🎉 发布完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`n仓库地址: https://github.com/${RepoFullName}" -ForegroundColor White
Write-Host "Release:  https://github.com/${RepoFullName}/releases" -ForegroundColor White
Write-Host "Actions:  https://github.com/${RepoFullName}/actions" -ForegroundColor White
Write-Host "`n后续步骤:" -ForegroundColor Yellow
Write-Host "1. 访问 Release 页面编辑发布说明" -ForegroundColor White
Write-Host "2. 点击 'Edit' 移除草稿并发布" -ForegroundColor White
Write-Host "3. GitHub Actions 将自动构建各平台安装包`n" -ForegroundColor White
