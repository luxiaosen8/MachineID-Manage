import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { DialogConfig, AlertType, ConfirmType } from '../types/index';

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
  const isLoading = ref(false);
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
        type: config.type || 'confirm',
      };
      isLoading.value = false;
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
    isLoading.value = false;
  }

  /**
   * 取消操作
   */
  function cancel(): void {
    confirmVisible.value = false;
    confirmResolver?.(false);
    confirmResolver = null;
    isLoading.value = false;
  }

  /**
   * 设置加载状态
   */
  function setLoading(loading: boolean): void {
    isLoading.value = loading;
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
        type: config.type || 'info',
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
   * 显示成功提示
   */
  function showSuccess(title: string, message: string): Promise<void> {
    return showAlert({
      title,
      message,
      type: 'success',
      confirmText: '确定',
    });
  }

  /**
   * 显示错误提示
   */
  function showError(title: string, message: string): Promise<void> {
    return showAlert({
      title,
      message,
      type: 'error',
      confirmText: '确定',
    });
  }

  /**
   * 显示警告提示
   */
  function showWarning(title: string, message: string): Promise<void> {
    return showAlert({
      title,
      message,
      type: 'warning',
      confirmText: '确定',
    });
  }

  /**
   * 显示权限提示
   */
  function showPermissionAlert(title: string, message: string): Promise<void> {
    return showAlert({
      title,
      message,
      type: 'permission',
      confirmText: '确定',
    });
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
    isLoading,
    alertVisible,
    alertConfig,
    replaceModalVisible,
    generateModalVisible,
    // Actions
    showConfirm,
    confirm,
    cancel,
    setLoading,
    showAlert,
    closeAlert,
    showSuccess,
    showError,
    showWarning,
    showPermissionAlert,
    openReplaceModal,
    closeReplaceModal,
    openGenerateModal,
    closeGenerateModal,
  };
});
