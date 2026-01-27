// MachineID-Manage 前端交互逻辑

console.log('MachineID-Manage 初始化中...');

// 备份列表数据
let backupsData = [];

window.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM 已加载，等待 Tauri 绑定...');

    if (window.__TAURI__) {
        console.log('Tauri 已就绪');
        await checkAndDisplayPermissionStatus();
        await readMachineId();
        await loadBackups();
    } else {
        console.log('Tauri 未就绪（开发模式），使用模拟数据');
        displayMachineId({
            success: true,
            guid: '550E8400-E29B-41D4-A716-446655440000',
            source: 'HKLM\\SOFTWARE\\Microsoft\\Cryptography',
            error: null
        });
        loadBackupsMock();
    }

    initializeEventListeners();
});

async function checkAndDisplayPermissionStatus() {
    const statusElement = document.getElementById('operation-status');
    if (!statusElement) return;

    try {
        if (window.__TAURI__) {
            const { invoke } = window.__TAURI__.core;
            const result = await invoke('check_permission_command');

            if (result.success && result.has_permission) {
                statusElement.innerHTML = `<span style="color: #3fb950;">🛡️ 管理员权限已就绪</span>`;
            } else {
                statusElement.innerHTML = `<span style="color: #f85149;">⚠️ 权限不足，需要管理员权限</span>`;
            }
        }
    } catch (error) {
        console.error('权限检测失败:', error);
    }
}

async function checkPermissionBeforeWrite() {
    if (!window.__TAURI__) {
        return { hasPermission: true, needRestart: false };
    }

    try {
        const { invoke } = window.__TAURI__.core;
        const result = await invoke('test_write_access_command');

        if (result.success && result.has_permission) {
            return { hasPermission: true, needRestart: false };
        }

        const confirmed = confirm(
            '权限不足！\n\n' +
            '此操作需要管理员权限才能修改注册表。\n\n' +
            '是否立即以管理员身份重启程序？'
        );

        if (confirmed) {
            requestAdminRestart();
            return { hasPermission: false, needRestart: true };
        }

        return { hasPermission: false, needRestart: false };
    } catch (error) {
        console.error('权限检测失败:', error);
        return { hasPermission: false, needRestart: false };
    }
}

async function requestAdminRestart() {
    if (!window.__TAURI__) {
        alert('请右键点击程序，选择"以管理员身份运行"');
        return;
    }

    try {
        const { app, window } = window.__TAURI__.core;
        const appPath = await app.path.executablePath();
        
        console.log('尝试以管理员权限重启:', appPath);
        
        const { Shell } = await import('@tauri-apps/plugin/shell');
        
        const useCmd = Shell.create()
            .sidecar('shell')
            .then((shell) => shell.execute(`powershell.exe -Command "Start-Process '${appPath}' -Verb RunAs"`));
        
        await useCmd;
        
        await app.exit(0);
    } catch (shellError) {
        console.warn('PowerShell 方法失败，尝试备用方法:', shellError);
        
        try {
            const { app } = window.__TAURI__.core;
            const appPath = await app.path.executablePath();
            
            const { Command } = await import('@tauri-apps/plugin/shell');
            const { spawn } = await import('child_process');
            
            const { execSync } = require('child_process');
            execSync(`powershell.exe -Command "Start-Process '${appPath}' -Verb RunAs"`);
            
            await app.exit(0);
        } catch (fallbackError) {
            console.warn('备用方法也失败:', fallbackError);
            
            try {
                const { app } = window.__TAURI__.core;
                await app.relaunch();
                await app.exit(0);
            } catch (finalError) {
                console.error('所有重启方法都失败:', finalError);
                alert('无法自动以管理员身份重启。\n\n请手动操作：\n1. 关闭当前程序\n2. 右键点击程序\n3. 选择"以管理员身份运行"');
            }
        }
    }
}

