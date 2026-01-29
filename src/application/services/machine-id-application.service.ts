/**
 * MachineId 应用服务
 * 协调领域服务和表示层之间的交互
 */

import { MachineIdService } from '@domains/machine-id/services/machine-id.service';
import { MachineId } from '@domains/machine-id/entities/machine-id.entity';
import { machineIdRepository } from '@infrastructure/repositories/machine-id.repository.impl';
import {
  MachineIdInfoDto,
  MachineIdOperationResultDto,
  MachineIdReplaceResultDto,
  PermissionCheckResultDto,
  GenerateOptionsDto,
  ReplaceOptionsDto,
} from '../dto/machine-id.dto';

export class MachineIdApplicationService {
  private readonly domainService: MachineIdService;

  constructor() {
    this.domainService = new MachineIdService(machineIdRepository);
  }

  /**
   * 获取当前机器码信息
   */
  async getCurrentMachineId(): Promise<MachineIdOperationResultDto> {
    const result = await this.domainService.getCurrentMachineId();

    if (result.isFailure()) {
      return {
        success: false,
        error: result.getError().message,
      };
    }

    const machineId = result.getValue();
    return {
      success: true,
      data: this.toMachineIdInfoDto(machineId),
    };
  }

  /**
   * 替换机器码
   */
  async replaceMachineId(options: ReplaceOptionsDto): Promise<MachineIdReplaceResultDto> {
    const result = await this.domainService.replaceMachineId(
      options.guid,
      options.description
    );

    if (result.isFailure()) {
      return {
        success: false,
        previousGuid: '',
        newGuid: '',
        error: result.getError().message,
      };
    }

    const data = result.getValue();
    return {
      success: true,
      previousGuid: data.previous.guidString,
      newGuid: data.current.guidString,
      message: '机器码已成功替换',
    };
  }

  /**
   * 生成随机机器码
   */
  async generateRandomMachineId(
    options?: GenerateOptionsDto
  ): Promise<MachineIdReplaceResultDto> {
    const result = await this.domainService.generateRandomMachineId(options?.description);

    if (result.isFailure()) {
      return {
        success: false,
        previousGuid: '',
        newGuid: '',
        error: result.getError().message,
      };
    }

    const data = result.getValue();
    return {
      success: true,
      previousGuid: data.previous.guidString,
      newGuid: data.current.guidString,
      message: '新的机器码已生成并替换',
    };
  }

  /**
   * 检查管理员权限
   */
  async checkPermission(): Promise<PermissionCheckResultDto> {
    const result = await this.domainService.checkAdminPermission();

    if (result.isFailure()) {
      return {
        success: false,
        hasPermission: false,
        error: result.getError().message,
      };
    }

    return {
      success: true,
      hasPermission: result.getValue(),
    };
  }

  /**
   * 验证 GUID 格式
   */
  validateGuid(guid: string): boolean {
    const result = this.domainService.validateGuid(guid);
    return result.isSuccess();
  }

  /**
   * 将领域实体转换为 DTO
   */
  private toMachineIdInfoDto(machineId: MachineId): MachineIdInfoDto {
    return {
      guid: machineId.guidString,
      source: machineId.source,
      createdAt: machineId.createdAt.toISOString(),
    };
  }
}

// 导出单例实例
export const machineIdApplicationService = new MachineIdApplicationService();
