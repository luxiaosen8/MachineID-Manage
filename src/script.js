// MachineID-Manage 前端交互逻辑

console.log('MachineID-Manage Initializing...');

let backupsData = [];
const APP_VERSION = '1.4.0';

// 根据平台返回不同的模拟数据源
function getMockRegistrySource() {
    const platform = navigator.platform.toLowerCase();
    if (platform.includes('win')) {
        return 'HKLM\\SOFTWARE\\Microsoft\\Cryptography';
    } else if (platform.includes('mac') || platform.includes('darwin')) {
        return 'IOPlatformUUID';
    } else {
        return '/etc/machine-id';
    }
}

const MOCK_REGISTRY_SOURCE = getMockRegistrySource();

window.addEventListener('DOMContentLoaded', async () => {
    console.log('MachineID-Manage Initializing...');

    // 更新版本号显示
    updateVersionDisplay();

    await window.i18n.init();
    window.i18n.updateAllTexts();

    console.log('Tauri ready:', !!window.__TAURI__);
    console.log('Current locale:', window.i18n.getLocale());

    if (window.__TAURI__) {
        console.log('Tauri is ready');
        await checkAndDisplayPermissionStatus();
        await readMachineId();
        await loadBackups();
    } else {
        console.log('Tauri not ready (development mode), using mock data');
        displayMachineId({
            success: true,
            guid: '550E8400-E29B-41D4-A716-446655440000',
            source: MOCK_REGISTRY_SOURCE,
            error: null
        });
        loadBackupsMock();
    }

    initializeEventListeners();
});

function _(key, params = {}) {
    return window.i18n ? window.i18n.t(key, params) : key;
}

// 更新版本号显示
function updateVersionDisplay() {
    const versionElement = document.querySelector('[data-i18n="footer.version"]');
    if (versionElement) {
        versionElement.setAttribute('data-i18n-params', JSON.stringify({ version: APP_VERSION }));
        versionElement.textContent = _('footer.version', { version: APP_VERSION });
    }
}

// 统一确认对话框
let confirmDialogResolve = null;

function showConfirmDialog(title, message, confirmText = null, cancelText = null) {
    return new Promise((resolve) => {
        confirmDialogResolve = resolve;

        const modal = document.getElementById('confirm-dialog-modal');
        const titleEl = document.getElementById('confirm-dialog-title');
        const messageEl = document.getElementById('confirm-dialog-message');
        const confirmBtn = document.getElementById('confirm-dialog-confirm');
        const cancelBtn = document.getElementById('confirm-dialog-cancel');

        if (!modal || !titleEl || !messageEl || !confirmBtn || !cancelBtn) {
            // 如果找不到元素，回退到原生 confirm
            resolve(confirm(message));
            return;
        }

        titleEl.textContent = title;
        messageEl.textContent = message;

        if (confirmText) {
            confirmBtn.textContent = confirmText;
        } else {
            confirmBtn.textContent = _('button.confirm');
        }

        if (cancelText) {
            cancelBtn.textContent = cancelText;
        } else {
            cancelBtn.textContent = _('button.cancel');
        }

        modal.classList.add('show');

        // 绑定按钮事件
        const handleConfirm = () => {
            closeConfirmDialog();
            resolve(true);
        };

        const handleCancel = () => {
            closeConfirmDialog();
            resolve(false);
        };

        confirmBtn.onclick = handleConfirm;
        cancelBtn.onclick = handleCancel;

        // 点击背景关闭
        modal.onclick = (e) => {
            if (e.target === modal) {
                handleCancel();
            }
        };

        // ESC 键关闭
        const handleKeydown = (e) => {
            if (e.key === 'Escape') {
                handleCancel();
                document.removeEventListener('keydown', handleKeydown);
            }
        };
        document.addEventListener('keydown', handleKeydown);
    });
}

function closeConfirmDialog() {
    const modal = document.getElementById('confirm-dialog-modal');
    if (modal) {
        modal.classList.remove('show');
    }
}