function initializeEventListeners() {
    document.getElementById('read-btn')?.addEventListener('click', async () => {
        await readMachineId();
    });
    
    document.getElementById('backup-btn')?.addEventListener('click', async () => {
        await backupMachineGuid();
    });
    
    document.getElementById('generate-btn')?.addEventListener('click', () => {
        openRandomGenerateModal();
    });
    
    document.getElementById('replace-btn')?.addEventListener('click', () => {
        openCustomReplaceModal();
    });
    
    document.getElementById('close-modal')?.addEventListener('click', () => {
        closeCustomReplaceModal();
    });
    
    document.getElementById('cancel-replace-btn')?.addEventListener('click', () => {
        closeCustomReplaceModal();
    });
    
    document.getElementById('confirm-replace-btn')?.addEventListener('click', async () => {
        await confirmCustomReplace();
    });
    
    document.getElementById('custom-guid-input')?.addEventListener('input', (e) => {
        validateGuidInput(e.target.value);
    });
    
    document.getElementById('custom-guid-input')?.addEventListener('paste', (e) => {
        setTimeout(() => {
            const value = e.target.value;
            validateGuidInput(value);
        }, 0);
    });
    
    document.getElementById('close-random-modal')?.addEventListener('click', () => {
        closeRandomGenerateModal();
    });
    
    document.getElementById('cancel-random-btn')?.addEventListener('click', () => {
        closeRandomGenerateModal();
    });
    
    document.getElementById('confirm-random-btn')?.addEventListener('click', async () => {
        await confirmRandomGenerate();
    });
    
    document.querySelector('#random-generate-modal .modal')?.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeRandomGenerateModal();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeRandomGenerateModal();
        }
    });
    
    document.querySelector('.modal')?.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeCustomReplaceModal();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCustomReplaceModal();
        }
    });
}

function openCustomReplaceModal() {
    const modal = document.getElementById('custom-replace-modal');
    const input = document.getElementById('custom-guid-input');
    const descriptionInput = document.getElementById('custom-description-input');
    const confirmBtn = document.getElementById('confirm-replace-btn');
    
    input.value = '';
    descriptionInput.value = '';
    input.classList.remove('invalid');
    confirmBtn.disabled = true;
    
    modal.classList.add('show');
    input.focus();
}

function closeCustomReplaceModal() {
    const modal = document.getElementById('custom-replace-modal');
    modal.classList.remove('show');
}

function validateGuidInput(value) {
    const input = document.getElementById('custom-guid-input');
    const confirmBtn = document.getElementById('confirm-replace-btn');
    const hint = input.parentElement.querySelector('.input-hint');
    
    const guidPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    
    if (value.length === 0) {
        input.classList.remove('invalid');
        confirmBtn.disabled = true;
        hint.textContent = '格式: 550E8400-E29B-41D4-A716-446655440000';
        hint.style.color = '#888';
    } else if (guidPattern.test(value)) {
        input.classList.remove('invalid');
        confirmBtn.disabled = false;
        hint.textContent = '✅ 格式正确';
        hint.style.color = '#3fb950';
    } else {
        input.classList.add('invalid');
        confirmBtn.disabled = true;
        hint.textContent = '❌ 格式无效，请输入有效的 GUID 格式';
        hint.style.color = '#f85149';
    }
}

async function confirmCustomReplace() {
    const input = document.getElementById('custom-guid-input');
    const descriptionInput = document.getElementById('custom-description-input');
    const confirmBtn = document.getElementById('confirm-replace-btn');
    const statusElement = document.getElementById('operation-status');

    const newGuid = input.value.trim();
    const description = descriptionInput.value.trim() || `自定义替换 ${new Date().toLocaleString()}`;

    if (!validateGuidFormat(newGuid)) {
        statusElement.innerHTML = '<span style="color: #f85149;">❌ 无效的 GUID 格式</span>';
        return;
    }

    if (!confirm(`确定要将 MachineGuid 替换为:\n${newGuid}\n\n此操作将自动备份当前机器码！`)) {
        return;
    }

    const permCheck = await checkPermissionBeforeWrite();
    if (!permCheck.hasPermission) {
        if (!permCheck.needRestart) {
            statusElement.innerHTML = '<span style="color: #f85149;">❌ 权限不足，操作已取消</span>';
        }
        return;
    }

    confirmBtn.disabled = true;
    confirmBtn.textContent = '替换中...';
    statusElement.textContent = '正在备份并替换...';
    statusElement.style.color = '#58a6ff';

    try {
        if (window.__TAURI__) {
            const { invoke } = window.__TAURI__.core;
            const result = await invoke('write_machine_guid_command', {
                newGuid: newGuid,
                description: description
            });
            displayReplaceResult(result);
        } else {
            const mockPreBackup = {
                id: `backup_pre_${Date.now()}`,
                guid: document.getElementById('machine-guid').textContent,
                source: 'HKLM\\SOFTWARE\\Microsoft\\Cryptography',
                timestamp: Date.now() / 1000,
                description: `替换前备份`
            };
            const mockPostBackup = {
                id: `backup_post_${Date.now()}`,
                guid: newGuid,
                source: 'HKLM\\SOFTWARE\\Microsoft\\Cryptography',
                timestamp: Date.now() / 1000 + 1,
                description: `自定义替换后备份: ${newGuid}`
            };

            const mockResult = {
                success: true,
                previous_guid: mockPreBackup.guid,
                new_guid: newGuid,
                pre_backup: mockPreBackup,
                post_backup: mockPostBackup,
                message: `成功将 MachineGuid 替换为: ${newGuid}`,
                error: null
            };

            document.getElementById('machine-guid').textContent = newGuid;
            backupsData.unshift(mockPostBackup);
            displayReplaceResult(mockResult);
        }

        closeCustomReplaceModal();
        await loadBackups();
        await readMachineId();
    } catch (error) {
        console.error('替换失败:', error);
        statusElement.innerHTML = `<span style="color: #f85149;">❌ 替换失败: ${error}</span>`;
    } finally {
        confirmBtn.disabled = false;
        confirmBtn.textContent = '确认替换';
    }
}

