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
            guid: '550E8400-E29B-41D4-A716-4466554400000',
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

function showAlertDialog(title, message, buttonText = null) {
    return new Promise((resolve) => {
        const modal = document.getElementById('alert-dialog-modal');
        const titleEl = document.getElementById('alert-dialog-title');
        const messageEl = document.getElementById('alert-dialog-message');
        const confirmBtn = document.getElementById('alert-dialog-confirm');

        if (!modal || !titleEl || !messageEl || !confirmBtn) {
            alert(message);
            resolve();
            return;
        }

        titleEl.textContent = title;
        messageEl.textContent = message;

        if (buttonText) {
            confirmBtn.textContent = buttonText;
        } else {
            confirmBtn.textContent = _('button.ok');
        }

        modal.classList.add('show');

        const handleClose = () => {
            closeAlertDialog();
            resolve();
        };

        confirmBtn.onclick = handleClose;

        modal.onclick = (e) => {
            if (e.target === modal) {
                handleClose();
            }
        };

        const handleKeydown = (e) => {
            if (e.key === 'Escape') {
                handleClose();
                document.removeEventListener('keydown', handleKeydown);
            }
        };
        document.addEventListener('keydown', handleKeydown);
    });
}

function closeAlertDialog() {
    const modal = document.getElementById('alert-dialog-modal');
    if (modal) {
        modal.classList.remove('show');
    }
}