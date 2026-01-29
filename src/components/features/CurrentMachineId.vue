<template>
  <section class="glass-card rounded-2xl p-6 animate-fade-in-up">
    <!-- Header -->
    <div class="flex items-center justify-between mb-5">
      <div class="flex items-center gap-3">
        <div class="icon-container w-10 h-10 rounded-xl">
          <Fingerprint class="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h2 class="text-lg font-semibold text-white">当前 MachineGuid</h2>
          <p class="text-xs text-slate-400">系统唯一标识符</p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        @click="refresh"
        :disabled="isLoading"
        class="gap-2"
      >
        <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isLoading }" />
        刷新
      </Button>
    </div>

    <!-- GUID Display -->
    <div class="code-block rounded-xl p-5">
      <div v-if="isLoading && !currentGuid" class="flex items-center justify-center py-8">
        <div class="animate-shimmer w-full h-8 rounded" />
      </div>
      
      <div v-else-if="error" class="flex items-center gap-3 text-red-400 py-4">
        <AlertCircle class="w-5 h-5" />
        <span>{{ error }}</span>
      </div>
      
      <div v-else-if="currentGuid" class="space-y-4">
        <div class="flex items-center justify-between gap-4">
          <code class="text-blue-400 text-lg font-mono tracking-wide">{{ currentGuid }}</code>
          <Button
            variant="ghost"
            size="sm"
            @click="copyGuid"
            class="text-slate-400 hover:text-white shrink-0"
          >
            <Copy class="w-4 h-4 mr-1.5" />
            复制
          </Button>
        </div>
        <div class="divider-gradient" />
        <div class="flex items-center gap-2 text-xs text-slate-500">
          <Database class="w-3.5 h-3.5" />
          <span>来源: {{ source }}</span>
        </div>
      </div>
      
      <div v-else class="text-center py-8 text-slate-500">
        <Fingerprint class="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>无法读取机器码</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Fingerprint, RefreshCw, Copy, AlertCircle, Database } from 'lucide-vue-next';
import { useMachineIdStore, useDialogStore } from '@stores';
import Button from '@components/ui/Button.vue';

const machineIdStore = useMachineIdStore();
const dialogStore = useDialogStore();

const { currentGuid, source, isLoading, error } = storeToRefs(machineIdStore);

async function refresh() {
  const result = await machineIdStore.readMachineId();
  if (result.success) {
    await dialogStore.showSuccess('刷新成功', '机器码已更新');
  } else {
    await dialogStore.showError('刷新失败', result.error || '无法读取机器码');
  }
}

async function copyGuid() {
  const success = await machineIdStore.copyToClipboard();
  if (success) {
    await dialogStore.showSuccess('复制成功', 'MachineGuid 已复制到剪贴板');
  } else {
    await dialogStore.showError('复制失败', '无法复制到剪贴板');
  }
}
</script>
