/**
 * Backup 仓库实现
 * 使用 Tauri API 实现备份数据的持久化
 */

import { Result, AsyncResult } from '@domains/shared/types/result.type';
import { OperationError, NotFoundError } from '@domains/shared/errors/domain.error';
import { IBackupRepository, BackupListResult, CreateBackupResult, RestoreBackupResult } from '@domains/backup/repositories/backup.repository';
import { Backup } from '@domains/backup/entities/backup.entity';
import { BackupId } from '@domains/backup/value-objects/backup-id.vo';
import { MachineId } from '@domains/machine-id/entities/machine-id.entity';
import { Guid } from '@domains/machine-id/value-objects/guid.vo';
import {
  invokeTauriRaw,
  ListBackupsCommandResult,
  CreateBackupCommandResult,
  DeleteBackupCommandResult,
  RestoreBackupCommandResult,
  TAURI_COMMANDS,
} from '../api/tauri.api';

export class BackupRepositoryImpl implements IBackupRepository {
  /**
   * 获取所有备份列表
   */
  async findAll(): AsyncResult<BackupListResult, OperationError> {
    try {
      const result = await invokeTauriRaw<ListBackupsCommandResult>(
        TAURI_COMMANDS.LIST_BACKUPS
      );

      if (!result.success) {
        return Result.failure(new OperationError(result.error || '加载备份失败'));
      }

      const backups: Backup[] = [];
      for (const data of result.backups) {
        const guidResult = Guid.create(data.guid);
        if (guidResult.isFailure()) {
          continue; // 跳过无效的备份
        }

        const machineId = new MachineId({
          guid: guidResult.getValue(),
          source: data.source,
        });

        const backup = new Backup({
          id: BackupId.fromString(data.id),
          machineId,
          timestamp: new Date(data.timestamp * 1000),
          description: data.description,
        });

        backups.push(backup);
      }

      return Result.success({ backups, count: backups.length });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return Result.failure(new OperationError(`加载备份失败: ${message}`));
    }
  }

  /**
   * 根据ID查找备份
   */
  async findById(id: BackupId): AsyncResult<Backup | null, OperationError> {
    const result = await this.findAll();
    if (result.isFailure()) {
      return Result.failure(result.getError());
    }

    const backup = result.getValue().backups.find((b) => b.backupId.equals(id));
    return Result.success(backup || null);
  }

  /**
   * 创建备份
   */
  async create(
    machineId: MachineId,
    description?: string
  ): AsyncResult<CreateBackupResult, OperationError> {
    try {
      const result = await invokeTauriRaw<CreateBackupCommandResult>(
        TAURI_COMMANDS.CREATE_BACKUP,
        { description }
      );

      if (!result.success) {
        return Result.failure(new OperationError(result.error || '备份失败'));
      }

      if (result.skipped) {
        return Result.success({
          backup: new Backup({
            id: BackupId.create(),
            machineId,
            description,
          }),
          skipped: true,
        });
      }

      if (!result.backup) {
        return Result.failure(new OperationError('备份创建失败：未返回备份数据'));
      }

      const guidResult = Guid.create(result.backup.guid);
      if (guidResult.isFailure()) {
        return Result.failure(new OperationError('返回的 GUID 格式无效'));
      }

      const backupMachineId = new MachineId({
        guid: guidResult.getValue(),
        source: result.backup.source,
      });

      const backup = new Backup({
        id: BackupId.fromString(result.backup.id),
        machineId: backupMachineId,
        timestamp: new Date(result.backup.timestamp * 1000),
        description: result.backup.description,
      });

      return Result.success({ backup, skipped: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return Result.failure(new OperationError(`备份失败: ${message}`));
    }
  }

  /**
   * 删除备份
   */
  async delete(id: BackupId): AsyncResult<void, OperationError> {
    try {
      const result = await invokeTauriRaw<DeleteBackupCommandResult>(
        TAURI_COMMANDS.DELETE_BACKUP,
        { id: id.value }
      );

      if (!result.success) {
        return Result.failure(new OperationError(result.error || '删除备份失败'));
      }

      return Result.success(undefined);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return Result.failure(new OperationError(`删除备份失败: ${message}`));
    }
  }

  /**
   * 清空所有备份
   */
  async clearAll(): AsyncResult<void, OperationError> {
    try {
      const result = await invokeTauriRaw<DeleteBackupCommandResult>(
        TAURI_COMMANDS.CLEAR_BACKUPS
      );

      if (!result.success) {
        return Result.failure(new OperationError(result.error || '清空备份失败'));
      }

      return Result.success(undefined);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return Result.failure(new OperationError(`清空备份失败: ${message}`));
    }
  }

  /**
   * 恢复备份
   */
  async restore(id: BackupId): AsyncResult<RestoreBackupResult, OperationError> {
    try {
      const result = await invokeTauriRaw<RestoreBackupCommandResult>(
        TAURI_COMMANDS.RESTORE_BACKUP,
        { id: id.value }
      );

      if (!result.success) {
        return Result.failure(new OperationError(result.error || '恢复备份失败'));
      }

      const previousGuidResult = Guid.create(result.previousGuid);
      const restoredGuidResult = Guid.create(result.restoredGuid);

      if (previousGuidResult.isFailure() || restoredGuidResult.isFailure()) {
        return Result.failure(new OperationError('返回的 GUID 格式无效'));
      }

      const previousMachineId = new MachineId({
        guid: previousGuidResult.getValue(),
        source: 'registry',
      });

      const restoredMachineId = new MachineId({
        guid: restoredGuidResult.getValue(),
        source: 'registry',
      });

      let preBackup: Backup | undefined;
      if (result.preBackup) {
        const preGuidResult = Guid.create(result.preBackup.guid);
        if (preGuidResult.isSuccess()) {
          preBackup = new Backup({
            id: BackupId.fromString(result.preBackup.id),
            machineId: new MachineId({
              guid: preGuidResult.getValue(),
              source: result.preBackup.source,
            }),
            timestamp: new Date(result.preBackup.timestamp * 1000),
            description: result.preBackup.description,
          });
        }
      }

      return Result.success({
        previousMachineId,
        restoredMachineId,
        preBackup,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return Result.failure(new OperationError(`恢复备份失败: ${message}`));
    }
  }

  /**
   * 检查是否存在相同的机器码备份
   */
  async exists(machineId: MachineId): AsyncResult<boolean, OperationError> {
    const result = await this.findAll();
    if (result.isFailure()) {
      return Result.failure(result.getError());
    }

    const exists = result.getValue().backups.some((backup) =>
      backup.hasSameMachineId(machineId)
    );

    return Result.success(exists);
  }
}

// 导出单例实例
export const backupRepository = new BackupRepositoryImpl();
