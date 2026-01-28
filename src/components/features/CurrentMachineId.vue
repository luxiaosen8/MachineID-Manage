<template>
  <section class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-white flex items-center gap-2">
        <Fingerprint class="w-5 h-5 text-blue-400" />
        当前 MachineGuid
      </h2>
      <Button
        variant="outline"
        size="sm"
        @click="refresh"
        :disabled="isLoading"
      >
        <RefreshCw class="w-4 h-4 mr-1" :class="{ 'animate-spin': isLoading }" />
        刷新
      </Button>
    </div>

    <div class="bg-slate-900/80 rounded-lg p-4 font-mono text-sm">
      <div v-if="isLoading && !currentGuid" class="text-slate-500">
        加载中...
      </div>
      <div v-else-if="error" class="text-red-400">
        {{ error }}
      </div>
      <div v-else-if="currentGuid" class="space-y-2">
        <div class="flex items-center justify-between">
          <code class="text-blue-400 text-lg">{{ currentGuid }}</code>
          <Button
            variant="ghost"
            size="sm"
            @click="copyGuid"
            class="text-slate-400 hover:text-white"
          >
            <Copy class="w-4 h-4 mr-1" />
            复制
          </Button>
        </div>
        <div class="text-slate-500 text-xs">
          来源: {{ source }}
        </div>
      </div>
      <div v-else class="text-slate-500">
        无法读取机器码
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Fingerprint, RefreshCw, Copy } from 'lucide-vue-next';
import { useMachineIdStore, useDialogStore } from '@stores';
import Button from '@components/ui/Button.vue';

const machineIdStore = useMachineIdStore();
const dialogStore = useDialogStore();

const { currentGuid, source, isLoading, error } = machineIdStore;

async function refresh() {
  await machineIdStore.readMachineId();
}

async function copyGuid() {
  const success = await machineIdStore.copyToClipboard();
  if (success) {
    await dialogStore.showAlert({
      title: '复制成功',
      message: 'MachineGuid 已复制到剪贴板',
    });
  } else {
    await dialogStore.showAlert({
      title: '复制失败',
      message: '无法复制到剪贴板',
    });
  }
}
</script>
