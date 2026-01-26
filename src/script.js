// MachineID-Manage 前端交互逻辑
// 当前阶段：仅占位符，不实现实际功能

console.log('MachineID-Manage 初始化中...');

// 等待 Tauri 准备就绪
window.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM 已加载，等待 Tauri 绑定...');
    
    // 测试 Tauri 是否可用
    if (window.__TAURI__) {
        console.log('Tauri 已就绪');
    } else {
        console.log('Tauri 未就绪（开发模式）');
    }
    
    // 初始化 UI 事件监听器（占位）
    initializeEventListeners();
});

function initializeEventListeners() {
    // 读取机器码
    document.getElementById('read-btn')?.addEventListener('click', () => {
        console.log('读取按钮点击 - 功能待实现');
    });
    
    // 备份机器码
    document.getElementById('backup-btn')?.addEventListener('click', () => {
        console.log('备份按钮点击 - 功能待实现');
    });
    
    // 恢复机器码
    document.getElementById('restore-btn')?.addEventListener('click', () => {
        console.log('恢复按钮点击 - 功能待实现');
    });
    
    // 随机生成
    document.getElementById('generate-btn')?.addEventListener('click', () => {
        console.log('生成按钮点击 - 功能待实现');
    });
    
    // 自定义替换
    document.getElementById('replace-btn')?.addEventListener('click', () => {
        console.log('替换按钮点击 - 功能待实现');
    });
}

// 模拟显示机器码（开发模式）
async function simulateReadMachineGuid() {
    const mockGuid = '00000000-0000-0000-0000-000000000000';
    document.getElementById('machine-guid').textContent = mockGuid;
    return mockGuid;
}