function updateStatus(messageKey, params = {}) {
    const statusElement = document.getElementById('operation-status');
    if (statusElement) {
        statusElement.innerHTML = _(messageKey, params);
    }
}

async function checkAndDisplayPermissionStatus() {
    const statusElement = document.getElementById('operation-status');
    if (!statusElement) return;

    try {
        if (window.__TAURI__) {
            const { invoke } = window.__TAURI__.core;
            const result = await invoke('check_permission_command');

            if (result.success && result.has_permission) {
                updateStatus('status.permissionGranted');
            } else {
                updateStatus('status.permissionDenied');
            }
        }
    } catch (error) {
        console.error('Permission check failed:', error);
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
            _('confirm.permissionRequired')
        );

        if (confirmed) {
            requestAdminRestart();
            return { hasPermission: false, needRestart: true };
        }

        return { hasPermission: false, needRestart: false };
    } catch (error) {
        console.error('Permission check failed:', error);
        return { hasPermission: false, needRestart: false };
    }
}

async function requestAdminRestart() {
    if (!window.__TAURI__) {
        alert(_('alert.permissionRequired'));
        return;
    }

    try {
        const { app } = window.__TAURI__.core;
        const { platform } = await import('@tauri-apps/plugin-os');
        const currentPlatform = await platform();
        const appPath = await app.path.executablePath();

        console.log('Attempting to restart with admin privileges on platform:', currentPlatform);

        const { Command } = await import('@tauri-apps/plugin/shell');
        let command;

        switch (currentPlatform) {
            case 'win32':
                // Windows: 使用 PowerShell
                command = await Command.create('powershell.exe', [
                    '-Command',
                    `Start-Process '${appPath}' -Verb RunAs`
                ]);
                break;

            case 'darwin':
                // macOS: 使用 osascript
                command = await Command.create('osascript', [
                    '-e',
                    `do shell script "${appPath}" with administrator privileges`
                ]);
                break;

            case 'linux':
                // Linux: 使用 pkexec
                command = await Command.create('pkexec', [appPath]);
                break;

            default:
                throw new Error(`Unsupported platform: ${currentPlatform}`);
        }

        await command.execute();
        await app.exit(0);

    } catch (error) {
        console.error('Failed to restart with elevated privileges:', error);

        // 尝试最后的备选方案
        try {
            const { app } = window.__TAURI__.core;
            await app.relaunch();
            await app.exit(0);
        } catch (finalError) {
            console.error('All restart methods failed:', finalError);
            alert(_('alert.autoRestartFailed'));
        }
    }
}

function initializeEventListeners() {
    const readBtn = document.getElementById('read-btn');
    if (readBtn) {
        readBtn.addEventListener('click', async () => {
            await readMachineId();
        });
    }
    
    const backupBtn = document.getElementById('backup-btn');
    if (backupBtn) {
        backupBtn.addEventListener('click', async () => {
            await backupMachineGuid();
        });
    }
    
    const generateBtn = document.getElementById('generate-btn');
    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            openRandomGenerateModal();
        });
    }
    
    const replaceBtn = document.getElementById('replace-btn');
    if (replaceBtn) {
        replaceBtn.addEventListener('click', () => {
            openCustomReplaceModal();
        });
    }
    
    const closeModal = document.getElementById('close-modal');
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            closeCustomReplaceModal();
        });
    }
    
    const cancelReplaceBtn = document.getElementById('cancel-replace-btn');
    if (cancelReplaceBtn) {
        cancelReplaceBtn.addEventListener('click', () => {
            closeCustomReplaceModal();
        });
    }
    
    const confirmReplaceBtn = document.getElementById('confirm-replace-btn');
    if (confirmReplaceBtn) {
        confirmReplaceBtn.addEventListener('click', async () => {
            await confirmCustomReplace();
        });
    }
    
    const customGuidInput = document.getElementById('custom-guid-input');
    if (customGuidInput) {
        customGuidInput.addEventListener('input', (e) => {
            validateGuidInput(e.target.value);
        });
        
        customGuidInput.addEventListener('paste', (e) => {
            setTimeout(() => {
                const value = e.target.value;
                validateGuidInput(value);
            }, 0);
        });
    }
    
    const closeRandomModal = document.getElementById('close-random-modal');
    if (closeRandomModal) {
        closeRandomModal.addEventListener('click', () => {
            closeRandomGenerateModal();
        });
    }
    
    const cancelRandomBtn = document.getElementById('cancel-random-btn');
    if (cancelRandomBtn) {
        cancelRandomBtn.addEventListener('click', () => {
            closeRandomGenerateModal();
        });
    }
    
    const confirmRandomBtn = document.getElementById('confirm-random-btn');
    if (confirmRandomBtn) {
        confirmRandomBtn.addEventListener('click', async () => {
            await confirmRandomGenerate();
        });
    }
    
    const randomModal = document.querySelector('#random-generate-modal .modal');
    if (randomModal) {
        randomModal.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                closeRandomGenerateModal();
            }
        });
    }
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeRandomGenerateModal();
            closeCustomReplaceModal();
        }
    });
    
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                closeCustomReplaceModal();
            }
        });
    }
}

