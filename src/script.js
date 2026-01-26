// MachineID-Manage 前端交互逻辑

console.log('MachineID-Manage 初始化中...');

// 备份列表数据
let backupsData = [];

window.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM 已加载，等待 Tauri 绑定...');
    
    if (window.__TAURI__) {
        console.log('Tauri 已就绪');
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

function initializeEventListeners() {
    document.getElementById('read-btn')?.addEventListener('click', async () => {
        await readMachineId();
    });
    
    document.getElementById('backup-btn')?.addEventListener('click', async () => {
        await backupMachineGuid();
    });
    
    document.getElementById('restore-btn')?.addEventListener('click', async () => {
        await restoreMachineGuid();
    });
    
    document.getElementById('generate-btn')?.addEventListener('click', () => {
        console.log('生成按钮点击 - 功能开发中');
    });
    
    document.getElementById('replace-btn')?.addEventListener('click', () => {
        console.log('替换按钮点击 - 功能开发中');
    });
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
        statusElement.innerHTML = `<span style="color: #3fb950;">✅ 备份成功! ID: ${result.backup.id}</span>`;
        console.log('✅ 备份成功:', result.backup);
    } else {
        statusElement.innerHTML = `<span style="color: #f85149;">❌ 备份失败: ${result.error}</span>`;
        console.error('❌ 备份失败:', result.error);
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
                        <button class="restore-backup-btn" data-id="${backup.id}" data-guid="${backup.guid}">恢复</button>
                        <button class="delete-backup-btn" data-id="${backup.id}">删除</button>
                    </div>
                </div>
            `;
        }).join('');
        
        listElement.querySelectorAll('.restore-backup-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const guid = e.target.dataset.guid;
                confirmRestore(guid);
            });
        });
        
        listElement.querySelectorAll('.delete-backup-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                await deleteBackup(id);
            });
        });
    } else {
        listElement.innerHTML = '<div class="backup-item"><div class="backup-info">暂无备份</div></div>';
    }
}

async function restoreMachineGuid() {
    const selectedBackup = document.querySelector('.backup-item.selected');
    if (!selectedBackup) {
        const statusElement = document.getElementById('operation-status');
        statusElement.innerHTML = '<span style="color: #f85149;">请先选择一个备份</span>';
        return;
    }
    
    const guid = selectedBackup.dataset.guid;
    confirmRestore(guid);
}

function confirmRestore(guid) {
    if (confirm(`确定要恢复到以下 MachineGuid 吗？\n${guid}\n\n⚠️ 此操作将修改注册表，请确保已备份当前数据！`)) {
        const statusElement = document.getElementById('operation-status');
        statusElement.innerHTML = `<span style="color: #f85149;">恢复功能开发中... 目标: ${guid}</span>`;
        console.log('恢复目标:', guid);
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
