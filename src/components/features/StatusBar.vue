<template>
  <section class="bg-slate-800/30 border border-slate-700/30 rounded-xl p-4">
    <div class="flex items-center gap-2 text-sm">
      <Info class="w-4 h-4 text-slate-400" />
      <span class="text-slate-400">状态:</span>
      <span :class="statusClass">{{ statusText }}</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Info } from 'lucide-vue-next';
import { useMachineIdStore, useBackupStore } from '@stores';

const machineIdStore = useMachineIdStore();
const backupStore = useBackupStore();

const statusText = computed(() => {
  if (machineIdStore.isLoading || backupStore.isLoading) {
    return '处理中...';
  }
  if (machineIdStore.error) {
    return machineIdStore.error;
  }
  if (machineIdStore.isReady) {
    return '准备就绪';
  }
  return '初始化中...';
});

const statusClass = computed(() => {
  if (machineIdStore.isLoading || backupStore.isLoading) {
    return 'text-blue-400';
  }
  if (machineIdStore.error) {
    return 'text-red-400';
  }
  if (machineIdStore.isReady) {
    return 'text-emerald-400';
  }
  return 'text-slate-400';
});
</script>
