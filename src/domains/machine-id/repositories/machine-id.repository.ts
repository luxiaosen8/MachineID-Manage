/**
 * MachineId 仓库接口
 * 定义机器码数据的持久化操作
 */

import { Result, AsyncResult } from '@domains/shared/types/result.type';
import { MachineId } from '../entities/machine-id.entity';
import { Guid } from '../value-objects/guid.vo';
import { DomainError } from '@domains/shared/errors/domain.error';

export interface ReadMachineIdResult {
  machineId: MachineId;
}

export interface WriteMachineIdResult {
  previousMachineId: MachineId;
  newMachineId: MachineId;
}

export interface PermissionCheckResult {
  hasPermission: boolean;
}

export interface IMachineIdRepository {
  /**
   * 读取当前机器码
   */
  read(): AsyncResult<ReadMachineIdResult, DomainError>;

  /**
   * 写入新的机器码
   */
  write(guid: Guid, description?: string): AsyncResult<WriteMachineIdResult, DomainError>;

  /**
   * 生成并写入随机机器码
   */
  generateRandom(description?: string): AsyncResult<WriteMachineIdResult, DomainError>;

  /**
   * 检查是否具有管理员权限
   */
  checkPermission(): AsyncResult<PermissionCheckResult, DomainError>;
}
