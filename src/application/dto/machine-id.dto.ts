/**
 * MachineId 数据传输对象
 * 用于应用层与表示层之间的数据传输
 */

/**
 * 机器码信息 DTO
 */
export interface MachineIdInfoDto {
  guid: string;
  source: string;
  createdAt: string;
}

/**
 * 机器码操作结果 DTO
 */
export interface MachineIdOperationResultDto {
  success: boolean;
  data?: MachineIdInfoDto;
  error?: string;
  message?: string;
}

/**
 * 机器码替换结果 DTO
 */
export interface MachineIdReplaceResultDto {
  success: boolean;
  previousGuid: string;
  newGuid: string;
  error?: string;
  message?: string;
}

/**
 * 权限检查结果 DTO
 */
export interface PermissionCheckResultDto {
  success: boolean;
  hasPermission: boolean;
  error?: string;
}

/**
 * 生成选项 DTO
 */
export interface GenerateOptionsDto {
  description?: string;
}

/**
 * 替换选项 DTO
 */
export interface ReplaceOptionsDto {
  guid: string;
  description?: string;
}
