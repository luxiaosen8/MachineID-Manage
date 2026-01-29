import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { invoke } from '@tauri-apps/api/core';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { BackupItem, OperationResult, RestoreResult } from '../types/index';

/**
 * 备份状态管理
 */
export const useBackupStore = defineStore('backup', () => {
  // State
  const backups = ref<BackupItem[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const selectedBackupId = ref<string | null>(null);

  // Getters
  const backupCount = computed(() => backups.value.length);
  const hasBackups = computed(() => backups.value.length > 0);
  const selectedBackup = computed(() =>
    backups.value.find((b) => b.id === selectedBackupId.value)
  );
  const formattedBackups = computed(() =>
    backups.value.map((backup) => ({
      ...backup,
      formattedDate: format(new Date(backup.timestamp * 1000), 'yyyy-MM-dd HH:mm:ss', {
        locale: zhCN,
      }),
    }))
  );

  /**
   * 加载备份列表
   */
  async function loadBackups(): Promise<OperationResult<BackupItem[]>> {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await invoke<{
        success: boolean;
        backups: Array<{
          id: string;
          guid: string;
          source: string;
          timestamp: number;
          description?: string;
        }>;
        count: number;
        error?: string;
      }>('list_backups');

      if (result.success) {
        backups.value = result.backups;
        return { success: true, data: backups.value };
      } else {
        error.value = result.error || '加载备份失败';
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
   * 创建备份
   * @param description 备份描述
   * @param force 是否强制创建（跳过重复检查）
   */
  async function createBackup(description?: string, force: boolean = false): Promise<OperationResult<BackupItem>> {
    isLoading.value = true;
    error.value = null;

    try {
      // 如果不强制创建，先检查是否已存在相同 GUID 的备份
      if (!force) {
        const loadResult = await loadBackups();
        if (loadResult.success && backups.value.length > 0) {
          // 获取当前机器码
          const { invoke } = await import('@tauri-apps/api/core');
          const machineResult = await invoke<{
            success: boolean;
            guid: string;
            source: string;
            error?: string;
          }>('read_machine_id');

          if (machineResult.success) {
            const existingBackup = backups.value.find(
              b => b.guid.toLowerCase() === machineResult.guid.toLowerCase()
            );

            if (existingBackup) {
              return {
                success: true,
                data: existingBackup,
                message: '该机器码已存在备份，已跳过'
              };
            }
          }
        }
      }

      const result = await invoke<{
        success: boolean;
        backup?: {
          id: string;
          guid: string;
          source: string;
          timestamp: number;
          description?: string;
        };
        skipped: boolean;
        error?: string;
      }>('backup_machine_guid', { description });

      if (result.success) {
        if (result.backup) {
          // 添加到列表开头
          backups.value.unshift(result.backup);
          return { success: true, data: result.backup, message: '备份成功' };
        } else if (result.skipped) {
          // 后端返回跳过，说明已存在相同 GUID 的备份
          return { success: true, message: '该机器码已存在备份，已跳过' };
        }
      }

      error.value = result.error || '备份失败';
      return { success: false, error: error.value };
    } catch (e) {
      error.value = e instanceof Error ? e.message : '未知错误';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * 删除备份
   */
  async function deleteBackup(id: string): Promise<OperationResult<void>> {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await invoke<{
        success: boolean;
        error?: string;
      }>('delete_backup_by_id', { id });

      if (result.success) {
        backups.value = backups.value.filter((b) => b.id !== id);
        if (selectedBackupId.value === id) {
          selectedBackupId.value = null;
        }
        return { success: true };
      } else {
        error.value = result.error || '删除备份失败';
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
   * 清空所有备份
   */
  async function clearAllBackups(): Promise<OperationResult<void>> {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await invoke<{
        success: boolean;
        error?: string;
      }>('clear_all_backups');

      if (result.success) {
        backups.value = [];
        selectedBackupId.value = null;
        return { success: true };
      } else {
        error.value = result.error || '清空备份失败';
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
   * 恢复备份
   */
  async function restoreBackup(id: string): Promise<OperationResult<RestoreResult>> {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await invoke<{
        success: boolean;
        previousGuid: string;
        restoredGuid: string;
        preBackup?: {
          id: string;
          guid: string;
          source: string;
          timestamp: number;
          description?: string;
        };
        restoredFrom: {
          id: string;
          guid: string;
          source: string;
          timestamp: number;
          description?: string;
        };
        message?: string;
        error?: string;
      }>('restore_backup_by_id_command', { id });

      if (result.success) {
        const restoreResult: RestoreResult = {
          previousGuid: result.previousGuid,
          restoredGuid: result.restoredGuid,
          preBackup: result.preBackup,
          restoredFrom: result.restoredFrom,
        };

        // 刷新备份列表
        await loadBackups();

        return { success: true, data: restoreResult, message: result.message };
      } else {
        error.value = result.error || '恢复备份失败';
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
   * 选择备份
   */
  function selectBackup(id: string | null): void {
    selectedBackupId.value = id;
  }

  /**
   * 复制备份的 GUID
   */
  async function copyBackupGuid(guid: string): Promise<boolean> {
    try {
      const { writeText } = await import('@tauri-apps/plugin-clipboard-manager');
      await writeText(guid);
      return true;
    } catch {
      try {
        await navigator.clipboard.writeText(guid);
        return true;
      } catch {
        return false;
      }
    }
  }

  /**
   * 更新备份描述
   */
  async function updateBackupDescription(
    id: string,
    description?: string
  ): Promise<OperationResult<BackupItem>> {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await invoke<{
        success: boolean;
        backup?: {
          id: string;
          guid: string;
          source: string;
          timestamp: number;
          description?: string;
        };
        error?: string;
      }>('update_backup_description_command', { id, description });

      if (result.success && result.backup) {
        // 更新本地列表中的备份
        const index = backups.value.findIndex((b) => b.id === id);
        if (index !== -1) {
          backups.value[index] = result.backup;
        }
        return { success: true, data: result.backup };
      } else {
        error.value = result.error || '更新备份描述失败';
        return { success: false, error: error.value };
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '未知错误';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  }

  return {
    // State
    backups,
    isLoading,
    error,
    selectedBackupId,
    // Getters
    backupCount,
    hasBackups,
    selectedBackup,
    formattedBackups,
    // Actions
    loadBackups,
    createBackup,
    deleteBackup,
    clearAllBackups,
    restoreBackup,
    selectBackup,
    copyBackupGuid,
    updateBackupDescription,
  };
});