function openCustomReplaceModal() {
    const modal = document.getElementById('custom-replace-modal');
    const input = document.getElementById('custom-guid-input');
    const descriptionInput = document.getElementById('custom-description-input');
    const confirmBtn = document.getElementById('confirm-replace-btn');
    const hint = input?.parentElement?.querySelector('.input-hint');
    
    if (!modal || !input || !descriptionInput || !confirmBtn) return;
    
    input.value = '';
    descriptionInput.value = '';
    input.classList.remove('invalid');
    confirmBtn.disabled = true;
    
    modal.classList.add('show');
    input.focus();
}

function closeCustomReplaceModal() {
    const modal = document.getElementById('custom-replace-modal');
    if (modal) {
        modal.classList.remove('show');
    }
}

function validateGuidInput(value) {
    const input = document.getElementById('custom-guid-input');
    const confirmBtn = document.getElementById('confirm-replace-btn');
    const hint = input?.parentElement?.querySelector('.input-hint');
    
    if (!input || !confirmBtn || !hint) return;
    
    const guidPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    
    if (value.length === 0) {
        input.classList.remove('invalid');
        confirmBtn.disabled = true;
        hint.textContent = _('modal.inputHint');
        hint.style.color = '#888';
    } else if (guidPattern.test(value)) {
        input.classList.remove('invalid');
        confirmBtn.disabled = false;
        hint.textContent = _('modal.inputHintValid');
        hint.style.color = '#3fb950';
    } else {
        input.classList.add('invalid');
        confirmBtn.disabled = true;
        hint.textContent = _('modal.inputHintInvalid');
        hint.style.color = '#f85149';
    }
}

async function confirmCustomReplace() {
    const input = document.getElementById('custom-guid-input');
    const descriptionInput = document.getElementById('custom-description-input');
    const confirmBtn = document.getElementById('confirm-replace-btn');
    const statusElement = document.getElementById('operation-status');

    if (!input || !descriptionInput || !confirmBtn || !statusElement) return;

    const newGuid = input.value.trim();
    const description = descriptionInput.value.trim() || `Custom replace ${new Date().toLocaleString()}`;

    if (!validateGuidFormat(newGuid)) {
        updateStatus('error.invalidGuid');
        return;
    }

    const confirmed = await showConfirmDialog(
        _('confirm.title'),
        _('confirm.backupBeforeReplace'),
        _('button.confirm'),
        _('button.cancel')
    );
    if (!confirmed) {
        return;
    }

    const permCheck = await checkPermissionBeforeWrite();
    if (!permCheck.hasPermission) {
        if (!permCheck.needRestart) {
            updateStatus('status.permissionRequired');
        }
        return;
    }

    confirmBtn.disabled = true;
    confirmBtn.textContent = _('button.confirming');
    updateStatus('status.backingUp');

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
                guid: document.getElementById('machine-guid')?.textContent,
                source: MOCK_REGISTRY_SOURCE,
                timestamp: Date.now() / 1000,
                description: `Pre-replace backup`
            };
            const mockPostBackup = {
                id: `backup_post_${Date.now()}`,
                guid: newGuid,
                source: MOCK_REGISTRY_SOURCE,
                timestamp: Date.now() / 1000 + 1,
                description: `Custom replace backup: ${newGuid}`
            };

            const mockResult = {
                success: true,
                previous_guid: mockPreBackup.guid,
                new_guid: newGuid,
                pre_backup: mockPreBackup,
                post_backup: mockPostBackup,
                message: `Successfully replaced MachineGuid with: ${newGuid}`,
                error: null
            };

            const guidElement = document.getElementById('machine-guid');
            if (guidElement) guidElement.textContent = newGuid;
            backupsData.unshift(mockPostBackup);
            displayReplaceResult(mockResult);
        }

        closeCustomReplaceModal();
        await loadBackups();
        await readMachineId();
    } catch (error) {
        console.error('Replace failed:', error);
        updateStatus('error.operationFailed', { error });
    } finally {
        confirmBtn.disabled = false;
        confirmBtn.textContent = _('button.confirmReplace');
    }
}

