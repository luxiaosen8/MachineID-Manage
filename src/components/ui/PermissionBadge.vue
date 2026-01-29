<template>
  <div
    class="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 cursor-pointer hover:scale-105"
    :class="badgeClass"
    :title="tooltipText"
    @click="handleClick"
  >
    <RefreshCw 
      v-if="isLoading" 
      class="w-3.5 h-3.5 animate-spin" 
    />
    <Shield 
      v-else-if="hasPermission && !permissionError" 
      class="w-3.5 h-3.5" 
    />
    <ShieldAlert 
      v-else 
      class="w-3.5 h-3.5" 
    />
    <span>{{ badgeText }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Shield, ShieldAlert, RefreshCw } from 'lucide-vue-next';
import { useMachineIdStore, useDialogStore } from '@stores';
import { storeToRefs } from 'pinia';

const machineIdStore = useMachineIdStore();
const dialogStore = useDialogStore();

const { hasPermission, permissionMethod, permissionError, isLoading, isPermissionStale } = storeToRefs(machineIdStore);

const badgeClass = computed(() => {
  if (isLoading.value) {
    return 'bg-slate-700/80 text-slate-300 border border-slate-600';
  }
  
  if (permissionError.value) {
    return 'bg-red-500/20 text-red-400 border border-red-500/30';
  }
  
  if (hasPermission.value) {
    return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
  }
  
  return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
});

const badgeText = computed(() => {
  if (isLoading.value) {
    return '检测中';
  }
  
  if (permissionError.value) {
    return '检测失败';
  }
  
  if (hasPermission.value) {
    return '管理员';
  }
  
  return '普通用户';
});

const tooltipText = computed(() => {
  if (isPermissionStale.value && !isLoading.value) {
    return '点击刷新权限状态';
  }
  
  if (permissionError.value) {
    return `检测失败: ${permissionError.value}，点击重试`;
  }
  
  if (hasPermission.value) {
    return '当前以管理员身份运行，可以修改注册表';
  }
  
  return '当前为普通权限，修改操作需要管理员权限';
});

async function handleClick() {
  if (isLoading.value) return;
  
  const result = await machineIdStore.refreshPermission();
  
  if (!result.success) {
    await dialogStore.showError(
      '权限检测失败',
      result.error || '无法检测权限状态，请检查系统设置'
    );
  } else if (result.data?.checkSuccess && !result.data?.hasPermission) {
    const confirmed = await dialogStore.showConfirm({
      title: '需要管理员权限',
      message: '当前为普通权限，修改操作需要管理员权限。是否以管理员身份重启程序？',
      confirmText: '是，重启程序',
      cancelText: '取消',
      variant: 'default',
      type: 'permission',
    });
    
    if (confirmed) {
      const restartResult = await machineIdStore.restartAsAdmin();
      if (!restartResult.success) {
        await dialogStore.showError('重启失败', restartResult.error || '无法以管理员身份重启程序');
      }
    }
  }
}
</script>