function validateGuidFormat(guid) {
    const guidPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    return guidPattern.test(guid);
}

function displayReplaceResult(result) {
    const statusElement = document.getElementById('operation-status');
    
    if (result.success) {
        let backupInfo = '';
        if (result.pre_backup) {
            backupInfo = `<br><small style="color: #8b949e;">📦 替换前已备份: ${result.pre_backup.id}</small>`;
        }
        if (result.post_backup) {
            backupInfo += `<br><small style="color: #8b949e;">📦 替换后已备份: ${result.post_backup.id}</small>`;
        }
        statusElement.innerHTML = `<span style="color: #3fb950;">✅ ${result.message}</span>${backupInfo}`;
        console.log('✅ 替换成功:', result.message);
        console.log('📦 备份信息:', { pre_backup: result.pre_backup, post_backup: result.post_backup });
    } else {
        statusElement.innerHTML = `<span style="color: #f85149;">❌ 替换失败: ${result.error}</span>`;
        console.error('❌ 替换失败:', result.error);
    }
}

function openRandomGenerateModal() {
    const modal = document.getElementById('random-generate-modal');
    const displayElement = document.getElementById('generated-guid-display');
    const descriptionInput = document.getElementById('random-description-input');
    const confirmBtn = document.getElementById('confirm-random-btn');
    
    const randomGuid = generateRandomGuid();
    displayElement.textContent = randomGuid;
    descriptionInput.value = '';
    
    modal.classList.add('show');
}

function closeRandomGenerateModal() {
    const modal = document.getElementById('random-generate-modal');
    modal.classList.remove('show');
}

function generateRandomGuid() {
    const hexChars = '0123456789abcdef';
    let guid = '';
    
    for (let i = 0; i < 32; i++) {
        if (i === 8 || i === 12 || i === 16 || i === 20) {
            guid += '-';
        }
        guid += hexChars[Math.floor(Math.random() * 16)];
    }
    
    return guid;
}

async function confirmRandomGenerate() {
    const displayElement = document.getElementById('generated-guid-display');
    const descriptionInput = document.getElementById('random-description-input');
    const confirmBtn = document.getElementById('confirm-random-btn');
    const statusElement = document.getElementById('operation-status');

    const newGuid = displayElement.textContent.trim();
    const description = descriptionInput.value.trim() || `随机生成 ${new Date().toLocaleString()}`;

    if (!validateGuidFormat(newGuid)) {
        statusElement.innerHTML = '<span style="color: #f85149;">❌ 无效的 GUID 格式</span>';
        return;
    }

    if (!confirm(`确定要将 MachineGuid 替换为随机生成的:\n${newGuid}\n\n此操作将自动备份当前机器码！`)) {
        return;
    }

    const permCheck = await checkPermissionBeforeWrite();
    if (!permCheck.hasPermission) {
        if (!permCheck.needRestart) {
            statusElement.innerHTML = '<span style="color: #f85149;">❌ 权限不足，操作已取消</span>';
        }
        return;
    }

    confirmBtn.disabled = true;
    confirmBtn.textContent = '替换中...';
    statusElement.textContent = '正在备份并替换...';
    statusElement.style.color = '#58a6ff';

    try {
        if (window.__TAURI__) {
            const { invoke } = window.__TAURI__.core;
            const result = await invoke('generate_random_guid_command', {
                description: description
            });
            displayRandomGenerateResult(result);
        } else {
            const mockPreBackup = {
                id: `backup_pre_${Date.now()}`,
                guid: document.getElementById('machine-guid').textContent,
                source: 'HKLM\\SOFTWARE\\Microsoft\\Cryptography',
                timestamp: Date.now() / 1000,
                description: `替换前备份`
            };
            const mockPostBackup = {
                id: `backup_post_${Date.now()}`,
                guid: newGuid,
                source: 'HKLM\\SOFTWARE\\Microsoft\\Cryptography',
                timestamp: Date.now() / 1000 + 1,
                description: `随机生成替换后备份: ${newGuid}`
            };
            
            const mockResult = {
                success: true,
                previous_guid: mockPreBackup.guid,
                new_guid: newGuid,
                pre_backup: mockPreBackup,
                post_backup: mockPostBackup,
                message: `成功生成并替换 MachineGuid: ${newGuid}`,
                error: null
            };
            
            document.getElementById('machine-guid').textContent = newGuid;
            backupsData.unshift(mockPostBackup);
            displayRandomGenerateResult(mockResult);
        }
        
        closeRandomGenerateModal();
        await loadBackups();
        await readMachineId();
    } catch (error) {
        console.error('随机生成替换失败:', error);
        statusElement.innerHTML = `<span style="color: #f85149;">❌ 替换失败: ${error}</span>`;
    } finally {
        confirmBtn.disabled = false;
        confirmBtn.textContent = '确认替换';
    }
}

