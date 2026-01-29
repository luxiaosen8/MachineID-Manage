/**
 * MachineId 仓库实现
 * 使用 Tauri API 实现机器码数据的持久化
 */

import { Result, AsyncResult } from '@domains/shared/types/result.type';
import { OperationError } from '@domains/shared/errors/domain.error';
import { IMachineIdRepository, ReadMachineIdResult, WriteMachineIdResult, PermissionCheckResult } from '@domains/machine-id/repositories/machine-id.repository';
import { MachineId } from '@domains/machine-id/entities/machine-id.entity';
import { Guid } from '@domains/machine-id/value-objects/guid.vo';
import {
  invokeTauriRaw,
  ReadMachineIdCommandResult,
  WriteMachineIdCommandResult,
  CheckPermissionCommandResult,
  TAURI_COMMANDS,
} from '../api/tauri.api';

export class MachineIdRepositoryImpl implements IMachineIdRepository {
  /**
   * 读取当前机器码
   */
  async read(): AsyncResult<ReadMachineIdResult, OperationError> {
    try {
      const result = await invokeTauriRaw<ReadMachineIdCommandResult>(
        TAURI_COMMANDS.READ_MACHINE_ID
      );

      if (!result.success) {
        return Result.failure(new OperationError(result.error || '读取机器码失败'));
      }

      const guidResult = Guid.create(result.guid);
      if (guidResult.isFailure()) {
        return Result.failure(new OperationError('获取的 GUID 格式无效'));
      }

      const machineId = new MachineId({
        guid: guidResult.getValue(),
        source: result.source,
      });

      return Result.success({ machineId });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return Result.failure(new OperationError(`读取机器码失败: ${message}`));
    }
  }

  /**
   * 写入新的机器码
   */
  async write(
    guid: Guid,
    description?: string
  ): AsyncResult<WriteMachineIdResult, OperationError> {
    try {
      const result = await invokeTauriRaw<WriteMachineIdCommandResult>(
        TAURI_COMMANDS.WRITE_MACHINE_GUID,
        { newGuid: guid.value, description }
      );

      if (!result.success) {
        return Result.failure(new OperationError(result.error || '写入机器码失败'));
      }

      const previousGuidResult = Guid.create(result.previousGuid);
      const newGuidResult = Guid.create(result.newGuid);

      if (previousGuidResult.isFailure() || newGuidResult.isFailure()) {
        return Result.failure(new OperationError('返回的 GUID 格式无效'));
      }

      const previousMachineId = new MachineId({
        guid: previousGuidResult.getValue(),
        source: 'registry',
      });

      const newMachineId = new MachineId({
        guid: newGuidResult.getValue(),
        source: 'registry',
      });

      return Result.success({
        previousMachineId,
        newMachineId,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return Result.failure(new OperationError(`写入机器码失败: ${message}`));
    }
  }

  /**
   * 生成并写入随机机器码
   */
  async generateRandom(
    description?: string
  ): AsyncResult<WriteMachineIdResult, OperationError> {
    try {
      const result = await invokeTauriRaw<WriteMachineIdCommandResult>(
        TAURI_COMMANDS.GENERATE_RANDOM_GUID,
        { description }
      );

      if (!result.success) {
        return Result.failure(new OperationError(result.error || '生成机器码失败'));
      }

      const previousGuidResult = Guid.create(result.previousGuid);
      const newGuidResult = Guid.create(result.newGuid);

      if (previousGuidResult.isFailure() || newGuidResult.isFailure()) {
        return Result.failure(new OperationError('返回的 GUID 格式无效'));
      }

      const previousMachineId = new MachineId({
        guid: previousGuidResult.getValue(),
        source: 'registry',
      });

      const newMachineId = new MachineId({
        guid: newGuidResult.getValue(),
        source: 'registry',
      });

      return Result.success({
        previousMachineId,
        newMachineId,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return Result.failure(new OperationError(`生成机器码失败: ${message}`));
    }
  }

  /**
   * 检查是否具有管理员权限
   */
  async checkPermission(): AsyncResult<PermissionCheckResult, OperationError> {
    try {
      const result = await invokeTauriRaw<CheckPermissionCommandResult>(
        TAURI_COMMANDS.CHECK_PERMISSION
      );

      if (!result.success) {
        return Result.failure(new OperationError(result.error || '权限检查失败'));
      }

      return Result.success({ hasPermission: result.hasPermission });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return Result.failure(new OperationError(`权限检查失败: ${message}`));
    }
  }
}

// 导出单例实例
export const machineIdRepository = new MachineIdRepositoryImpl();
