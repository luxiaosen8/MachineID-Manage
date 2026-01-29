<template>
  <section class="glass-card rounded-2xl p-6 animate-fade-in-up animation-delay-200">
    <!-- Header -->
    <div class="flex items-center justify-between mb-5">
      <div class="flex items-center gap-3">
        <div class="icon-container w-10 h-10 rounded-xl">
          <Archive class="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h2 class="text-lg font-semibold text-white flex items-center gap-2">
            备份列表
            <span v-if="backupCount > 0" class="px-2 py-0.5 rounded-full bg-slate-700 text-xs text-slate-300">
              {{ backupCount }}
            </span>
          </h2>
          <p class="text-xs text-slate-400">管理和恢复历史备份</p>
        </div>
      </div>
      <Button
        v-if="hasBackups"
        variant="ghost"
        size="sm"
        class="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-1.5"
        @click="handleClearAll"
      >
        <Trash2 class="w-4 h-4" />
        清空
      </Button>
    </div>

    <!-- Empty State -->
    <div v-if="!hasBackups" class="text-center py-12">
      <div class="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
        <Archive class="w-8 h-8 text-slate-600" />
      </div>
      <p class="text-slate-500 text-sm">暂无备份</p>
      <p class="text-slate-600 text-xs mt-1">点击"备份机器码"创建第一个备份</p>
    </div>

    <!-- Backup List -->
    <div v-else class="space-y-3 max-h-[320px] overflow-y-auto pr-1">
      <div
        v-for="(backup, index) in formattedBackups"
        :key="backup.id"
        class="group relative p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-600 transition-all duration-200 hover:shadow-lg hover:shadow-black/20"
        :class="{ 
          'border-blue-500/50 bg-blue-500/5': selectedBackupId === backup.id,
          'animate-fade-in-up': true 
        }"
        :style="{ animationDelay: `${index * 50}ms` }"
        @click="backupStore.selectBackup(backup.id)"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0">
            <code class="text-blue-400 text-sm font-mono block truncate">{{ backup.guid }}</code>
            <div class="mt-2 flex items-center gap-3 text-xs">
              <span class="text-slate-500 flex items-center gap-1">
                <Clock class="w-3 h-3" />
                {{ backup.formattedDate }}
              </span>
              <span v-if="backup.description" class="text-slate-400 flex items-center gap-1">
                <FileText class="w-3 h-3" />
                {{ backup.description }}
              </span>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              class="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700"
              @click.stop="copyGuid(backup.guid)"
              title="复制"
            >
              <Copy class="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              class="h-8 w-8 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10"
              @click.stop="handleRestore(backup.id)"
              title="恢复"
            >
              <RotateCcw class="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              class="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
              @click.stop="handleDelete(backup.id)"
              title="删除"
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
import { storeToRefs } from 'pinia';
import { Archive, Trash2, Copy, RotateCcw, Clock, FileText } from 'lucide-vue-next';
import { useBackupStore, useDialogStore, useMachineIdStore } from '@stores';
import Button from '@components/ui/Button.vue';

const backupStore = useBackupStore();
const dialogStore = useDialogStore();
const machineIdStore = useMachineIdStore();

const { formattedBackups, hasBackups, backupCount, selectedBackupId } = storeToRefs(backupStore);
const { canModify } = storeToRefs(machineIdStore);

async function copyGuid(guid: string) {
  const success = await backupStore.copyBackupGuid(guid);
  if (success) {
    await dialogStore.showSuccess('复制成功', 'GUID 已复制到剪贴板');
  }
}

async function handleRestore(id: string) {
  if (!canModify.value) {
    const confirmed = await dialogStore.showConfirm({
      title: '需要管理员权限',
      message: '恢复备份需要管理员权限。是否以管理员身份重启程序？',
      confirmText: '是，重启程序',
      cancelText: '取消',
      variant: 'default',
      type: 'permission',
    });

    if (confirmed) {
      const result = await machineIdStore.restartAsAdmin();
      if (!result.success) {
        await dialogStore.showError('重启失败', result.error || '无法以管理员身份重启程序');
      }
    }
    return;
  }

  const confirmed = await dialogStore.showConfirm({
    title: '确认恢复',
    message: '确定要恢复到该备份吗？当前机器码将被替换。',
    confirmText: '恢复',
    cancelText: '取消',
    variant: 'default',
    type: 'restore',
  });

  if (confirmed) {
    const result = await backupStore.restoreBackup(id);
    if (result.success) {
      await machineIdStore.readMachineId();
      await dialogStore.showSuccess('恢复成功', result.message || '机器码已恢复');
    } else {
      await dialogStore.showError('恢复失败', result.error || '恢复过程中发生错误');
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
    type: 'delete',
  });

  if (confirmed) {
    const result = await backupStore.deleteBackup(id);
    if (result.success) {
      await dialogStore.showSuccess('删除成功', '备份已删除');
    } else {
      await dialogStore.showError('删除失败', result.error || '删除过程中发生错误');
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
    type: 'delete',
  });

  if (confirmed) {
    const result = await backupStore.clearAllBackups();
    if (result.success) {
      await dialogStore.showSuccess('清空成功', '所有备份已删除');
    } else {
      await dialogStore.showError('清空失败', result.error || '清空过程中发生错误');
    }
  }
}
</script>