function displayRandomGenerateResult(result) {
    const statusElement = document.getElementById('operation-status');
    
    if (result.success) {
        let backupInfo = '';
        if (result.pre_backup) {
            backupInfo = `<br><small style="color: #8b949e;">📦 替换前已备份: ${result.pre_backup.id}</small>`;
        }
        if (result.post_backup) {
            backupInfo += `<br><small style="color: #8b949e;">📦 替换后已备份: ${result.post_backup.id}</small>`;
        }
        statusElement.innerHTML = `<span style="color: #3fb950;">✅ ${result.message}</span>${backupInfo}`;
        console.log('✅ 随机生成成功:', result.message);
        console.log('📦 备份信息:', { pre_backup: result.pre_backup, post_backup: result.post_backup });
    } else {
        statusElement.innerHTML = `<span style="color: #f85149;">❌ 随机生成失败: ${result.error}</span>`;
        console.error('❌ 随机生成失败:', result.error);
    }
}

async function readMachineId() {
    const displayElement = document.getElementById('machine-guid');
    const button = document.getElementById('read-btn');
    
    try {
        button.disabled = true;
        button.textContent = '读取中...';
        displayElement.textContent = '正在读取...';
        
        if (window.__TAURI__) {
            const { invoke } = window.__TAURI__.core;
            const result = await invoke('read_machine_id');
            displayMachineId(result);
        } else {
            displayMachineId({
                success: true,
                guid: '550E8400-E29B-41D4-A716-446655440000',
                source: 'HKLM\\SOFTWARE\\Microsoft\\Cryptography',
                error: null
            });
        }
    } catch (error) {
        console.error('读取机器码失败:', error);
        displayElement.innerHTML = `<span style="color: #f85149;">错误: ${error}</span>`;
    } finally {
        button.disabled = false;
        button.textContent = '读取机器码';
    }
}

function displayMachineId(result) {
    const displayElement = document.getElementById('machine-guid');
    
    if (result.success) {
        displayElement.textContent = result.guid;
        displayElement.style.color = '#58a6ff';
        console.log('✅ MachineGuid 读取成功:', result.guid);
        console.log('📍 来源:', result.source);
    } else {
        displayElement.innerHTML = `<span style="color: #f85149;">读取失败: ${result.error}</span>`;
        console.error('❌ MachineGuid 读取失败:', result.error);
    }
}

async function backupMachineGuid() {
    const backupBtn = document.getElementById('backup-btn');
    const statusElement = document.getElementById('operation-status');
    
    try {
        backupBtn.disabled = true;
        backupBtn.textContent = '备份中...';
        statusElement.textContent = '正在备份...';
        statusElement.style.color = '#58a6ff';
        
        if (window.__TAURI__) {
            const { invoke } = window.__TAURI__.core;
            const result = await invoke('backup_machine_guid', { description: `备份 ${new Date().toLocaleString()}` });
            displayBackupResult(result);
        } else {
            const mockBackup = {
                success: true,
                backup: {
                    id: `backup_${Date.now()}`,
                    guid: document.getElementById('machine-guid').textContent,
                    source: 'HKLM\\SOFTWARE\\Microsoft\\Cryptography',
                    timestamp: Date.now() / 1000,
                    description: `备份 ${new Date().toLocaleString()}`
                },
                error: null
            };
            backupsData.unshift(mockBackup.backup);
            displayBackupResult(mockBackup);
        }
        
        await loadBackups();
    } catch (error) {
        console.error('备份失败:', error);
        statusElement.innerHTML = `<span style="color: #f85149;">备份失败: ${error}</span>`;
    } finally {
        backupBtn.disabled = false;
        backupBtn.textContent = '备份机器码';
    }
}

