/**
 * useBackup 组合式函数
 * 提供备份相关的响应式状态和操作
 */

import { ref, computed, readonly } from 'vue';
import { backupApplicationService } from '@application/services/backup-application.service';
import { BackupItemDto } from '@application/dto/backup.dto';
import { MachineId } from '@domains/machine-id/entities/machine-id.entity';
import { Guid } from '@domains/machine-id/value-objects/guid.vo';

export interface UseBackupOptions {
  autoLoad?: boolean;
}

export interface UseBackupReturn {
  // 状态
  backups: Readonly<import('vue').Ref<readonly BackupItemDto[]>>;
  isLoading: Readonly<import('vue').Ref<boolean>>;
  error: Readonly<import('vue').Ref<string | null>>;
  selectedBackupId: Readonly<import('vue').Ref<string | null>>;

  // 计算属性
  backupCount: import('vue').ComputedRef<number>;
  hasBackups: import('vue').ComputedRef<boolean>;
  selectedBackup: import('vue').ComputedRef<BackupItemDto | undefined>;

  // 方法
  loadBackups: () => Promise<void>;
  createBackup: (machineId: MachineId, description?: string) => Promise<boolean>;
  deleteBackup: (id: string) => Promise<boolean>;
  clearAllBackups: () => Promise<boolean>;
  restoreBackup: (id: string) => Promise<boolean>;
  selectBackup: (id: string | null) => void;
  backupExists: (machineId: MachineId) => Promise<boolean>;
}

export function useBackup(options: UseBackupOptions = {}): UseBackupReturn {
  // 状态
  const backups = ref<BackupItemDto[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const selectedBackupId = ref<string | null>(null);

  // 计算属性
  const backupCount = computed(() => backups.value.length);
  const hasBackups = computed(() => backups.value.length > 0);
  const selectedBackup = computed(() =>
    backups.value.find((b) => b.id === selectedBackupId.value)
  );

  /**
   * 加载备份列表
   */
  async function loadBackups(): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await backupApplicationService.getAllBackups();

      if (result.success) {
        backups.value = result.backups;
      } else {
        error.value = result.error || '加载备份失败';
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '未知错误';
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * 创建备份
   */
  async function createBackup(machineId: MachineId, description?: string): Promise<boolean> {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await backupApplicationService.createBackup(machineId, {
        description,
      });

      if (result.success) {
        if (!result.skipped && result.backup) {
          backups.value.unshift(result.backup);
        }
        return true;
      } else {
        error.value = result.error || '备份失败';
        return false;
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '未知错误';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * 删除备份
   */
  async function deleteBackup(id: string): Promise<boolean> {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await backupApplicationService.deleteBackup(id);

      if (result.success) {
        backups.value = backups.value.filter((b) => b.id !== id);
        if (selectedBackupId.value === id) {
          selectedBackupId.value = null;
        }
        return true;
      } else {
        error.value = result.error || '删除失败';
        return false;
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '未知错误';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * 清空所有备份
   */
  async function clearAllBackups(): Promise<boolean> {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await backupApplicationService.clearAllBackups();

      if (result.success) {
        backups.value = [];
        selectedBackupId.value = null;
        return true;
      } else {
        error.value = result.error || '清空失败';
        return false;
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '未知错误';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * 恢复备份
   */
  async function restoreBackup(id: string): Promise<boolean> {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await backupApplicationService.restoreBackup(id);

      if (result.success) {
        await loadBackups();
        return true;
      } else {
        error.value = result.error || '恢复失败';
        return false;
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '未知错误';
      return false;
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
   * 检查备份是否存在
   */
  async function backupExists(machineId: MachineId): Promise<boolean> {
    return await backupApplicationService.backupExists(machineId);
  }

  // 自动加载
  if (options.autoLoad) {
    loadBackups();
  }

  return {
    backups: readonly(backups),
    isLoading: readonly(isLoading),
    error: readonly(error),
    selectedBackupId: readonly(selectedBackupId),
    backupCount,
    hasBackups,
    selectedBackup,
    loadBackups,
    createBackup,
    deleteBackup,
    clearAllBackups,
    restoreBackup,
    selectBackup,
    backupExists,
  };
}
