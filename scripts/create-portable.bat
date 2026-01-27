@echo off
chcp 65001 >nul
echo ============================================
echo    MachineID-Manage 免安装包制作工具
echo ============================================
echo.

set "SOURCE_DIR=%~dp0target\release"
set "OUTPUT_DIR=%~dp0MachineID-Manage_Portable"

echo [1/4] 创建输出目录...
if exist "%OUTPUT_DIR%" rmdir /s /q "%OUTPUT_DIR%"
mkdir "%OUTPUT_DIR%"
mkdir "%OUTPUT_DIR%\resources"
mkdir "%OUTPUT_DIR%\icons"

echo [2/4] 复制主程序...
copy "%SOURCE_DIR%\machineid-manage.exe" "%OUTPUT_DIR%\" >nul
if exist "%SOURCE_DIR%\machineid-manage.pdb" copy "%SOURCE_DIR%\machineid-manage.pdb" "%OUTPUT_DIR%\" >nul

echo [3/4] 复制资源文件...
xcopy "%SOURCE_DIR%\resources\*" "%OUTPUT_DIR%\resources\" /e /i /q >nul

echo [4/4] 复制图标文件...
xcopy "%SOURCE_DIR%\..\src-tauri\icons\*.ico" "%OUTPUT_DIR%\icons\" /i /q >nul
xcopy "%SOURCE_DIR%\..\src-tauri\icons\*.png" "%OUTPUT_DIR%\icons\" /i /q >nul

echo.
echo ============================================
echo    免安装包制作完成！
echo ============================================
echo.
echo 输出目录: %OUTPUT_DIR%
echo.
echo 使用方法:
echo   1. 直接运行 MachineID-Manage.exe
echo   2. 右键选择"以管理员身份运行"可修改注册表
echo.
echo 注意: 此版本不会在系统中注册卸载信息
echo.
pause