function displayBackupResult(result) {
    const statusElement = document.getElementById('operation-status');

    if (result.success) {
        if (result.backup) {
            statusElement.innerHTML = `<span style="color: #3fb950;">✅ 备份成功! ID: ${result.backup.id}</span>`;
            console.log('✅ 备份成功:', result.backup);
        } else if (result.skipped) {
            statusElement.innerHTML = `<span style="color: #f9c440;">⏭️ 已存在相同机器码备份，跳过备份</span>`;
            console.log('⏭️ 跳过重复备份');
        } else {
            statusElement.innerHTML = `<span style="color: #f9c440;">⚠️ 未创建备份（可能已存在）</span>`;
            console.log('⚠️ 未创建备份');
        }
    } else {
        const errorMsg = result.error || '未知错误';
        statusElement.innerHTML = `<span style="color: #f85149;">❌ 备份失败: ${errorMsg}</span>`;
        console.error('❌ 备份失败:', errorMsg);
    }
}

async function loadBackups() {
    const listElement = document.getElementById('backup-list');
    
    if (!listElement) return;
    
    try {
        if (window.__TAURI__) {
            const { invoke } = window.__TAURI__.core;
            const result = await invoke('list_backups');
            displayBackupList(result);
        } else {
            displayBackupList({
                success: true,
                backups: backupsData,
                count: backupsData.length,
                error: null
            });
        }
    } catch (error) {
        console.error('加载备份列表失败:', error);
    }
}

function loadBackupsMock() {
    backupsData = [
        {
            id: 'backup_1737950000000',
            guid: '550E8400-E29B-41D4-A716-446655440000',
            source: 'HKLM\\SOFTWARE\\Microsoft\\Cryptography',
            timestamp: 1737950000,
            description: '初始备份'
        }
    ];
}

function displayBackupList(result) {
    const listElement = document.getElementById('backup-list');
    
    if (!listElement) return;
    
    if (result.success && result.backups.length > 0) {
        listElement.innerHTML = result.backups.map(backup => {
            const date = new Date(backup.timestamp * 1000).toLocaleString();
            return `
                <div class="backup-item" data-id="${backup.id}">
                    <div class="backup-info">
                        <div class="backup-guid">${backup.guid}</div>
                        <div class="backup-meta">${date} - ${backup.description || '无描述'}</div>
                    </div>
                    <div class="backup-actions">
                        <button class="copy-backup-btn" data-guid="${backup.guid}" title="复制机器码">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                        </button>
                        <button class="restore-backup-btn" data-id="${backup.id}" data-guid="${backup.guid}" title="恢复此机器码">恢复此机器码</button>
                        <button class="delete-backup-btn" data-id="${backup.id}" title="删除备份">删除</button>
                    </div>
                </div>
            `;
        }).join('');
        
        listElement.querySelectorAll('.copy-backup-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const guid = e.currentTarget.dataset.guid;
                copyToClipboard(guid);
            });
        });
        
        listElement.querySelectorAll('.delete-backup-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                await deleteBackup(id);
            });
        });

        listElement.querySelectorAll('.restore-backup-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const { id, guid } = e.currentTarget.dataset;
                await restoreBackup(id, guid);
            });
        });
    } else {
        listElement.innerHTML = '<div class="backup-item"><div class="backup-info">暂无备份</div></div>';
    }
}

async function copyToClipboard(text) {
    const statusElement = document.getElementById('operation-status');
    
    try {
        if (navigator.clipboard && window.__TAURI__) {
            await navigator.clipboard.writeText(text);
            statusElement.innerHTML = '<span style="color: #3fb950;">✅ 已复制到剪贴板</span>';
        } else if (window.__TAURI__) {
            const { writeText } = window.__TAURI__.clipboard;
            await writeText(text);
            statusElement.innerHTML = '<span style="color: #3fb950;">✅ 已复制到剪贴板</span>';
        } else {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            statusElement.innerHTML = '<span style="color: #3fb950;">✅ 已复制到剪贴板</span>';
        }
        console.log('✅ 已复制到剪贴板:', text);
    } catch (error) {
        console.error('复制失败:', error);
        statusElement.innerHTML = `<span style="color: #f85149;">❌ 复制失败: ${error}</span>`;
    }
}

