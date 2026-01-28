<template>
  <section class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
    <h2 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
      <Settings class="w-5 h-5 text-purple-400" />
      管理操作
    </h2>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Button
        variant="secondary"
        class="w-full"
        :disabled="!canModify || isLoading"
        @click="handleBackup"
      >
        <Save class="w-4 h-4 mr-2" />
        备份机器码
      </Button>

      <Button
        variant="default"
        class="w-full bg-purple-600 hover:bg-purple-700"
        :disabled="!canModify || isLoading"
        @click="dialogStore.openGenerateModal()"
      >
        <Sparkles class="w-4 h-4 mr-2" />
        随机生成
      </Button>

      <Button
        variant="destructive"
        class="w-full"
        :disabled="!canModify || isLoading"
        @click="dialogStore.openReplaceModal()"
      >
        <Edit3 class="w-4 h-4 mr-2" />
        自定义替换
      </Button>
    </div>

    <div v-if="!canModify" class="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
      <p class="text-sm text-amber-400 flex items-center gap-2">
        <AlertCircle class="w-4 h-4" />
        需要管理员权限才能执行修改操作
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Settings, Save, Sparkles, Edit3, AlertCircle } from 'lucide-vue-next';
import { useMachineIdStore, useBackupStore, useDialogStore } from '@stores';
import Button from '@components/ui/Button.vue';

const machineIdStore = useMachineIdStore();
const backupStore = useBackupStore();
const dialogStore = useDialogStore();

const { canModify, isLoading } = machineIdStore;

async function handleBackup() {
  const result = await backupStore.createBackup('手动备份');
  if (result.success) {
    await dialogStore.showAlert({
      title: '备份成功',
      message: result.message || '机器码已备份',
    });
  } else {
    await dialogStore.showAlert({
      title: '备份失败',
      message: result.error || '备份过程中发生错误',
    });
  }
}
</script>
