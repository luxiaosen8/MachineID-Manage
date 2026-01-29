/**
 * Backup 领域服务
 * 处理备份相关的领域逻辑
 */

import { Result, AsyncResult } from '@domains/shared/types/result.type';
import { Backup } from '../entities/backup.entity';
import { BackupId } from '../value-objects/backup-id.vo';
import { MachineId } from '../../machine-id/entities/machine-id.entity';
import { IBackupRepository } from '../repositories/backup.repository';
import { NotFoundError, PermissionError, DuplicateError } from '@domains/shared/errors/domain.error';

export interface BackupServiceConfig {
  maxBackups: number;
  skipDuplicate: boolean;
}

export class BackupService {
  constructor(
    private readonly repository: IBackupRepository,
    private readonly config: BackupServiceConfig = { maxBackups: 1000, skipDuplicate: true }
  ) {}

  /**
   * 获取所有备份
   */
  async getAllBackups(): AsyncResult<Backup[], DomainError> {
    const result = await this.repository.findAll();
    return result.map((data) => data.backups);
  }

  /**
   * 获取备份数量
   */
  async getBackupCount(): AsyncResult<number, DomainError> {
    const result = await this.repository.findAll();
    return result.map((data) => data.count);
  }

  /**
   * 根据ID查找备份
   */
  async getBackupById(id: string): AsyncResult<Backup | null, DomainError> {
    const backupId = BackupId.fromString(id);
    return await this.repository.findById(backupId);
  }

  /**
   * 创建备份
   */
  async createBackup(
    machineId: MachineId,
    description?: string
  ): AsyncResult<{ backup: Backup; skipped: boolean }, DomainError> {
    // 检查是否已存在相同的备份
    if (this.config.skipDuplicate) {
      const existsResult = await this.repository.exists(machineId);
      if (existsResult.isSuccess() && existsResult.getValue()) {
        return Result.success({
          backup: machineId as unknown as Backup, // 类型转换，实际使用时需要调整
          skipped: true,
        });
      }
    }

    const result = await this.repository.create(machineId, description);
    return result.map((data) => ({
      backup: data.backup,
      skipped: data.skipped,
    }));
  }

  /**
   * 删除备份
   */
  async deleteBackup(id: string): AsyncResult<void, DomainError> {
    const backupId = BackupId.fromString(id);

    // 验证备份是否存在
    const findResult = await this.repository.findById(backupId);
    if (findResult.isFailure()) {
      return Result.failure(findResult.getError());
    }
    if (findResult.getValue() === null) {
      return Result.failure(new NotFoundError('Backup', id));
    }

    return await this.repository.delete(backupId);
  }

  /**
   * 清空所有备份
   */
  async clearAllBackups(): AsyncResult<void, DomainError> {
    return await this.repository.clearAll();
  }

  /**
   * 恢复备份
   */
  async restoreBackup(
    id: string
  ): AsyncResult<{ restoredFrom: Backup; currentMachineId: MachineId }, DomainError> {
    const backupId = BackupId.fromString(id);

    // 验证备份是否存在
    const findResult = await this.repository.findById(backupId);
    if (findResult.isFailure()) {
      return Result.failure(findResult.getError());
    }
    const backup = findResult.getValue();
    if (backup === null) {
      return Result.failure(new NotFoundError('Backup', id));
    }

    // 执行恢复
    const restoreResult = await this.repository.restore(backupId);
    if (restoreResult.isFailure()) {
      return Result.failure(restoreResult.getError());
    }

    const data = restoreResult.getValue();
    return Result.success({
      restoredFrom: backup,
      currentMachineId: data.restoredMachineId,
    });
  }

  /**
   * 检查备份是否存在
   */
  async backupExists(machineId: MachineId): AsyncResult<boolean, DomainError> {
    return await this.repository.exists(machineId);
  }
}

// 导入 DomainError 类型
import { DomainError } from '@domains/shared/errors/domain.error';
