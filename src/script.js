// MachineID-Manage 前端交互逻辑

console.log('MachineID-Manage 初始化中...');

// 等待 Tauri 准备就绪
window.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM 已加载，等待 Tauri 绑定...');
    
    // 测试 Tauri 是否可用
    if (window.__TAURI__) {
        console.log('Tauri 已就绪');
        // 读取机器码
        await readMachineId();
    } else {
        console.log('Tauri 未就绪（开发模式），使用模拟数据');
        // 开发模式：使用模拟数据
        displayMachineId({
            success: true,
            guid: '550E8400-E29B-41D4-A716-446655440000',
            source: 'HKLM\\SOFTWARE\\Microsoft\\Cryptography',
            error: null
        });
    }
    
    // 初始化 UI 事件监听器
    initializeEventListeners();
});

function initializeEventListeners() {
    // 读取机器码
    document.getElementById('read-btn')?.addEventListener('click', async () => {
        await readMachineId();
    });
    
    // 备份机器码
    document.getElementById('backup-btn')?.addEventListener('click', () => {
        console.log('备份按钮点击 - 功能开发中');
    });
    
    // 恢复机器码
    document.getElementById('restore-btn')?.addEventListener('click', () => {
        console.log('恢复按钮点击 - 功能开发中');
    });
    
    // 随机生成
    document.getElementById('generate-btn')?.addEventListener('click', () => {
        console.log('生成按钮点击 - 功能开发中');
    });
    
    // 自定义替换
    document.getElementById('replace-btn')?.addEventListener('click', () => {
        console.log('替换按钮点击 - 功能开发中');
    });
}

/**
 * 读取机器码
 * 调用 Tauri 后端命令 read_machine_id
 */
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
            // 开发模式
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

/**
 * 显示机器码信息
 * @param {Object} result - 读取结果
 * @param {boolean} result.success - 是否成功
 * @param {string} result.guid - MachineGuid 值
 * @param {string} result.source - 数据来源
 * @param {string|null} result.error - 错误信息
 */
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
