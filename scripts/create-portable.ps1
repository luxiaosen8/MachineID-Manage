Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   MachineID-Manage Portable Package Creator" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$SourceDir = Join-Path $PSScriptRoot "..\target\release"
$OutputDir = Join-Path $PSScriptRoot "..\MachineID-Manage_Portable"

Write-Host "[1/4] Creating output directory..." -ForegroundColor Yellow
if (Test-Path $OutputDir) {
    Remove-Item -Recurse -Force $OutputDir
}
New-Item -ItemType Directory -Path $OutputDir | Out-Null
New-Item -ItemType Directory -Path (Join-Path $OutputDir "resources") | Out-Null
New-Item -ItemType Directory -Path (Join-Path $OutputDir "icons") | Out-Null

Write-Host "[2/4] Copying main executable..." -ForegroundColor Yellow
Copy-Item (Join-Path $SourceDir "machineid-manage.exe") $OutputDir
if (Test-Path (Join-Path $SourceDir "machineid-manage.pdb")) {
    Copy-Item (Join-Path $SourceDir "machineid-manage.pdb") $OutputDir
}

Write-Host "[3/4] Copying resources..." -ForegroundColor Yellow
$ResourcesSrc = Join-Path $SourceDir "resources"
if (Test-Path $ResourcesSrc) {
    Copy-Item (Join-Path $ResourcesSrc "*") (Join-Path $OutputDir "resources") -Recurse
}

Write-Host "[4/4] Copying icons..." -ForegroundColor Yellow
$IconsSrc = Join-Path $PSScriptRoot "..\src-tauri\icons"
if (Test-Path $IconsSrc) {
    Copy-Item (Join-Path $IconsSrc "*.ico") (Join-Path $OutputDir "icons") -ErrorAction SilentlyContinue
    Copy-Item (Join-Path $IconsSrc "*.png") (Join-Path $OutputDir "icons") -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "   Portable Package Created Successfully!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Output Directory: $OutputDir" -ForegroundColor White
Write-Host ""
Write-Host "Usage:" -ForegroundColor White
Write-Host "  1. Run MachineID-Manage.exe directly" -ForegroundColor Gray
Write-Host "  2. Right-click > 'Run as administrator' to modify registry" -ForegroundColor Gray
Write-Host ""
Write-Host "Note: This version does not register uninstall info" -ForegroundColor Yellow
Write-Host ""