function validateGuidFormat(guid) {
    const guidPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    return guidPattern.test(guid);
}

function displayReplaceResult(result) {
    const statusElement = document.getElementById('operation-status');
    
    if (!statusElement) return;
    
    if (result.success) {
        let backupInfo = '';
        if (result.pre_backup) {
            backupInfo = `<br><small style="color: #8b949e;">📦 ${_('status.backupSuccess', { id: result.pre_backup.id })}</small>`;
        }
        if (result.post_backup) {
            backupInfo += `<br><small style="color: #8b949e;">📦 ${result.post_backup.id}</small>`;
        }
        statusElement.innerHTML = `<span style="color: #3fb950;">✅ ${result.message}</span>${backupInfo}`;
        console.log('✅ Replace successful:', result.message);
        console.log('📦 Backup info:', { pre_backup: result.pre_backup, post_backup: result.post_backup });
    } else {
        statusElement.innerHTML = `<span style="color: #f85149;">❌ ${result.error}</span>`;
        console.error('❌ Replace failed:', result.error);
    }
}

function openRandomGenerateModal() {
    const modal = document.getElementById('random-generate-modal');
    const displayElement = document.getElementById('generated-guid-display');
    const descriptionInput = document.getElementById('random-description-input');
    
    if (!modal || !displayElement) return;
    
    const randomGuid = generateRandomGuid();
    displayElement.textContent = randomGuid;
    if (descriptionInput) descriptionInput.value = '';
    
    modal.classList.add('show');
}

function closeRandomGenerateModal() {
    const modal = document.getElementById('random-generate-modal');
    if (modal) {
        modal.classList.remove('show');
    }
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

    if (!displayElement || !confirmBtn || !statusElement) return;

    const newGuid = displayElement.textContent.trim();
    const description = descriptionInput?.value.trim() || `Random generate ${new Date().toLocaleString()}`;

    if (!validateGuidFormat(newGuid)) {
        updateStatus('error.invalidGuid');
        return;
    }

    const confirmed = await showConfirmDialog(
        _('confirm.title'),
        _('confirm.backupBeforeReplace'),
        _('button.confirm'),
        _('button.cancel')
    );
    if (!confirmed) {
        return;
    }

    const permCheck = await checkPermissionBeforeWrite();
    if (!permCheck.hasPermission) {
        if (!permCheck.needRestart) {
            updateStatus('status.permissionRequired');
        }
        return;
    }

    confirmBtn.disabled = true;
    confirmBtn.textContent = _('button.confirming');
    updateStatus('status.backingUp');

    try {
        if (window.__TAURI__) {
            const { invoke } = window.__TAURI__.core;
            const result = await invoke('generate_random_guid_command', {
                description: description
            });
            displayRandomGenerateResult(result);
        } else {
            const guidElement = document.getElementById('machine-guid');
            const mockPreBackup = {
                id: `backup_pre_${Date.now()}`,
                guid: guidElement?.textContent,
                source: MOCK_REGISTRY_SOURCE,
                timestamp: Date.now() / 1000,
                description: `Pre-replace backup`
            };
            const mockPostBackup = {
                id: `backup_post_${Date.now()}`,
                guid: newGuid,
                source: MOCK_REGISTRY_SOURCE,
                timestamp: Date.now() / 1000 + 1,
                description: `Random generate backup: ${newGuid}`
            };
            
            const mockResult = {
                success: true,
                previous_guid: mockPreBackup.guid,
                new_guid: newGuid,
                pre_backup: mockPreBackup,
                post_backup: mockPostBackup,
                message: `Successfully generated and replaced MachineGuid: ${newGuid}`,
                error: null
            };
            
            if (guidElement) guidElement.textContent = newGuid;
            backupsData.unshift(mockPostBackup);
            displayRandomGenerateResult(mockResult);
        }
        
        closeRandomGenerateModal();
        await loadBackups();
        await readMachineId();
    } catch (error) {
        console.error('Random generate failed:', error);
        updateStatus('error.operationFailed', { error });
    } finally {
        confirmBtn.disabled = false;
        confirmBtn.textContent = _('button.confirmReplace');
    }
}

