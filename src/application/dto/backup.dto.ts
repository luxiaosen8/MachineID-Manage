/**
 * Backup 数据传输对象
 * 用于应用层与表示层之间的数据传输
 */

/**
 * 备份项 DTO
 */
export interface BackupItemDto {
  id: string;
  guid: string;
  source: string;
  timestamp: number;
  description?: string;
  formattedDate?: string;
}

/**
 * 备份列表结果 DTO
 */
export interface BackupListResultDto {
  success: boolean;
  backups: BackupItemDto[];
  count: number;
  error?: string;
}

/**
 * 备份创建结果 DTO
 */
export interface BackupCreateResultDto {
  success: boolean;
  backup?: BackupItemDto;
  skipped: boolean;
  error?: string;
  message?: string;
}

/**
 * 备份删除结果 DTO
 */
export interface BackupDeleteResultDto {
  success: boolean;
  error?: string;
  message?: string;
}

/**
 * 备份恢复结果 DTO
 */
export interface BackupRestoreResultDto {
  success: boolean;
  previousGuid: string;
  restoredGuid: string;
  error?: string;
  message?: string;
}

/**
 * 创建备份选项 DTO
 */
export interface CreateBackupOptionsDto {
  description?: string;
}
