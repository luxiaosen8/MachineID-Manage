<template>
  <section class="glass-card rounded-2xl p-6 animate-fade-in-up animation-delay-100">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-5">
      <div class="icon-container w-10 h-10 rounded-xl">
        <Settings class="w-5 h-5 text-purple-400" />
      </div>
      <div>
        <h2 class="text-lg font-semibold text-white">管理操作</h2>
        <p class="text-xs text-slate-400">备份、生成和替换机器码</p>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
      <Button
        variant="secondary"
        class="w-full h-12 gap-2 group"
        :disabled="isLoading"
        @click="handleBackup"
      >
        <div class="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
          <Save class="w-4 h-4 text-emerald-400" />
        </div>
        <span class="font-medium">备份机器码</span>
      </Button>

      <Button
        class="w-full h-12 gap-2 btn-modern group"
        :disabled="isLoading"
        @click="handleGenerate"
      >
        <div class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
          <Sparkles class="w-4 h-4 text-white" />
        </div>
        <span class="font-medium">随机生成</span>
      </Button>

      <Button
        variant="destructive"
        class="w-full h-12 gap-2 group"
        :disabled="isLoading"
        @click="handleReplace"
      >
        <div class="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
          <Edit3 class="w-4 h-4 text-red-400" />
        </div>
        <span class="font-medium">自定义替换</span>
      </Button>
    </div>

    <!-- Permission Status -->
    <div 
      v-if="!canModify && !isLoading" 
      class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20"
    >
      <div class="flex items-start gap-3">
        <div class="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
          <AlertCircle class="w-4 h-4 text-amber-400" />
        </div>
        <div class="flex-1">
          <p class="text-sm font-medium text-amber-400 mb-1">
            当前为普通权限
          </p>
          <p class="text-xs text-amber-400/70 leading-relaxed">
            修改操作需要管理员权限。点击上方"随机生成"或"自定义替换"按钮可申请提升权限。
          </p>
        </div>
      </div>
    </div>

    <div 
      v-else-if="canModify && !isLoading" 
      class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
    >
      <div class="flex items-start gap-3">
        <div class="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
          <CheckCircle2 class="w-4 h-4 text-emerald-400" />
        </div>
        <div class="flex-1">
          <p class="text-sm font-medium text-emerald-400 mb-1">
            管理员权限已获取
          </p>
          <p class="text-xs text-emerald-400/70 leading-relaxed">
            您可以执行所有操作，包括修改注册表。
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Settings, Save, Sparkles, Edit3, AlertCircle, CheckCircle2 } from 'lucide-vue-next';
import { useMachineIdStore, useBackupStore, useDialogStore } from '@stores';
import Button from '@components/ui/Button.vue';

const machineIdStore = useMachineIdStore();
const backupStore = useBackupStore();
const dialogStore = useDialogStore();

const { canModify, isLoading, currentGuid } = storeToRefs(machineIdStore);

async function handleBackup() {
  // 先加载备份列表以检查是否已存在相同 GUID 的备份
  await backupStore.loadBackups();

  // 检查是否已存在相同 GUID 的系统备份
  const existingBackup = backupStore.backups.find(
    b => b.guid.toLowerCase() === currentGuid.value.toLowerCase()
  );

  let forceCreate = false;
  if (existingBackup) {
    // 已存在相同 GUID 的备份，弹窗提醒用户
    const confirmed = await dialogStore.showConfirm({
      title: '备份已存在',
      message: `当前机器码已在 ${existingBackup.formattedDate || new Date(existingBackup.timestamp * 1000).toLocaleString('zh-CN')} 备份过。\n\n是否仍然要创建新的备份？`,
      confirmText: '仍要备份',
      cancelText: '取消',
      variant: 'default',
      type: 'warning',
    });

    if (!confirmed) {
      return; // 用户取消，不创建备份
    }
    forceCreate = true; // 用户确认强制创建
  }

  const result = await backupStore.createBackup('手动备份', forceCreate);
  if (result.success) {
    if (result.message === '该机器码已存在备份，已跳过') {
      await dialogStore.showWarning('备份提示', '该机器码已存在备份，未创建新备份');
    } else {
      await dialogStore.showSuccess('备份成功', result.message || '机器码已备份');
    }
  } else {
    await dialogStore.showError('备份失败', result.error || '备份过程中发生错误');
  }
}

async function handleGenerate() {
  if (!canModify.value) {
    const confirmed = await dialogStore.showConfirm({
      title: '需要管理员权限',
      message: '随机生成机器码需要管理员权限。是否以管理员身份重启程序？',
      confirmText: '是，重启程序',
      cancelText: '取消',
      variant: 'default',
      type: 'permission',
    });

    if (confirmed) {
      const result = await machineIdStore.restartAsAdmin();
      if (result.success) {
        // 重启请求成功，显示提示信息
        await dialogStore.showSuccess(
          '正在重启',
          '程序将以管理员身份重启，请稍候...'
        );
        // 程序将在 500ms 后自动退出，不需要额外操作
      } else {
        await dialogStore.showError('重启失败', result.error || '无法以管理员身份重启程序');
      }
    }
    return;
  }

  const confirmed = await dialogStore.showConfirm({
    title: '确认随机生成',
    message: '确定要随机生成新的机器码吗？当前机器码将被替换。',
    confirmText: '生成',
    cancelText: '取消',
    variant: 'default',
    type: 'confirm',
  });

  if (confirmed) {
    dialogStore.openGenerateModal();
  }
}

async function handleReplace() {
  if (!canModify.value) {
    const confirmed = await dialogStore.showConfirm({
      title: '需要管理员权限',
      message: '自定义替换机器码需要管理员权限。是否以管理员身份重启程序？',
      confirmText: '是，重启程序',
      cancelText: '取消',
      variant: 'default',
      type: 'permission',
    });

    if (confirmed) {
      const result = await machineIdStore.restartAsAdmin();
      if (result.success) {
        // 重启请求成功，显示提示信息
        await dialogStore.showSuccess(
          '正在重启',
          '程序将以管理员身份重启，请稍候...'
        );
        // 程序将在 500ms 后自动退出，不需要额外操作
      } else {
        await dialogStore.showError('重启失败', result.error || '无法以管理员身份重启程序');
      }
    }
    return;
  }

  dialogStore.openReplaceModal();
}
</script>