async function deleteBackup(id) {
    if (!confirm('确定要删除此备份吗？')) return;
    
    const statusElement = document.getElementById('operation-status');
    
    try {
        if (window.__TAURI__) {
            const { invoke } = window.__TAURI__.core;
            const result = await invoke('delete_backup_by_id', { id });
            
            if (result.success) {
                statusElement.innerHTML = '<span style="color: #3fb950;">✅ 备份已删除</span>';
                await loadBackups();
            } else {
                statusElement.innerHTML = `<span style="color: #f85149;">❌ 删除失败: ${result.error}</span>`;
            }
        } else {
            backupsData = backupsData.filter(b => b.id !== id);
            statusElement.innerHTML = '<span style="color: #3fb950;">✅ 备份已删除</span>';
            await loadBackups();
        }
    } catch (error) {
        console.error('删除备份失败:', error);
        statusElement.innerHTML = `<span style="color: #f85149;">删除失败: ${error}</span>`;
    }
}

async function restoreBackup(id, guid) {
    const statusElement = document.getElementById('operation-status');

    if (!confirm(`确定要恢复该备份机器码到系统吗？\n\n备份ID: ${id}\n机器码: ${guid}\n\n将先自动备份当前机器码，再执行恢复。`)) {
        return;
    }

    const permCheck = await checkPermissionBeforeWrite();
    if (!permCheck.hasPermission) {
        if (!permCheck.needRestart) {
            statusElement.innerHTML = '<span style="color: #f85149;">❌ 权限不足，操作已取消</span>';
        }
        return;
    }

    try {
        statusElement.textContent = '正在备份并恢复...';
        statusElement.style.color = '#58a6ff';

        if (window.__TAURI__) {
            const { invoke } = window.__TAURI__.core;
            const result = await invoke('restore_backup_by_id_command', { id });

            if (!result.success) {
                statusElement.innerHTML = `<span style="color: #f85149;">❌ 恢复失败: ${result.error}</span>`;
                return;
            }

            statusElement.innerHTML = `<span style="color: #3fb950;">✅ 已恢复: ${result.restored_guid}</span>`;
            await loadBackups();
            await readMachineId();

            const preBackup = result.pre_backup;
            const preBackupTime = preBackup ? new Date(preBackup.timestamp * 1000).toLocaleString() : '-';
            const restoredFrom = result.restored_from;

            alert(
                `恢复完成\n\n` +
                `恢复前机器码: ${result.previous_guid}\n` +
                `恢复后机器码: ${result.restored_guid}\n\n` +
                `恢复来源备份: ${restoredFrom?.id || id}\n` +
                `来源机器码: ${restoredFrom?.guid || guid}\n\n` +
                `已自动备份当前机器码\n` +
                `备份ID: ${preBackup?.id || '-'}\n` +
                `备份时间: ${preBackupTime}`
            );
        } else {
            const previousGuid = document.getElementById('machine-guid').textContent;
            const preBackup = {
                id: `backup_${Date.now()}`,
                guid: previousGuid,
                source: 'HKLM\\SOFTWARE\\Microsoft\\Cryptography',
                timestamp: Date.now() / 1000,
                description: `恢复前自动备份: 从备份 ${id} 恢复到 ${guid}`
            };
            backupsData.unshift(preBackup);
            document.getElementById('machine-guid').textContent = guid;
            statusElement.innerHTML = `<span style="color: #3fb950;">✅ 已恢复: ${guid}</span>`;
            await loadBackups();

            alert(
                `恢复完成\n\n` +
                `恢复前机器码: ${previousGuid}\n` +
                `恢复后机器码: ${guid}\n\n` +
                `恢复来源备份: ${id}\n` +
                `来源机器码: ${guid}\n\n` +
                `已自动备份当前机器码\n` +
                `备份ID: ${preBackup.id}\n` +
                `备份时间: ${new Date(preBackup.timestamp * 1000).toLocaleString()}`
            );
        }
    } catch (error) {
        console.error('恢复失败:', error);
        statusElement.innerHTML = `<span style="color: #f85149;">❌ 恢复失败: ${error}</span>`;
    }
}
