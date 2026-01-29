/**
 * Backup 仓库接口
 * 定义备份数据的持久化操作
 */

import { Result, AsyncResult } from '@domains/shared/types/result.type';
import { Backup } from '../entities/backup.entity';
import { BackupId } from '../value-objects/backup-id.vo';
import { MachineId } from '../../machine-id/entities/machine-id.entity';
import { DomainError } from '@domains/shared/errors/domain.error';

export interface BackupListResult {
  backups: Backup[];
  count: number;
}

export interface CreateBackupResult {
  backup: Backup;
  skipped: boolean;
}

export interface RestoreBackupResult {
  previousMachineId: MachineId;
  restoredMachineId: MachineId;
  preBackup?: Backup;
}

export interface IBackupRepository {
  /**
   * 获取所有备份列表
   */
  findAll(): AsyncResult<BackupListResult, DomainError>;

  /**
   * 根据ID查找备份
   */
  findById(id: BackupId): AsyncResult<Backup | null, DomainError>;

  /**
   * 创建备份
   */
  create(machineId: MachineId, description?: string): AsyncResult<CreateBackupResult, DomainError>;

  /**
   * 删除备份
   */
  delete(id: BackupId): AsyncResult<void, DomainError>;

  /**
   * 清空所有备份
   */
  clearAll(): AsyncResult<void, DomainError>;

  /**
   * 恢复备份
   */
  restore(id: BackupId): AsyncResult<RestoreBackupResult, DomainError>;

  /**
   * 检查是否存在相同的机器码备份
   */
  exists(machineId: MachineId): AsyncResult<boolean, DomainError>;
}
