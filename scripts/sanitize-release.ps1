# 发布前数据清理脚本
# 确保敏感数据不会被打包到发布版本中

param(
    [switch]$DryRun,
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"
$scriptName = "sanitize-release"
$exitCode = 0

function Write-Info {
    param([string]$Message)
    Write-Host "[$scriptName] INFO: $Message" -ForegroundColor Cyan
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[$scriptName] WARNING: $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[$scriptName] ERROR: $Message" -ForegroundColor Red
}

function Write-Success {
    param([string]$Message)
    Write-Host "[$scriptName] SUCCESS: $Message" -ForegroundColor Green
}

Write-Info "开始发布前数据清理检查..."

# 获取项目根目录
$projectRoot = Split-Path -Parent $PSScriptRoot
$srcTauriDir = Join-Path $projectRoot "src-tauri"

# 检查的文件列表
$sensitiveFiles = @(
    "backups.json",
    "test-data.json",
    "debug.log",
    "*.tmp"
)

$issuesFound = @()

# 1. 检查 src-tauri 目录下的敏感文件
Write-Info "检查敏感数据文件..."
foreach ($file in $sensitiveFiles) {
    $filePath = Join-Path $srcTauriDir $file
    if (Test-Path $filePath) {
        $issuesFound += "发现敏感文件: $filePath"
        Write-Warning "发现敏感文件: $filePath"

        if (-not $DryRun) {
            try {
                Remove-Item -Path $filePath -Force
                Write-Success "已删除: $filePath"
            }
            catch {
                Write-Error "无法删除文件: $filePath - $_"
                $exitCode = 1
            }
        }
    }
}

# 2. 检查 backups.json 内容
$backupFile = Join-Path $srcTauriDir "backups.json"
if (Test-Path $backupFile) {
    try {
        $content = Get-Content $backupFile -Raw | ConvertFrom-Json
        if ($content.backups -and $content.backups.Count -gt 0) {
            $backupCount = $content.backups.Count
            $issuesFound += "backups.json 包含 $backupCount 个备份记录"
            Write-Warning "backups.json 包含 $backupCount 个备份记录"

            if (-not $DryRun) {
                # 清空备份文件但保留结构
                $emptyBackups = @{ backups = @() } | ConvertTo-Json -Depth 10
                Set-Content -Path $backupFile -Value $emptyBackups -Force
                Write-Success "已清空 backups.json"
            }
        }
    }
    catch {
        Write-Error "无法读取 backups.json: $_"
        $exitCode = 1
    }
}

# 3. 检查 dist 目录
$distDir = Join-Path $projectRoot "dist"
if (Test-Path $distDir) {
    Write-Info "检查 dist 目录..."
    $distFiles = Get-ChildItem -Path $distDir -Recurse -File -ErrorAction SilentlyContinue
    Write-Info "dist 目录包含 $($distFiles.Count) 个文件"
}

# 4. 验证 .gitignore 配置
Write-Info "验证 .gitignore 配置..."
$gitignorePath = Join-Path $projectRoot ".gitignore"
if (Test-Path $gitignorePath) {
    $gitignoreContent = Get-Content $gitignorePath -Raw

    $requiredPatterns = @(
        "src-tauri/backups.json",
        "dist/",
        "target/",
        "test-results/",
        "coverage/"
    )

    foreach ($pattern in $requiredPatterns) {
        if ($gitignoreContent -notmatch [regex]::Escape($pattern)) {
            $issuesFound += ".gitignore 缺少规则: $pattern"
            Write-Warning ".gitignore 缺少规则: $pattern"
        }
    }
}

# 5. 检查环境变量
Write-Info "检查环境变量..."
if ($env:BACKUP_TEST_PATH) {
    $issuesFound += "检测到 BACKUP_TEST_PATH 环境变量"
    Write-Warning "检测到 BACKUP_TEST_PATH 环境变量"

    if (-not $DryRun) {
        Remove-Item Env:\BACKUP_TEST_PATH -ErrorAction SilentlyContinue
        Write-Success "已移除 BACKUP_TEST_PATH 环境变量"
    }
}

# 6. 生成清理报告
Write-Info "生成清理报告..."
$report = @{
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    dryRun = $DryRun.IsPresent
    issuesFound = $issuesFound.Count
    issues = $issuesFound
    status = if ($issuesFound.Count -eq 0) { "PASSED" } else { "WARNING" }
}

$reportJson = $report | ConvertTo-Json -Depth 10
Write-Info "清理报告:"
Write-Host $reportJson

# 保存报告
$reportPath = Join-Path $projectRoot "sanitize-report.json"
$reportJson | Set-Content -Path $reportPath -Force
Write-Info "报告已保存到: $reportPath"

# 输出摘要
Write-Host "`n========== 清理摘要 ==========" -ForegroundColor Cyan
Write-Host "模式: $(if ($DryRun) { ' dry-run (模拟)' } else { ' 实际执行' })" -ForegroundColor $(if ($DryRun) { 'Yellow' } else { 'Green' })
Write-Host "发现问题: $($issuesFound.Count)" -ForegroundColor $(if ($issuesFound.Count -eq 0) { 'Green' } else { 'Yellow' })

if ($issuesFound.Count -gt 0) {
    Write-Host "`n问题列表:" -ForegroundColor Yellow
    foreach ($issue in $issuesFound) {
        Write-Host "  - $issue" -ForegroundColor Yellow
    }
}

if ($report.status -eq "PASSED") {
    Write-Success "清理检查通过！"
}
else {
    if ($DryRun) {
        Write-Warning "发现 $($issuesFound.Count) 个问题，请运行不带 -DryRun 参数的命令进行清理"
    }
    else {
        Write-Success "已清理 $($issuesFound.Count) 个问题"
    }
}

Write-Host "==============================`n" -ForegroundColor Cyan

exit $exitCode