function displayRandomGenerateResult(result) {
    const statusElement = document.getElementById('operation-status');
    
    if (!statusElement) return;
    
    if (result.success) {
        let backupInfo = '';
        if (result.pre_backup) {
            backupInfo = `<br><small style="color: #8b949e;">📦 ${result.pre_backup.id}</small>`;
        }
        if (result.post_backup) {
            backupInfo += `<br><small style="color: #8b949e;">📦 ${result.post_backup.id}</small>`;
        }
        statusElement.innerHTML = `<span style="color: #3fb950;">✅ ${result.message}</span>${backupInfo}`;
        console.log('✅ Random generation successful:', result.message);
        console.log('📦 Backup info:', { pre_backup: result.pre_backup, post_backup: result.post_backup });
    } else {
        statusElement.innerHTML = `<span style="color: #f85149;">❌ ${result.error}</span>`;
        console.error('❌ Random generation failed:', result.error);
    }
}

async function readMachineId() {
    const displayElement = document.getElementById('machine-guid');
    const button = document.getElementById('read-btn');
    
    if (!displayElement || !button) return;
    
    try {
        button.disabled = true;
        button.textContent = _('button.reading');
        displayElement.textContent = _('status.reading');
        
        if (window.__TAURI__) {
            const { invoke } = window.__TAURI__.core;
            const result = await invoke('read_machine_id');
            displayMachineId(result);
        } else {
            displayMachineId({
                success: true,
                guid: '550E8400-E29B-41D4-A716-446655440000',
                source: MOCK_REGISTRY_SOURCE,
                error: null
            });
        }
    } catch (error) {
        console.error('Failed to read MachineGuid:', error);
        displayElement.innerHTML = `<span style="color: #f85149;">${_('error.readFailed', { error })}</span>`;
    } finally {
        button.disabled = false;
        button.textContent = _('button.read');
    }
}

function displayMachineId(result) {
    const displayElement = document.getElementById('machine-guid');
    
    if (!displayElement) return;
    
    if (result.success) {
        displayElement.textContent = result.guid;
        displayElement.style.color = '#58a6ff';
        console.log('✅ MachineGuid read successfully:', result.guid);
        console.log('📍 Source:', result.source);
    } else {
        displayElement.innerHTML = `<span style="color: #f85149;">${_('error.readFailed', { error: result.error })}</span>`;
        console.error('❌ MachineGuid read failed:', result.error);
    }
}

