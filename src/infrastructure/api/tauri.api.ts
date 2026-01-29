/**
 * Tauri API 封装
 * 封装与 Tauri 后端的通信
 */

import { invoke } from '@tauri-apps/api/core';
import { Result, AsyncResult } from '@domains/shared/types/result.type';
import { OperationError } from '@domains/shared/errors/domain.error';

/**
 * Tauri 命令调用结果
 */
interface TauriResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * 调用 Tauri 命令
 */
export async function invokeTauri<T>(
  command: string,
  args?: Record<string, unknown>
): AsyncResult<T, OperationError> {
  try {
    const result = await invoke<TauriResult<T>>(command, args);

    if (result.success) {
      return Result.success(result.data as T);
    } else {
      return Result.failure(new OperationError(result.error || '操作失败'));
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return Result.failure(new OperationError(message));
  }
}

/**
 * 调用 Tauri 命令（原始格式）
 */
export async function invokeTauriRaw<T>(
  command: string,
  args?: Record<string, unknown>
): Promise<T> {
  return await invoke<T>(command, args);
}

/**
 * 读取机器码命令结果
 */
export interface ReadMachineIdCommandResult {
  success: boolean;
  guid: string;
  source: string;
  error?: string;
}

/**
 * 写入机器码命令结果
 */
export interface WriteMachineIdCommandResult {
  success: boolean;
  previousGuid: string;
  newGuid: string;
  preBackup?: {
    id: string;
    guid: string;
    source: string;
    timestamp: number;
    description?: string;
  };
  postBackup?: {
    id: string;
    guid: string;
    source: string;
    timestamp: number;
    description?: string;
  };
  message?: string;
  error?: string;
}

/**
 * 权限检查命令结果
 */
export interface CheckPermissionCommandResult {
  success: boolean;
  hasPermission: boolean;
  error?: string;
}

/**
 * 备份列表命令结果
 */
export interface ListBackupsCommandResult {
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
}

/**
 * 创建备份命令结果
 */
export interface CreateBackupCommandResult {
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
}

/**
 * 删除备份命令结果
 */
export interface DeleteBackupCommandResult {
  success: boolean;
  error?: string;
}

/**
 * 恢复备份命令结果
 */
export interface RestoreBackupCommandResult {
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
}

/**
 * Tauri 命令名称常量
 */
export const TAURI_COMMANDS = {
  READ_MACHINE_ID: 'read_machine_id',
  WRITE_MACHINE_GUID: 'write_machine_guid_command',
  GENERATE_RANDOM_GUID: 'generate_random_guid_command',
  CHECK_PERMISSION: 'check_permission_command',
  LIST_BACKUPS: 'list_backups',
  CREATE_BACKUP: 'backup_machine_guid',
  DELETE_BACKUP: 'delete_backup_by_id',
  CLEAR_BACKUPS: 'clear_all_backups',
  RESTORE_BACKUP: 'restore_backup_by_id_command',
} as const;
