/**
 * useMachineId 组合式函数
 * 提供机器码相关的响应式状态和操作
 */

import { ref, computed, readonly } from 'vue';
import { machineIdApplicationService } from '@application/services/machine-id-application.service';
import { MachineIdInfoDto } from '@application/dto/machine-id.dto';

export interface UseMachineIdOptions {
  autoLoad?: boolean;
}

export interface UseMachineIdReturn {
  // 状态
  machineId: Readonly<import('vue').Ref<MachineIdInfoDto | null>>;
  isLoading: Readonly<import('vue').Ref<boolean>>;
  error: Readonly<import('vue').Ref<string | null>>;
  hasPermission: Readonly<import('vue').Ref<boolean>>;

  // 计算属性
  currentGuid: import('vue').ComputedRef<string>;
  source: import('vue').ComputedRef<string>;
  isReady: import('vue').ComputedRef<boolean>;
  canModify: import('vue').ComputedRef<boolean>;

  // 方法
  initialize: () => Promise<void>;
  refresh: () => Promise<void>;
  checkPermission: () => Promise<void>;
  replaceMachineId: (guid: string, description?: string) => Promise<boolean>;
  generateRandomMachineId: (description?: string) => Promise<boolean>;
  validateGuid: (guid: string) => boolean;
}

export function useMachineId(options: UseMachineIdOptions = {}): UseMachineIdReturn {
  // 状态
  const machineId = ref<MachineIdInfoDto | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const hasPermission = ref(false);

  // 计算属性
  const currentGuid = computed(() => machineId.value?.guid ?? '');
  const source = computed(() => machineId.value?.source ?? '');
  const isReady = computed(() => machineId.value !== null);
  const canModify = computed(() => hasPermission.value);

  /**
   * 初始化
   */
  async function initialize(): Promise<void> {
    await Promise.all([checkPermission(), refresh()]);
  }

  /**
   * 刷新机器码
   */
  async function refresh(): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await machineIdApplicationService.getCurrentMachineId();

      if (result.success && result.data) {
        machineId.value = result.data;
      } else {
        error.value = result.error || '读取机器码失败';
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '未知错误';
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * 检查权限
   */
  async function checkPermission(): Promise<void> {
    try {
      const result = await machineIdApplicationService.checkPermission();
      hasPermission.value = result.success && result.hasPermission;
    } catch {
      hasPermission.value = false;
    }
  }

  /**
   * 替换机器码
   */
  async function replaceMachineId(guid: string, description?: string): Promise<boolean> {
    if (!hasPermission.value) {
      error.value = '没有管理员权限';
      return false;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const result = await machineIdApplicationService.replaceMachineId({
        guid,
        description,
      });

      if (result.success) {
        await refresh();
        return true;
      } else {
        error.value = result.error || '替换失败';
        return false;
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '未知错误';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * 生成随机机器码
   */
  async function generateRandomMachineId(description?: string): Promise<boolean> {
    if (!hasPermission.value) {
      error.value = '没有管理员权限';
      return false;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const result = await machineIdApplicationService.generateRandomMachineId({
        description,
      });

      if (result.success) {
        await refresh();
        return true;
      } else {
        error.value = result.error || '生成失败';
        return false;
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '未知错误';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * 验证 GUID 格式
   */
  function validateGuid(guid: string): boolean {
    return machineIdApplicationService.validateGuid(guid);
  }

  // 自动加载
  if (options.autoLoad) {
    initialize();
  }

  return {
    machineId: readonly(machineId),
    isLoading: readonly(isLoading),
    error: readonly(error),
    hasPermission: readonly(hasPermission),
    currentGuid,
    source,
    isReady,
    canModify,
    initialize,
    refresh,
    checkPermission,
    replaceMachineId,
    generateRandomMachineId,
    validateGuid,
  };
}
