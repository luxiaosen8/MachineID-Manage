#!/usr/bin/env pwsh
<#
.SYNOPSIS
    GitHub 发布脚本 - 自动创建仓库、推送代码、创建 Release

.DESCRIPTION
    此脚本帮助自动化 MachineID-Manage 项目的 GitHub 发布流程

.PARAMETER GitHubUsername
    GitHub 用户名

.PARAMETER GitHubToken
    GitHub Personal Access Token (需要 repo scope)

.PARAMETER RepoName
    仓库名称 (默认: MachineID-Manage)

.PARAMETER Description
    仓库描述

.PARAMETER Private
    是否创建私有仓库 (默认: $false - 公开)

.EXAMPLE
    .\publish-to-github.ps1 -GitHubUsername "your-username" -GitHubToken "ghp_xxxxx"

.NOTES
    需要先安装 GitHub CLI (gh) 或使用 curl
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$GitHubUsername,

    [Parameter(Mandatory=$false)]
    [string]$GitHubToken,

    [Parameter(Mandatory=$false)]
    [string]$RepoName = "MachineID-Manage",

    [Parameter(Mandatory=$false)]
    [string]$Description = "A Windows MachineGuid Manager built with Rust + Tauri 2",

    [Parameter(Mandatory=$false)]
    [switch]$Private = $false
)

$ErrorActionPreference = "Stop"

# 颜色定义
$Green = [System.ConsoleColor]::Green
$Yellow = [System.ConsoleColor]::Yellow
$Cyan = [System.ConsoleColor]::Cyan
$Red = [System.ConsoleColor]::Red
$White = [System.ConsoleColor]::White

function Write-Header {
    param([string]$Text)
    Write-Host "`n========================================" -ForegroundColor $Cyan
    Write-Host " $Text" -ForegroundColor $Cyan
    Write-Host "========================================`n" -ForegroundColor $Cyan
}

function Write-Success {
    param([string]$Text)
    Write-Host "[✓] " -ForegroundColor $Green -NoNewline
    Write-Host $Text -ForegroundColor $White
}

function Write-Warning {
    param([string]$Text)
    Write-Host "[!] " -ForegroundColor $Yellow -NoNewline
    Write-Host $Text -ForegroundColor $White
}

function Write-Error {
    param([string]$Text)
    Write-Host "[✗] " -ForegroundColor $Red -NoNewline
    Write-Host $Text -ForegroundColor $White
}

# 检查参数
if (-not $GitHubUsername -or -not $GitHubToken) {
    Write-Header "GitHub 发布配置"

    Write-Host "请提供以下信息来创建 GitHub 仓库：`n" -ForegroundColor $White

    if (-not $GitHubUsername) {
        $GitHubUsername = Read-Host "请输入您的 GitHub 用户名"
    }

    if (-not $GitHubToken) {
        Write-Host "`n如何获取 GitHub Token:" -ForegroundColor $Cyan
        Write-Host "1. 访问 https://github.com/settings/tokens" -ForegroundColor $White
        Write-Host "2. 点击 'Generate new token (classic)'" -ForegroundColor $White
        Write-Host "3. 设置 Note: 'MachineID-Manage Release'" -ForegroundColor $White
        Write-Host "4. 勾选 'repo' 权限 (完整仓库访问)" -ForegroundColor $White
        Write-Host "5. 点击 Generate token 并复制`n" -ForegroundColor $White

        $GitHubToken = Read-Host "请输入您的 GitHub Personal Access Token" -AsSecureString
        $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($GitHubToken)
        $GitHubToken = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    }
}

# Base64 编码认证
$AuthString = "${GitHubUsername}:${GitHubToken}"
$Base64Auth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes($AuthString))
$Headers = @{
    "Authorization" = "Basic $Base64Auth"
    "Accept" = "application/vnd.github.v3+json"
    "Content-Type" = "application/json"
}

$RepoFullName = "${GitHubUsername}/${RepoName}"

Write-Header "步骤 1: 创建 GitHub 仓库"

