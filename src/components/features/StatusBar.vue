<template>
  <section class="glass-card rounded-2xl p-4 animate-fade-in-up animation-delay-300">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div 
          class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300"
          :class="iconBgClass"
        >
          <component :is="statusIcon" class="w-4 h-4" :class="iconClass" />
        </div>
        <div>
          <p class="text-xs text-slate-500 mb-0.5">系统状态</p>
          <p class="text-sm font-medium" :class="statusClass">{{ statusText }}</p>
        </div>
      </div>
      
      <!-- 状态指示器 -->
      <div class="flex items-center gap-2">
        <div 
          class="w-2 h-2 rounded-full animate-pulse"
          :class="indicatorClass"
        />
        <span class="text-xs text-slate-500">{{ indicatorText }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { Info, CheckCircle2, AlertCircle, Loader2 } from 'lucide-vue-next';
import { useMachineIdStore, useBackupStore } from '@stores';

const machineIdStore = useMachineIdStore();
const backupStore = useBackupStore();

const { isLoading: machineIdLoading, error: machineIdError, currentGuid } = storeToRefs(machineIdStore);
const { isLoading: backupLoading } = storeToRefs(backupStore);

const isLoading = computed(() => machineIdLoading.value || backupLoading.value);

// 计算是否就绪（有当前 GUID 且没有错误）
const isReady = computed(() => currentGuid.value && !machineIdError.value);

const statusIcon = computed(() => {
  if (isLoading.value) return Loader2;
  if (machineIdError.value) return AlertCircle;
  if (isReady.value) return CheckCircle2;
  return Info;
});

const statusText = computed(() => {
  if (isLoading.value) return '处理中...';
  if (machineIdError.value) return '发生错误';
  if (isReady.value) return '准备就绪';
  return '初始化中...';
});

const statusClass = computed(() => {
  if (isLoading.value) return 'text-blue-400';
  if (machineIdError.value) return 'text-red-400';
  if (isReady.value) return 'text-emerald-400';
  return 'text-slate-400';
});

const iconBgClass = computed(() => {
  if (isLoading.value) return 'bg-blue-500/20';
  if (machineIdError.value) return 'bg-red-500/20';
  if (isReady.value) return 'bg-emerald-500/20';
  return 'bg-slate-700';
});

const iconClass = computed(() => {
  if (isLoading.value) return 'text-blue-400 animate-spin';
  if (machineIdError.value) return 'text-red-400';
  if (isReady.value) return 'text-emerald-400';
  return 'text-slate-400';
});

const indicatorClass = computed(() => {
  if (isLoading.value) return 'bg-blue-500';
  if (machineIdError.value) return 'bg-red-500';
  if (isReady.value) return 'bg-emerald-500';
  return 'bg-slate-500';
});

const indicatorText = computed(() => {
  if (isLoading.value) return '运行中';
  if (machineIdError.value) return '错误';
  if (isReady.value) return '正常';
  return '等待';
});
</script>