async function backupMachineGuid() {
    const backupBtn = document.getElementById('backup-btn');
    const statusElement = document.getElementById('operation-status');
    
    if (!backupBtn || !statusElement) return;
    
    try {
        backupBtn.disabled = true;
        backupBtn.textContent = _('button.backingUp');
        statusElement.textContent = _('status.backingUp');
        statusElement.style.color = '#58a6ff';
        
        if (window.__TAURI__) {
            const { invoke } = window.__TAURI__.core;
            const result = await invoke('backup_machine_guid', { description: `Backup ${new Date().toLocaleString()}` });
            displayBackupResult(result);
        } else {
            const guidElement = document.getElementById('machine-guid');
            const mockBackup = {
                success: true,
                backup: {
                    id: `backup_${Date.now()}`,
                    guid: guidElement?.textContent,
                    source: MOCK_REGISTRY_SOURCE,
                    timestamp: Date.now() / 1000,
                    description: `Backup ${new Date().toLocaleString()}`
                },
                error: null
            };
            backupsData.unshift(mockBackup.backup);
            displayBackupResult(mockBackup);
        }
        
        await loadBackups();
    } catch (error) {
        console.error('Backup failed:', error);
        statusElement.innerHTML = `<span style="color: #f85149;">${_('error.backupFailed', { error })}</span>`;
    } finally {
        backupBtn.disabled = false;
        backupBtn.textContent = _('button.backup');
    }
}

function displayBackupResult(result) {
    const statusElement = document.getElementById('operation-status');
    if (!statusElement) return;

    if (result.success) {
        if (result.backup) {
            statusElement.innerHTML = `<span style="color: #3fb950;">${_('status.backupSuccess', { id: result.backup.id })}</span>`;
            console.log('✅ Backup successful:', result.backup);
        } else if (result.skipped) {
            statusElement.innerHTML = `<span style="color: #f9c440;">${_('status.backupSkipped')}</span>`;
            console.log('⏭️ Skipped duplicate backup');
        } else {
            statusElement.innerHTML = `<span style="color: #f9c440;">${_('status.noBackup')}</span>`;
            console.log('⚠️ No backup created');
        }
    } else {
        const errorMsg = result.error || 'Unknown error';
        statusElement.innerHTML = `<span style="color: #f85149;">${_('error.backupFailed', { error: errorMsg })}</span>`;
        console.error('❌ Backup failed:', errorMsg);
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
        console.error('Failed to load backups:', error);
    }
}

function loadBackupsMock() {
    backupsData = [
        {
            id: 'backup_1737950000000',
            guid: '550E8400-E29B-41D4-A716-446655440000',
            source: MOCK_REGISTRY_SOURCE,
            timestamp: 1737950000,
            description: 'Initial backup'
        }
    ];
}