# 检查仓库是否存在
try {
    $Response = Invoke-RestMethod -Uri "https://api.github.com/repos/${RepoFullName}" -Headers $Headers -Method Get
    Write-Warning "仓库 $RepoFullName 已存在，将使用现有仓库"
    $RepoExists = $true
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Success "仓库不存在，准备创建..."

        $RepoDescription = @{
            "name" = $RepoName
            "description" = $Description
            "private" = [bool]$Private
            "auto_init" = $false
        } | ConvertTo-Json

        try {
            $Response = Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Headers $Headers -Method Post -Body $RepoDescription
            Write-Success "仓库创建成功: https://github.com/${RepoFullName}"
            $RepoExists = $true
        } catch {
            Write-Error "创建仓库失败: $_"
            exit 1
        }
    } else {
        Write-Error "检查仓库时出错: $_"
        exit 1
    }
}

Write-Header "步骤 2: 添加远程仓库并推送"

# 获取当前目录
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$RepoDir = Join-Path $ProjectRoot ".github"

# 创建 .github 目录
if (-not (Test-Path $RepoDir)) {
    New-Item -ItemType Directory -Path $RepoDir -Force | Out-Null
    Write-Success "创建 .github 目录"
}

# 创建工作流目录
$WorkflowDir = Join-Path $RepoDir "workflows"
if (-not (Test-Path $WorkflowDir)) {
    New-Item -ItemType Directory -Path $WorkflowDir -Force | Out-Null
    Write-Success "创建 workflows 目录"
}

# 切换到项目目录
Push-Location $ProjectRoot

# 添加远程仓库
try {
    git remote add origin "https://github.com/${RepoFullName}.git" 2>$null
    Write-Success "添加远程仓库 origin"
} catch {
    Write-Warning "远程仓库可能已存在"
}

# 推送代码
try {
    Write-Host "`n正在推送代码到 GitHub..." -ForegroundColor $Cyan
    git push -u origin master --force
    Write-Success "代码推送成功"
} catch {
    Write-Error "推送失败: $_"
    Pop-Location
    exit 1
}

Pop-Location

Write-Header "步骤 3: 创建 GitHub Actions 工作流"

# 创建发布工作流
$WorkflowContent = @"
name: Release

on:
  release:
    types: [created]

jobs:
  build:
    strategy:
      fail-fast: false
      matrix:
        platform: [windows-latest, macos-latest, ubuntu-latest]

    runs-on: \${{ matrix.platform }}

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Rust
        uses: dtolnay/rust-toolchain@stable
        with:
          toolchain: stable

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm install

      - name: Build with Tauri
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          cd src-tauri
          cargo tauri build --bundles deb,rpm,appimage,zip
          mv target/release/bundle/* ../../
      - name: Upload Release Assets
        uses: softprops/action-gh-release@v2
        with:
          files: |
            *.msi
            *.exe
            *.dmg
            *.AppImage
            *.deb
            *.rpm
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
"@

$WorkflowPath = Join-Path $WorkflowDir "release.yml"
$WorkflowContent | Out-File -FilePath $WorkflowPath -Encoding UTF8
Write-Success "创建发布工作流: $WorkflowPath"

# 提交工作流
Push-Location $ProjectRoot
git add .github/workflows/release.yml
git commit -m "docs: 添加 GitHub Actions 发布工作流" --allow-empty
git push origin master
Pop-Location

Write-Header "步骤 4: 完成！"

Write-Host "`n🎉 项目已成功发布到 GitHub！`n" -ForegroundColor $Green
Write-Host "仓库地址: https://github.com/${RepoFullName}" -ForegroundColor $Cyan
Write-Host "`n下一步操作:" -ForegroundColor $White
Write-Host "1. 访问 https://github.com/${RepoFullName}" -ForegroundColor $Yellow
Write-Host "2. 点击 'Actions' 标签查看工作流" -ForegroundColor $Yellow
Write-Host "3. 创建新的 Release 触发构建" -ForegroundColor $Yellow
Write-Host "`n或运行以下命令创建 Release:" -ForegroundColor $Cyan
Write-Host "  gh release create v1.0.0 --title 'v1.0.0 Initial Release' --notes 'Initial release of MachineID-Manage'`n" -ForegroundColor $White
