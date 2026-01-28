import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { DialogConfig } from '@types';

type DialogResolve = (value: boolean) => void;
type AlertResolve = () => void;

/**
 * 对话框状态管理
 */
export const useDialogStore = defineStore('dialog', () => {
  // Confirm Dialog State
  const confirmVisible = ref(false);
  const confirmConfig = ref<DialogConfig>({
    title: '确认操作',
    message: '确定要执行此操作吗？',
  });
  let confirmResolver: DialogResolve | null = null;

  // Alert Dialog State
  const alertVisible = ref(false);
  const alertConfig = ref<DialogConfig>({
    title: '提示',
    message: '',
  });
  let alertResolver: AlertResolve | null = null;

  // Replace Modal State
  const replaceModalVisible = ref(false);

  // Generate Modal State
  const generateModalVisible = ref(false);

  /**
   * 显示确认对话框
   */
  function showConfirm(config: DialogConfig): Promise<boolean> {
    return new Promise((resolve) => {
      confirmConfig.value = {
        title: config.title,
        message: config.message,
        confirmText: config.confirmText || '确认',
        cancelText: config.cancelText || '取消',
        variant: config.variant || 'default',
      };
      confirmResolver = resolve;
      confirmVisible.value = true;
    });
  }

  /**
   * 确认操作
   */
  function confirm(): void {
    confirmVisible.value = false;
    confirmResolver?.(true);
    confirmResolver = null;
  }

  /**
   * 取消操作
   */
  function cancel(): void {
    confirmVisible.value = false;
    confirmResolver?.(false);
    confirmResolver = null;
  }

  /**
   * 显示提示对话框
   */
  function showAlert(config: DialogConfig): Promise<void> {
    return new Promise((resolve) => {
      alertConfig.value = {
        title: config.title,
        message: config.message,
        confirmText: config.confirmText || '确定',
      };
      alertResolver = resolve;
      alertVisible.value = true;
    });
  }

  /**
   * 关闭提示对话框
   */
  function closeAlert(): void {
    alertVisible.value = false;
    alertResolver?.();
    alertResolver = null;
  }

  /**
   * 打开替换对话框
   */
  function openReplaceModal(): void {
    replaceModalVisible.value = true;
  }

  /**
   * 关闭替换对话框
   */
  function closeReplaceModal(): void {
    replaceModalVisible.value = false;
  }

  /**
   * 打开生成对话框
   */
  function openGenerateModal(): void {
    generateModalVisible.value = true;
  }

  /**
   * 关闭生成对话框
   */
  function closeGenerateModal(): void {
    generateModalVisible.value = false;
  }

  return {
    // State
    confirmVisible,
    confirmConfig,
    alertVisible,
    alertConfig,
    replaceModalVisible,
    generateModalVisible,
    // Actions
    showConfirm,
    confirm,
    cancel,
    showAlert,
    closeAlert,
    openReplaceModal,
    closeReplaceModal,
    openGenerateModal,
    closeGenerateModal,
  };
});