function displayBackupList(result) {
    const listElement = document.getElementById('backup-list');
    
    if (!listElement) return;
    
    if (result.success && result.backups.length > 0) {
        listElement.innerHTML = result.backups.map(backup => {
            const date = new Date(backup.timestamp * 1000).toLocaleString();
            const description = backup.description || _('backup.noDescription');
            return `
                <div class="backup-item" data-id="${backup.id}">
                    <div class="backup-info">
                        <div class="backup-guid">${backup.guid}</div>
                        <div class="backup-meta">${date} - ${description}</div>
                    </div>
                    <div class="backup-actions">
                        <button class="copy-backup-btn" data-guid="${backup.guid}" title="${_('tooltip.copyGuid')}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                        </button>
                        <button class="restore-backup-btn" data-id="${backup.id}" data-guid="${backup.guid}" title="${_('backup.restoreTitle')}">${_('button.restore')}</button>
                        <button class="delete-backup-btn" data-id="${backup.id}" title="${_('backup.deleteTitle')}">${_('button.delete')}</button>
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
                const id = e.currentTarget.dataset.id;
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
        listElement.innerHTML = `<div class="backup-item"><div class="backup-info">${_('backup.noBackups')}</div></div>`;
    }
}

async function copyToClipboard(text) {
    const statusElement = document.getElementById('operation-status');
    
    try {
        if (navigator.clipboard && window.__TAURI__) {
            await navigator.clipboard.writeText(text);
            updateStatus('status.copied');
        } else if (window.__TAURI__) {
            const { writeText } = window.__TAURI__.clipboard;
            await writeText(text);
            updateStatus('status.copied');
        } else {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            updateStatus('status.copied');
        }
        console.log('✅ Copied to clipboard:', text);
    } catch (error) {
        console.error('Copy failed:', error);
        updateStatus('error.copyFailed', { error });
    }
}

async function deleteBackup(id) {
    const confirmed = await showConfirmDialog(
        _('confirm.title'),
        _('confirm.deleteBackup'),
        _('button.confirm'),
        _('button.cancel')
    );
    if (!confirmed) return;
    
    const statusElement = document.getElementById('operation-status');
    
    try {
        if (window.__TAURI__) {
            const { invoke } = window.__TAURI__.core;
            const result = await invoke('delete_backup_by_id', { id });
            
            if (result.success) {
                updateStatus('status.deleted');
                await loadBackups();
            } else {
                updateStatus('error.deleteFailed', { error: result.error });
            }
        } else {
            backupsData = backupsData.filter(b => b.id !== id);
            updateStatus('status.deleted');
            await loadBackups();
        }
    } catch (error) {
        console.error('Failed to delete backup:', error);
        updateStatus('error.deleteFailed', { error });
    }
}

async function restoreBackup(id, guid) {
    const statusElement = document.getElementById('operation-status');

    const confirmed = await showConfirmDialog(
        _('confirm.title'),
        _('confirm.backupBeforeRestore'),
        _('button.confirm'),
        _('button.cancel')
    );
    if (!confirmed) {
        return;
    }

    const permCheck = await checkPermissionBeforeWrite();
    if (!permCheck.hasPermission) {
        if (!permCheck.needRestart) {
            updateStatus('status.permissionRequired');
        }
        return;
    }

    try {
        statusElement.textContent = _('status.restoring');
        statusElement.style.color = '#58a6ff';

        if (window.__TAURI__) {
            const { invoke } = window.__TAURI__.core;
            const result = await invoke('restore_backup_by_id_command', { id });

            if (!result.success) {
                statusElement.innerHTML = `<span style="color: #f85149;">${_('error.restoreFailed', { error: result.error })}</span>`;
                return;
            }

            statusElement.innerHTML = `<span style="color: #3fb950;">${_('status.restored', { guid: result.restored_guid })}</span>`;
            await loadBackups();
            await readMachineId();

            const preBackup = result.pre_backup;
            const preBackupTime = preBackup ? new Date(preBackup.timestamp * 1000).toLocaleString() : '-';
            const restoredFrom = result.restored_from;

            alert(
                `Restore Complete\n\n` +
                `Previous MachineGuid: ${result.previous_guid}\n` +
                `Restored MachineGuid: ${result.restored_guid}\n\n` +
                `Source Backup: ${restoredFrom?.id || id}\n` +
                `Source MachineGuid: ${restoredFrom?.guid || guid}\n\n` +
                `Current MachineGuid has been backed up\n` +
                `Backup ID: ${preBackup?.id || '-'}\n` +
                `Backup Time: ${preBackupTime}`
            );
        } else {
            const guidElement = document.getElementById('machine-guid');
            const previousGuid = guidElement?.textContent;
            const preBackup = {
                id: `backup_${Date.now()}`,
                guid: previousGuid,
                source: MOCK_REGISTRY_SOURCE,
                timestamp: Date.now() / 1000,
                description: `Auto backup before restore: From backup ${id} to ${guid}`
            };
            backupsData.unshift(preBackup);
            if (guidElement) guidElement.textContent = guid;
            statusElement.innerHTML = `<span style="color: #3fb950;">${_('status.restored', { guid })}</span>`;
            await loadBackups();

            alert(
                `Restore Complete\n\n` +
                `Previous MachineGuid: ${previousGuid}\n` +
                `Restored MachineGuid: ${guid}\n\n` +
                `Source Backup: ${id}\n` +
                `Source MachineGuid: ${guid}\n\n` +
                `Current MachineGuid has been backed up\n` +
                `Backup ID: ${preBackup.id}\n` +
                `Backup Time: ${new Date(preBackup.timestamp * 1000).toLocaleString()}`
            );
        }
    } catch (error) {
        console.error('Restore failed:', error);
        statusElement.innerHTML = `<span style="color: #f85149;">${_('error.restoreFailed', { error })}</span>`;
    }
}
