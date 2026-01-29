/**
 * useClipboard 组合式函数
 * 提供剪贴板操作功能
 */

import { ref, readonly } from 'vue';

export interface UseClipboardReturn {
  isSupported: boolean;
  copied: Readonly<import('vue').Ref<boolean>>;
  copy: (text: string) => Promise<boolean>;
}

export function useClipboard(): UseClipboardReturn {
  const copied = ref(false);

  /**
   * 检查是否支持剪贴板 API
   */
  const isSupported = typeof navigator !== 'undefined' && 'clipboard' in navigator;

  /**
   * 复制文本到剪贴板
   */
  async function copy(text: string): Promise<boolean> {
    if (!isSupported) {
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      copied.value = true;

      // 2秒后重置 copied 状态
      setTimeout(() => {
        copied.value = false;
      }, 2000);

      return true;
    } catch {
      return false;
    }
  }

  return {
    isSupported,
    copied: readonly(copied),
    copy,
  };
}
