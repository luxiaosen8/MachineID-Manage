/**
 * MachineID-Manage 类型定义
 */

// 机器码信息
export interface MachineIdInfo {
  guid: string;
  source: string;
}

// 备份项
export interface BackupItem {
  id: string;
  guid: string;
  source: string;
  timestamp: number;
  description?: string;
  formattedDate?: string;
}

// 操作结果
export interface OperationResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 写入结果
export interface WriteResult {
  previousGuid: string;
  newGuid: string;
  preBackup?: BackupItem;
  postBackup?: BackupItem;
}

// 恢复结果
export interface RestoreResult {
  previousGuid: string;
  restoredGuid: string;
  preBackup?: BackupItem;
  restoredFrom: BackupItem;
}

// 权限检查结果
export interface PermissionCheckResult {
  hasPermission: boolean;
  error?: string;
}

// 应用状态
export type AppStatus = 'idle' | 'loading' | 'success' | 'error';

// 状态消息
export interface StatusMessage {
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: number;
}

// 对话框配置
export interface DialogConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

// 生成选项
export interface GenerateOptions {
  description?: string;
}

// 替换选项
export interface ReplaceOptions {
  guid: string;
  description?: string;
}
