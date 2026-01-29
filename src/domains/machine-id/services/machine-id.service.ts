/**
 * MachineId 领域服务
 * 处理机器码相关的领域逻辑
 */

import { Result, AsyncResult } from '@domains/shared/types/result.type';
import { MachineId } from '../entities/machine-id.entity';
import { Guid } from '../value-objects/guid.vo';
import { IMachineIdRepository } from '../repositories/machine-id.repository';
import { ValidationError, PermissionError, OperationError } from '@domains/shared/errors/domain.error';

export interface MachineIdServiceConfig {
  requirePermission: boolean;
}

export class MachineIdService {
  constructor(
    private readonly repository: IMachineIdRepository,
    private readonly config: MachineIdServiceConfig = { requirePermission: true }
  ) {}

  /**
   * 获取当前机器码
   */
  async getCurrentMachineId(): AsyncResult<MachineId, DomainError> {
    const result = await this.repository.read();
    return result.map((data) => data.machineId);
  }

  /**
   * 验证 GUID 格式
   */
  validateGuid(guidString: string): Result<Guid, ValidationError> {
    return Guid.create(guidString);
  }

  /**
   * 替换机器码
   */
  async replaceMachineId(
    newGuidString: string,
    description?: string
  ): AsyncResult<{ previous: MachineId; current: MachineId }, DomainError> {
    // 验证 GUID 格式
    const guidResult = this.validateGuid(newGuidString);
    if (guidResult.isFailure()) {
      return Result.failure(guidResult.getError());
    }

    // 检查权限
    if (this.config.requirePermission) {
      const permissionResult = await this.repository.checkPermission();
      if (permissionResult.isFailure()) {
        return Result.failure(permissionResult.getError());
      }
      if (!permissionResult.getValue().hasPermission) {
        return Result.failure(new PermissionError('需要管理员权限才能修改机器码'));
      }
    }

    // 执行写入
    const writeResult = await this.repository.write(guidResult.getValue(), description);
    if (writeResult.isFailure()) {
      return Result.failure(writeResult.getError());
    }

    const data = writeResult.getValue();
    return Result.success({
      previous: data.previousMachineId,
      current: data.newMachineId,
    });
  }

  /**
   * 生成随机机器码
   */
  async generateRandomMachineId(
    description?: string
  ): AsyncResult<{ previous: MachineId; current: MachineId }, DomainError> {
    // 检查权限
    if (this.config.requirePermission) {
      const permissionResult = await this.repository.checkPermission();
      if (permissionResult.isFailure()) {
        return Result.failure(permissionResult.getError());
      }
      if (!permissionResult.getValue().hasPermission) {
        return Result.failure(new PermissionError('需要管理员权限才能生成机器码'));
      }
    }

    // 执行生成
    const generateResult = await this.repository.generateRandom(description);
    if (generateResult.isFailure()) {
      return Result.failure(generateResult.getError());
    }

    const data = generateResult.getValue();
    return Result.success({
      previous: data.previousMachineId,
      current: data.newMachineId,
    });
  }

  /**
   * 检查是否具有管理员权限
   */
  async checkAdminPermission(): AsyncResult<boolean, DomainError> {
    const result = await this.repository.checkPermission();
    return result.map((data) => data.hasPermission);
  }
}

// 导入 DomainError 类型
import { DomainError } from '@domains/shared/errors/domain.error';
