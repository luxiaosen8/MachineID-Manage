import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { invoke } from '@tauri-apps/api/core';
import type { MachineIdInfo, OperationResult, PermissionCheckResult, WriteResult } from '@types';

/**
 * 机器码状态管理
 */
export const useMachineIdStore = defineStore('machineId', () => {
  // State
  const machineId = ref<MachineIdInfo | null>(null);
  const hasPermission = ref<boolean>(false);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  // Getters
  const currentGuid = computed(() => machineId.value?.guid ?? '');
  const source = computed(() => machineId.value?.source ?? '');
  const isReady = computed(() => machineId.value !== null);
  const canModify = computed(() => hasPermission.value);

  /**
   * 初始化应用
   */
  async function initialize(): Promise<void> {
    await checkPermission();
    await readMachineId();
  }

  /**
   * 读取机器码
   */
  async function readMachineId(): Promise<OperationResult<MachineIdInfo>> {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await invoke<{
        success: boolean;
        guid: string;
        source: string;
        error?: string;
      }>('read_machine_id');

      if (result.success) {
        machineId.value = {
          guid: result.guid,
          source: result.source,
        };
        return { success: true, data: machineId.value };
      } else {
        error.value = result.error || '读取机器码失败';
        return { success: false, error: error.value };
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '未知错误';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * 检查权限
   */
  async function checkPermission(): Promise<OperationResult<boolean>> {
    try {
      const result = await invoke<{
        success: boolean;
        hasPermission: boolean;
        error?: string;
      }>('check_permission_command');

      hasPermission.value = result.hasPermission;
      return { success: result.success, data: result.hasPermission };
    } catch (e) {
      hasPermission.value = false;
      return {
        success: false,
        data: false,
        error: e instanceof Error ? e.message : '权限检查失败',
      };
    }
  }

  /**
   * 写入机器码
   */
  async function writeMachineId(
    newGuid: string,
    description?: string
  ): Promise<OperationResult<WriteResult>> {
    if (!hasPermission.value) {
      return { success: false, error: '没有管理员权限' };
    }

    isLoading.value = true;
    error.value = null;

    try {
      const result = await invoke<{
        success: boolean;
        previousGuid: string;
        newGuid: string;
        preBackup?: { id: string; guid: string; source: string; timestamp: number; description?: string };
        postBackup?: { id: string; guid: string; source: string; timestamp: number; description?: string };
        message?: string;
        error?: string;
      }>('write_machine_guid_command', { newGuid, description });

      if (result.success) {
        machineId.value = {
          guid: result.newGuid,
          source: machineId.value?.source || '',
        };

        const writeResult: WriteResult = {
          previousGuid: result.previousGuid,
          newGuid: result.newGuid,
          preBackup: result.preBackup,
          postBackup: result.postBackup,
        };

        return { success: true, data: writeResult, message: result.message };
      } else {
        error.value = result.error || '写入机器码失败';
        return { success: false, error: error.value };
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '未知错误';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * 生成随机机器码
   */
  async function generateRandomMachineId(
    description?: string
  ): Promise<OperationResult<WriteResult>> {
    if (!hasPermission.value) {
      return { success: false, error: '没有管理员权限' };
    }

    isLoading.value = true;
    error.value = null;

    try {
      const result = await invoke<{
        success: boolean;
        previousGuid: string;
        newGuid: string;
        preBackup?: { id: string; guid: string; source: string; timestamp: number; description?: string };
        postBackup?: { id: string; guid: string; source: string; timestamp: number; description?: string };
        message?: string;
        error?: string;
      }>('generate_random_guid_command', { description });

      if (result.success) {
        machineId.value = {
          guid: result.newGuid,
          source: machineId.value?.source || '',
        };

        const writeResult: WriteResult = {
          previousGuid: result.previousGuid,
          newGuid: result.newGuid,
          preBackup: result.preBackup,
          postBackup: result.postBackup,
        };

        return { success: true, data: writeResult, message: result.message };
      } else {
        error.value = result.error || '生成机器码失败';
        return { success: false, error: error.value };
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '未知错误';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * 复制机器码到剪贴板
   */
  async function copyToClipboard(): Promise<boolean> {
    if (!machineId.value?.guid) return false;

    try {
      const { writeText } = await import('@tauri-apps/plugin-clipboard-manager');
      await writeText(machineId.value.guid);
      return true;
    } catch {
      // 降级方案：使用原生 API
      try {
        await navigator.clipboard.writeText(machineId.value.guid);
        return true;
      } catch {
        return false;
      }
    }
  }

  return {
    // State
    machineId,
    hasPermission,
    isLoading,
    error,
    // Getters
    currentGuid,
    source,
    isReady,
    canModify,
    // Actions
    initialize,
    readMachineId,
    checkPermission,
    writeMachineId,
    generateRandomMachineId,
    copyToClipboard,
  };
});
