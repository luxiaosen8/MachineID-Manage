<template>
  <section class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-white flex items-center gap-2">
        <Archive class="w-5 h-5 text-emerald-400" />
        备份列表
        <span v-if="backupCount > 0" class="text-sm text-slate-400">
          ({{ backupCount }})
        </span>
      </h2>
      <Button
        v-if="hasBackups"
        variant="ghost"
        size="sm"
        class="text-red-400 hover:text-red-300 hover:bg-red-500/10"
        @click="handleClearAll"
      >
        <Trash2 class="w-4 h-4 mr-1" />
        清空
      </Button>
    </div>

    <div v-if="isLoading && !hasBackups" class="text-center py-8 text-slate-500">
      加载中...
    </div>

    <div v-else-if="!hasBackups" class="text-center py-8 text-slate-500">
      <Archive class="w-12 h-12 mx-auto mb-3 opacity-50" />
      <p>暂无备份</p>
    </div>

    <div v-else class="space-y-3 max-h-80 overflow-y-auto">
      <div
        v-for="backup in formattedBackups"
        :key="backup.id"
        class="group p-4 bg-slate-900/50 border border-slate-700/50 rounded-lg hover:border-slate-600 transition-colors"
        :class="{ 'border-blue-500/50 bg-blue-500/5': selectedBackupId === backup.id }"
        @click="backupStore.selectBackup(backup.id)"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0">
            <code class="text-blue-400 text-sm block truncate">{{ backup.guid }}</code>
            <div class="mt-1 flex items-center gap-2 text-xs text-slate-500">
              <span>{{ backup.formattedDate }}</span>
              <span v-if="backup.description" class="text-slate-400">
                · {{ backup.description }}
              </span>
            </div>
          </div>
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              class="h-8 w-8 text-slate-400 hover:text-white"
              @click.stop="copyGuid(backup.guid)"
            >
              <Copy class="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              class="h-8 w-8 text-slate-400 hover:text-blue-400"
              @click.stop="handleRestore(backup.id)"
            >
              <RotateCcw class="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              class="h-8 w-8 text-slate-400 hover:text-red-400"
              @click.stop="handleDelete(backup.id)"
            >
              <Trash2 class="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Archive, Trash2, Copy, RotateCcw } from 'lucide-vue-next';
import { useBackupStore, useDialogStore, useMachineIdStore } from '@stores';
import Button from '@components/ui/Button.vue';

const backupStore = useBackupStore();
const dialogStore = useDialogStore();
const machineIdStore = useMachineIdStore();

const { formattedBackups, hasBackups, backupCount, isLoading, selectedBackupId } = backupStore;

async function copyGuid(guid: string) {
  const success = await backupStore.copyBackupGuid(guid);
  if (success) {
    await dialogStore.showAlert({
      title: '复制成功',
      message: 'GUID 已复制到剪贴板',
    });
  }
}

async function handleRestore(id: string) {
  const confirmed = await dialogStore.showConfirm({
    title: '确认恢复',
    message: '确定要恢复到该备份吗？当前机器码将被替换。',
    confirmText: '恢复',
    cancelText: '取消',
    variant: 'default',
  });

  if (confirmed) {
    const result = await backupStore.restoreBackup(id);
    if (result.success) {
      await machineIdStore.readMachineId();
      await dialogStore.showAlert({
        title: '恢复成功',
        message: result.message || '机器码已恢复',
      });
    } else {
      await dialogStore.showAlert({
        title: '恢复失败',
        message: result.error || '恢复过程中发生错误',
      });
    }
  }
}

async function handleDelete(id: string) {
  const confirmed = await dialogStore.showConfirm({
    title: '确认删除',
    message: '确定要删除该备份吗？此操作不可撤销。',
    confirmText: '删除',
    cancelText: '取消',
    variant: 'destructive',
  });

  if (confirmed) {
    const result = await backupStore.deleteBackup(id);
    if (!result.success) {
      await dialogStore.showAlert({
        title: '删除失败',
        message: result.error || '删除过程中发生错误',
      });
    }
  }
}

async function handleClearAll() {
  const confirmed = await dialogStore.showConfirm({
    title: '确认清空',
    message: '确定要清空所有备份吗？此操作不可撤销。',
    confirmText: '清空',
    cancelText: '取消',
    variant: 'destructive',
  });

  if (confirmed) {
    const result = await backupStore.clearAllBackups();
    if (result.success) {
      await dialogStore.showAlert({
        title: '清空成功',
        message: '所有备份已删除',
      });
    } else {
      await dialogStore.showAlert({
        title: '清空失败',
        message: result.error || '清空过程中发生错误',
      });
    }
  }
}
</script>
