import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { invoke } from '@tauri-apps/api/core';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { useBackupStore } from './backup';
import type { MachineIdInfo, OperationResult, PermissionCheckResult } from '../types/index';

/**
 * MachineID 状态管理
 */
export const useMachineIdStore = defineStore('machineId', () => {
  // State
  const currentGuid = ref<string>('');
  const source = ref<string>('');
  const hasPermission = ref<boolean>(false);
  const permissionMethod = ref<string>('');
  const permissionError = ref<string | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const lastCheckTime = ref<number>(0);
  const appVersion = ref<string>('');

  // Getters
  const canModify = computed(() => hasPermission.value);
  const isPermissionStale = computed(() => {
    // 权限检查超过5分钟视为过期
    return Date.now() - lastCheckTime.value > 5 * 60 * 1000;
  });

  /**
   * 读取机器码
   */
  async function readMachineId(): Promise<OperationResult<MachineIdInfo>> {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await invoke<{
        success: boolean;
        guid: string;
        source: string;
        error?: string;
      }>('read_machine_id');

      if (result.success) {
        currentGuid.value = result.guid;
        source.value = result.source;
        return {
          success: true,
          data: { guid: result.guid, source: result.source },
        };
      } else {
        error.value = result.error || '读取机器码失败';
        return { success: false, error: error.value };
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '读取机器码失败';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * 检查权限
   * 支持强制刷新
   */
  async function checkPermission(force: boolean = false): Promise<OperationResult<PermissionCheckResult>> {
    // 如果权限检查未过期且不强制刷新，直接返回当前状态
    if (!force && !isPermissionStale.value && lastCheckTime.value > 0) {
      return {
        success: true,
        data: {
          hasPermission: hasPermission.value,
          checkSuccess: true,
          method: permissionMethod.value,
          errorType: permissionError.value ? 'cached' : null,
          errorMessage: permissionError.value,
          debugInfo: null,
        },
      };
    }

    isLoading.value = true;
    error.value = null;

    try {
      const result = await invoke<{
        success: boolean;
        has_permission: boolean;
        method: string;
        error_type?: string;
        error_message?: string;
        debug_info?: string;
      }>('check_permission_command');

      lastCheckTime.value = Date.now();

      if (result.success) {
        hasPermission.value = result.has_permission;
        permissionMethod.value = result.method;
        permissionError.value = null;
        
        return {
          success: true,
          data: {
            hasPermission: result.has_permission,
            checkSuccess: true,
            method: result.method,
            errorType: null,
            errorMessage: null,
            debugInfo: result.debug_info || null,
          },
        };
      } else {
        hasPermission.value = false;
        permissionMethod.value = result.method || 'unknown';
        permissionError.value = result.error_message || '权限检查失败';
        
        return {
          success: false,
          error: result.error_message || '权限检查失败',
          data: {
            hasPermission: false,
            checkSuccess: false,
            method: result.method || 'unknown',
            errorType: result.error_type || 'unknown',
            errorMessage: result.error_message || null,
            debugInfo: result.debug_info || null,
          },
        };
      }
    } catch (e) {
      hasPermission.value = false;
      permissionError.value = e instanceof Error ? e.message : '权限检查失败';
      
      return {
        success: false,
        error: e instanceof Error ? e.message : '权限检查失败',
        data: {
          hasPermission: false,
          checkSuccess: false,
          method: 'error',
          errorType: 'exception',
          errorMessage: e instanceof Error ? e.message : '未知错误',
          debugInfo: null,
        },
      };
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * 刷新权限状态
   */
  async function refreshPermission(): Promise<OperationResult<PermissionCheckResult>> {
    return checkPermission(true);
  }

  /**
   * 写入机器码
   */
  async function writeMachineId(
    guid: string,
    description?: string
  ): Promise<OperationResult<{ previousGuid: string; newGuid: string }>> {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await invoke<{
        success: boolean;
        previous_guid: string;
        new_guid: string;
        message: string;
        error?: string;
      }>('write_machine_guid_command', { newGuid: guid, description });

      if (result.success) {
        currentGuid.value = result.new_guid;
        // 操作成功后刷新备份列表
        const backupStore = useBackupStore();
        await backupStore.loadBackups();
        return {
          success: true,
          data: { previousGuid: result.previous_guid, newGuid: result.new_guid },
          message: result.message,
        };
      } else {
        error.value = result.error || '写入机器码失败';
        return { success: false, error: error.value };
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '写入机器码失败';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * 预览随机生成的 GUID
   * 用于显示预览值，确保预览值和实际替换值一致
   */
  async function previewRandomGuid(): Promise<OperationResult<string>> {
    try {
      const result = await invoke<{
        success: boolean;
        guid: string;
        error?: string;
      }>('preview_random_guid_command');

      if (result.success) {
        return {
          success: true,
          data: result.guid,
        };
      } else {
        return {
          success: false,
          error: result.error || '生成预览 GUID 失败',
        };
      }
    } catch (e) {
      return {
        success: false,
        error: e instanceof Error ? e.message : '生成预览 GUID 失败',
      };
    }
  }

  /**
   * 生成随机机器码
   * @param description 描述信息
   * @param previewGuid 预览时生成的 GUID，确保预览值和实际替换值一致
   */
  async function generateRandomMachineId(
    description?: string,
    previewGuid?: string
  ): Promise<OperationResult<{ previousGuid: string; newGuid: string }>> {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await invoke<{
        success: boolean;
        previous_guid: string;
        new_guid: string;
        message: string;
        error?: string;
      }>('generate_random_guid_command', { description, previewGuid });

      if (result.success) {
        currentGuid.value = result.new_guid;
        // 操作成功后刷新备份列表
        const backupStore = useBackupStore();
        await backupStore.loadBackups();
        return {
          success: true,
          data: { previousGuid: result.previous_guid, newGuid: result.new_guid },
          message: result.message,
        };
      } else {
        error.value = result.error || '生成随机机器码失败';
        return { success: false, error: error.value };
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '生成随机机器码失败';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * 以管理员身份重启
   */
  async function restartAsAdmin(): Promise<OperationResult<void>> {
    try {
      const result = await invoke<{
        success: boolean;
        message: string;
        platform: string;
        error?: string;
      }>('restart_as_admin_command');

      if (result.success) {
        // 重启请求成功，程序将在短时间内退出
        // 返回成功，让前端显示相应提示
        return { success: true, message: result.message };
      } else {
        return {
          success: false,
          error: result.error || '重启失败',
        };
      }
    } catch (e) {
      return {
        success: false,
        error: e instanceof Error ? e.message : '重启失败',
      };
    }
  }

  /**
   * 检查是否是重启后的状态
   */
  async function checkRestartState(): Promise<OperationResult<{ wasRestarted: boolean; timestamp?: number; platform?: string }>> {
    try {
      const result = await invoke<{
        was_restarted: boolean;
        timestamp?: number;
        platform?: string;
      }>('check_restart_state_command');

      return {
        success: true,
        data: {
          wasRestarted: result.was_restarted,
          timestamp: result.timestamp,
          platform: result.platform,
        },
      };
    } catch (e) {
      return {
        success: false,
        error: e instanceof Error ? e.message : '检查重启状态失败',
      };
    }
  }

  /**
   * 复制到剪贴板
   */
  async function copyToClipboard(): Promise<boolean> {
    if (!currentGuid.value) return false;

    try {
      await writeText(currentGuid.value);
      return true;
    } catch (e) {
      console.error('复制失败:', e);
      return false;
    }
  }

  /**
   * 获取应用程序版本号
   */
  async function getAppVersion(): Promise<string> {
    try {
      const version = await invoke<string>('get_app_version');
      appVersion.value = version;
      return version;
    } catch (e) {
      console.error('获取版本号失败:', e);
      appVersion.value = '2.1.1';
      return '2.1.1';
    }
  }

  /**
   * 初始化
   */
  async function initialize(): Promise<void> {
    await checkPermission();
    await readMachineId();
    await getAppVersion();
  }

  return {
    // State
    currentGuid,
    source,
    hasPermission,
    permissionMethod,
    permissionError,
    isLoading,
    error,
    lastCheckTime,
    appVersion,
    // Getters
    canModify,
    isPermissionStale,
    // Actions
    readMachineId,
    checkPermission,
    refreshPermission,
    writeMachineId,
    generateRandomMachineId,
    previewRandomGuid,
    restartAsAdmin,
    checkRestartState,
    copyToClipboard,
    getAppVersion,
    initialize,
  };
});
