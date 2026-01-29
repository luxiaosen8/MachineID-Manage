/**
 * Backup 应用服务
 * 协调领域服务和表示层之间的交互
 */

import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { BackupService } from '@domains/backup/services/backup.service';
import { Backup } from '@domains/backup/entities/backup.entity';
import { MachineId } from '@domains/machine-id/entities/machine-id.entity';
import { backupRepository } from '@infrastructure/repositories/backup.repository.impl';
import {
  BackupListResultDto,
  BackupItemDto,
  BackupCreateResultDto,
  BackupDeleteResultDto,
  BackupRestoreResultDto,
  CreateBackupOptionsDto,
} from '../dto/backup.dto';

export class BackupApplicationService {
  private readonly domainService: BackupService;

  constructor() {
    this.domainService = new BackupService(backupRepository);
  }

  /**
   * 获取所有备份
   */
  async getAllBackups(): Promise<BackupListResultDto> {
    const result = await this.domainService.getAllBackups();

    if (result.isFailure()) {
      return {
        success: false,
        backups: [],
        count: 0,
        error: result.getError().message,
      };
    }

    const backups = result.getValue();
    return {
      success: true,
      backups: backups.map((backup) => this.toBackupItemDto(backup)),
      count: backups.length,
    };
  }

  /**
   * 创建备份
   */
  async createBackup(
    machineId: MachineId,
    options?: CreateBackupOptionsDto
  ): Promise<BackupCreateResultDto> {
    const result = await this.domainService.createBackup(
      machineId,
      options?.description
    );

    if (result.isFailure()) {
      return {
        success: false,
        skipped: false,
        error: result.getError().message,
      };
    }

    const data = result.getValue();
    return {
      success: true,
      backup: data.skipped ? undefined : this.toBackupItemDto(data.backup),
      skipped: data.skipped,
      message: data.skipped ? '该机器码已存在备份，已跳过' : '机器码已备份',
    };
  }

  /**
   * 删除备份
   */
  async deleteBackup(id: string): Promise<BackupDeleteResultDto> {
    const result = await this.domainService.deleteBackup(id);

    if (result.isFailure()) {
      return {
        success: false,
        error: result.getError().message,
      };
    }

    return {
      success: true,
      message: '备份已删除',
    };
  }

  /**
   * 清空所有备份
   */
  async clearAllBackups(): Promise<BackupDeleteResultDto> {
    const result = await this.domainService.clearAllBackups();

    if (result.isFailure()) {
      return {
        success: false,
        error: result.getError().message,
      };
    }

    return {
      success: true,
      message: '所有备份已删除',
    };
  }

  /**
   * 恢复备份
   */
  async restoreBackup(id: string): Promise<BackupRestoreResultDto> {
    const result = await this.domainService.restoreBackup(id);

    if (result.isFailure()) {
      return {
        success: false,
        previousGuid: '',
        restoredGuid: '',
        error: result.getError().message,
      };
    }

    const data = result.getValue();
    return {
      success: true,
      previousGuid: data.restoredFrom.machineId.guidString,
      restoredGuid: data.currentMachineId.guidString,
      message: '机器码已恢复',
    };
  }

  /**
   * 检查备份是否存在
   */
  async backupExists(machineId: MachineId): Promise<boolean> {
    const result = await this.domainService.backupExists(machineId);
    return result.isSuccess() && result.getValue();
  }

  /**
   * 将领域实体转换为 DTO
   */
  private toBackupItemDto(backup: Backup): BackupItemDto {
    return {
      id: backup.id,
      guid: backup.machineId.guidString,
      source: backup.machineId.source,
      timestamp: backup.unixTimestamp,
      description: backup.description,
      formattedDate: format(backup.timestamp, 'yyyy-MM-dd HH:mm:ss', {
        locale: zhCN,
      }),
    };
  }
}

// 导出单例实例
export const backupApplicationService = new BackupApplicationService();
