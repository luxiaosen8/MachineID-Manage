/**
 * MachineId Store 单元测试
 * TDD 实践：测试驱动开发
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useMachineIdStore } from '@stores/machineId';

// Mock Tauri API
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

vi.mock('@tauri-apps/plugin-clipboard-manager', () => ({
  writeText: vi.fn(),
}));

import { invoke } from '@tauri-apps/api/core';

const mockedInvoke = vi.mocked(invoke);

describe('MachineId Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('初始状态', () => {
    it('应有正确的初始状态', () => {
      const store = useMachineIdStore();

      expect(store.currentGuid).toBe('');
      expect(store.source).toBe('');
      expect(store.hasPermission).toBe(false);
      expect(store.permissionMethod).toBe('');
      expect(store.permissionError).toBeNull();
      expect(store.isLoading).toBe(false);
      expect(store.error).toBeNull();
      expect(store.canModify).toBe(false);
    });
  });

  describe('readMachineId - 读取机器码', () => {
    it('应成功读取机器码', async () => {
      mockedInvoke.mockResolvedValueOnce({
        success: true,
        guid: '550E8400-E29B-41D4-A716-446655440000',
        source: 'registry',
      });

      const store = useMachineIdStore();
      const result = await store.readMachineId();

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        guid: '550E8400-E29B-41D4-A716-446655440000',
        source: 'registry',
      });
      expect(store.currentGuid).toBe('550E8400-E29B-41D4-A716-446655440000');
      expect(store.source).toBe('registry');
      expect(store.isLoading).toBe(false);
    });

    it('应处理读取失败的情况', async () => {
      mockedInvoke.mockResolvedValueOnce({
        success: false,
        error: '读取失败',
      });

      const store = useMachineIdStore();
      const result = await store.readMachineId();

      expect(result.success).toBe(false);
      expect(result.error).toBe('读取失败');
      expect(store.error).toBe('读取失败');
      expect(store.isLoading).toBe(false);
    });

    it('应处理异常情况', async () => {
      mockedInvoke.mockRejectedValueOnce(new Error('系统错误'));

      const store = useMachineIdStore();
      const result = await store.readMachineId();

      expect(result.success).toBe(false);
      expect(result.error).toBe('系统错误');
      expect(store.isLoading).toBe(false);
    });
  });

  describe('checkPermission - 检查权限', () => {
    it('应成功检查到管理员权限', async () => {
      mockedInvoke.mockResolvedValueOnce({
        success: true,
        has_permission: true,
        method: 'token',
        error_type: null,
        error_message: null,
        debug_info: null,
      });

      const store = useMachineIdStore();
      const result = await store.checkPermission();

      expect(result.success).toBe(true);
      expect(result.data?.hasPermission).toBe(true);
      expect(store.hasPermission).toBe(true);
      expect(store.canModify).toBe(true);
      expect(store.permissionMethod).toBe('token');
    });

    it('应检测到无管理员权限', async () => {
      mockedInvoke.mockResolvedValueOnce({
        success: true,
        has_permission: false,
        method: 'none',
        error_type: null,
        error_message: null,
        debug_info: null,
      });

      const store = useMachineIdStore();
      const result = await store.checkPermission();

      expect(result.success).toBe(true);
      expect(result.data?.hasPermission).toBe(false);
      expect(store.hasPermission).toBe(false);
      expect(store.canModify).toBe(false);
    });

    it('应处理权限检查失败的情况', async () => {
      mockedInvoke.mockResolvedValueOnce({
        success: false,
        has_permission: false,
        method: 'unknown',
        error_type: 'check_failed',
        error_message: '权限检查失败',
        debug_info: null,
      });

      const store = useMachineIdStore();
      const result = await store.checkPermission();

      expect(result.success).toBe(false);
      expect(result.error).toBe('权限检查失败');
      expect(store.hasPermission).toBe(false);
    });

    it('应使用缓存的权限检查结果', async () => {
      // 第一次调用
      mockedInvoke.mockResolvedValueOnce({
        success: true,
        has_permission: true,
        method: 'token',
      });

      const store = useMachineIdStore();
      await store.checkPermission();

      // 第二次调用应该使用缓存
      const result = await store.checkPermission();

      expect(result.success).toBe(true);
      expect(result.data?.hasPermission).toBe(true);
      // 只调用了一次 invoke
      expect(mockedInvoke).toHaveBeenCalledTimes(1);
    });

    it('强制刷新时应忽略缓存', async () => {
      mockedInvoke.mockResolvedValue({
        success: true,
        has_permission: true,
        method: 'token',
      });

      const store = useMachineIdStore();
      await store.checkPermission();
      await store.checkPermission(true); // 强制刷新

      expect(mockedInvoke).toHaveBeenCalledTimes(2);
    });
  });

  describe('refreshPermission - 刷新权限', () => {
    it('应强制刷新权限状态', async () => {
      mockedInvoke.mockResolvedValue({
        success: true,
        has_permission: true,
        method: 'token',
      });

      const store = useMachineIdStore();
      await store.refreshPermission();

      expect(mockedInvoke).toHaveBeenCalledTimes(1);
    });
  });

  describe('writeMachineId - 写入机器码', () => {
    it('应成功写入机器码', async () => {
      mockedInvoke.mockResolvedValueOnce({
        success: true,
        previous_guid: 'OLD-GUID-HERE',
        new_guid: '550E8400-E29B-41D4-A716-446655440000',
        message: '写入成功',
      });

      const store = useMachineIdStore();
      store.hasPermission = true;
      const result = await store.writeMachineId('550E8400-E29B-41D4-A716-446655440000', '测试描述');

      expect(result.success).toBe(true);
      expect(result.data?.previousGuid).toBe('OLD-GUID-HERE');
      expect(result.data?.newGuid).toBe('550E8400-E29B-41D4-A716-446655440000');
      expect(store.currentGuid).toBe('550E8400-E29B-41D4-A716-446655440000');
      expect(mockedInvoke).toHaveBeenCalledWith('write_machine_guid_command', {
        newGuid: '550E8400-E29B-41D4-A716-446655440000',
        description: '测试描述',
      });
    });

    it('应处理写入失败的情况', async () => {
      mockedInvoke.mockResolvedValueOnce({
        success: false,
        error: '写入失败',
      });

      const store = useMachineIdStore();
      store.hasPermission = true;
      const result = await store.writeMachineId('550E8400-E29B-41D4-A716-446655440000');

      expect(result.success).toBe(false);
      expect(result.error).toBe('写入失败');
    });

    it('应处理异常情况', async () => {
      mockedInvoke.mockRejectedValueOnce(new Error('注册表访问失败'));

      const store = useMachineIdStore();
      store.hasPermission = true;
      const result = await store.writeMachineId('550E8400-E29B-41D4-A716-446655440000');

      expect(result.success).toBe(false);
      expect(result.error).toBe('注册表访问失败');
    });
  });

  describe('generateRandomMachineId - 生成随机机器码', () => {
    it('应成功生成随机机器码', async () => {
      mockedInvoke.mockResolvedValueOnce({
        success: true,
        previous_guid: 'OLD-GUID-HERE',
        new_guid: 'NEW-RANDOM-GUID',
        message: '生成成功',
      });

      const store = useMachineIdStore();
      store.hasPermission = true;
      const result = await store.generateRandomMachineId('随机生成测试');

      expect(result.success).toBe(true);
      expect(result.data?.previousGuid).toBe('OLD-GUID-HERE');
      expect(result.data?.newGuid).toBe('NEW-RANDOM-GUID');
      expect(store.currentGuid).toBe('NEW-RANDOM-GUID');
      expect(mockedInvoke).toHaveBeenCalledWith('generate_random_guid_command', {
        description: '随机生成测试',
      });
    });

    it('应处理生成失败的情况', async () => {
      mockedInvoke.mockResolvedValueOnce({
        success: false,
        error: '生成失败',
      });

      const store = useMachineIdStore();
      store.hasPermission = true;
      const result = await store.generateRandomMachineId();

      expect(result.success).toBe(false);
      expect(result.error).toBe('生成失败');
    });
  });

  describe('restartAsAdmin - 以管理员身份重启', () => {
    it('应成功触发重启', async () => {
      // 模拟新的 API 响应格式
      mockedInvoke.mockResolvedValueOnce({
        success: true,
        message: '程序将以管理员身份重启',
        platform: 'windows',
        error: null,
      });

      const store = useMachineIdStore();
      const result = await store.restartAsAdmin();

      expect(result.success).toBe(true);
      expect(result.message).toBe('程序将以管理员身份重启');
      expect(mockedInvoke).toHaveBeenCalledWith('restart_as_admin_command');
    });

    it('应处理重启失败的情况', async () => {
      // 模拟后端返回的失败响应
      mockedInvoke.mockResolvedValueOnce({
        success: false,
        message: '重启失败',
        platform: 'windows',
        error: '无法以管理员身份启动',
      });

      const store = useMachineIdStore();
      const result = await store.restartAsAdmin();

      expect(result.success).toBe(false);
      expect(result.error).toBe('无法以管理员身份启动');
    });

    it('应处理异常情况', async () => {
      mockedInvoke.mockRejectedValueOnce(new Error('网络错误'));

      const store = useMachineIdStore();
      const result = await store.restartAsAdmin();

      expect(result.success).toBe(false);
      expect(result.error).toBe('网络错误');
    });
  });

  describe('copyToClipboard - 复制到剪贴板', () => {
    it('应有 GUID 时才能复制', async () => {
      const store = useMachineIdStore();
      store.currentGuid = '';

      const result = await store.copyToClipboard();

      expect(result).toBe(false);
    });

    it('应成功复制到剪贴板', async () => {
      const { writeText } = await import('@tauri-apps/plugin-clipboard-manager');
      const store = useMachineIdStore();
      store.currentGuid = '550E8400-E29B-41D4-A716-446655440000';

      const result = await store.copyToClipboard();

      expect(result).toBe(true);
      expect(writeText).toHaveBeenCalledWith('550E8400-E29B-41D4-A716-446655440000');
    });
  });

  describe('initialize - 初始化', () => {
    it('应正确初始化应用', async () => {
      mockedInvoke.mockResolvedValueOnce({
        success: true,
        has_permission: true,
        method: 'token',
      });
      mockedInvoke.mockResolvedValueOnce({
        success: true,
        guid: '550E8400-E29B-41D4-A716-446655440000',
        source: 'registry',
      });

      const store = useMachineIdStore();
      await store.initialize();

      expect(store.hasPermission).toBe(true);
      expect(store.currentGuid).toBe('550E8400-E29B-41D4-A716-446655440000');
    });
  });
});
