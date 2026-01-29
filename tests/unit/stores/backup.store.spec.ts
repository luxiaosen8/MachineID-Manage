/**
 * Backup Store 单元测试
 * TDD 实践：测试驱动开发
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useBackupStore } from '@stores/backup';

// Mock Tauri API
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

import { invoke } from '@tauri-apps/api/core';

const mockedInvoke = vi.mocked(invoke);

describe('Backup Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('初始状态', () => {
    it('应有正确的初始状态', () => {
      const store = useBackupStore();

      expect(store.backups).toEqual([]);
      expect(store.isLoading).toBe(false);
      expect(store.error).toBeNull();
      expect(store.selectedBackupId).toBeNull();
      expect(store.backupCount).toBe(0);
      expect(store.hasBackups).toBe(false);
    });
  });

  describe('loadBackups - 加载备份列表', () => {
    it('应成功加载备份列表', async () => {
      const mockBackups = [
        {
          id: '1',
          guid: '550E8400-E29B-41D4-A716-446655440000',
          source: 'manual',
          timestamp: 1700000000,
          description: '手动备份',
        },
      ];

      mockedInvoke.mockResolvedValueOnce({
        success: true,
        backups: mockBackups,
        count: 1,
      });

      const store = useBackupStore();
      const result = await store.loadBackups();

      expect(result.success).toBe(true);
      expect(store.backups).toEqual(mockBackups);
      expect(store.backupCount).toBe(1);
      expect(store.hasBackups).toBe(true);
      expect(store.isLoading).toBe(false);
    });

    it('应处理加载失败的情况', async () => {
      mockedInvoke.mockResolvedValueOnce({
        success: false,
        error: '加载失败',
      });

      const store = useBackupStore();
      const result = await store.loadBackups();

      expect(result.success).toBe(false);
      expect(result.error).toBe('加载失败');
      expect(store.error).toBe('加载失败');
      expect(store.isLoading).toBe(false);
    });

    it('应处理异常情况', async () => {
      mockedInvoke.mockRejectedValueOnce(new Error('网络错误'));

      const store = useBackupStore();
      const result = await store.loadBackups();

      expect(result.success).toBe(false);
      expect(result.error).toBe('网络错误');
      expect(store.isLoading).toBe(false);
    });
  });

  describe('createBackup - 创建备份', () => {
    it('应成功创建备份', async () => {
      const mockBackup = {
        id: '1',
        guid: '550E8400-E29B-41D4-A716-446655440000',
        source: 'manual',
        timestamp: 1700000000,
        description: '手动备份',
      };

      // Mock createBackup 调用（使用 force=true 跳过重复检查）
      mockedInvoke.mockResolvedValueOnce({
        success: true,
        backup: mockBackup,
        skipped: false,
      });

      const store = useBackupStore();
      const result = await store.createBackup('手动备份', true); // 使用 force=true

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockBackup);
      expect(store.backups).toContainEqual(mockBackup);
    });

    it('应处理重复备份跳过的情况', async () => {
      const existingBackup = {
        id: '1',
        guid: '550E8400-E29B-41D4-A716-446655440000',
        source: 'manual',
        timestamp: 1700000000,
        description: '已有备份',
      };

      // Mock loadBackups 调用
      mockedInvoke.mockResolvedValueOnce({
        success: true,
        backups: [existingBackup],
        count: 1,
      });

      // Mock read_machine_id 调用
      mockedInvoke.mockResolvedValueOnce({
        success: true,
        guid: '550E8400-E29B-41D4-A716-446655440000',
        source: 'manual',
      });

      const store = useBackupStore();
      const result = await store.createBackup();

      expect(result.success).toBe(true);
      expect(result.message).toBe('该机器码已存在备份，已跳过');
    });

    it('应处理创建失败的情况', async () => {
      // Mock loadBackups 调用
      mockedInvoke.mockResolvedValueOnce({
        success: true,
        backups: [],
        count: 0,
      });

      // Mock read_machine_id 调用
      mockedInvoke.mockResolvedValueOnce({
        success: true,
        guid: '550E8400-E29B-41D4-A716-446655440000',
        source: 'manual',
      });

      // Mock createBackup 失败
      mockedInvoke.mockResolvedValueOnce({
        success: false,
        error: '备份失败',
      });

      const store = useBackupStore();
      const result = await store.createBackup();

      expect(result.success).toBe(false);
      expect(result.error).toBe('备份失败');
    });

    it('使用 force=true 时应跳过重复检查直接创建', async () => {
      const mockBackup = {
        id: '2',
        guid: '550E8400-E29B-41D4-A716-446655440000',
        source: 'manual',
        timestamp: 1700000000,
        description: '强制备份',
      };

      // Mock createBackup 调用（不调用 loadBackups 和 read_machine_id）
      mockedInvoke.mockResolvedValueOnce({
        success: true,
        backup: mockBackup,
        skipped: false,
      });

      const store = useBackupStore();
      const result = await store.createBackup('强制备份', true);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockBackup);
    });
  });

  describe('deleteBackup - 删除备份', () => {
    it('应成功删除备份', async () => {
      mockedInvoke.mockResolvedValueOnce({
        success: true,
      });

      const store = useBackupStore();
      store.backups = [
        {
          id: '1',
          guid: '550E8400-E29B-41D4-A716-446655440000',
          source: 'manual',
          timestamp: 1700000000,
        },
      ];

      const result = await store.deleteBackup('1');

      expect(result.success).toBe(true);
      expect(store.backups).toHaveLength(0);
      expect(mockedInvoke).toHaveBeenCalledWith('delete_backup_by_id', { id: '1' });
    });

    it('删除备份时应清除选中状态', async () => {
      mockedInvoke.mockResolvedValueOnce({
        success: true,
      });

      const store = useBackupStore();
      store.backups = [
        {
          id: '1',
          guid: '550E8400-E29B-41D4-A716-446655440000',
          source: 'manual',
          timestamp: 1700000000,
        },
      ];
      store.selectedBackupId = '1';

      await store.deleteBackup('1');

      expect(store.selectedBackupId).toBeNull();
    });

    it('应处理删除失败的情况', async () => {
      mockedInvoke.mockResolvedValueOnce({
        success: false,
        error: '删除失败',
      });

      const store = useBackupStore();
      const result = await store.deleteBackup('1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('删除失败');
    });
  });

  describe('clearAllBackups - 清空所有备份', () => {
    it('应成功清空所有备份', async () => {
      mockedInvoke.mockResolvedValueOnce({
        success: true,
      });

      const store = useBackupStore();
      store.backups = [
        {
          id: '1',
          guid: '550E8400-E29B-41D4-A716-446655440000',
          source: 'manual',
          timestamp: 1700000000,
        },
        {
          id: '2',
          guid: '550E8400-E29B-41D4-A716-446655440001',
          source: 'manual',
          timestamp: 1700000001,
        },
      ];
      store.selectedBackupId = '1';

      const result = await store.clearAllBackups();

      expect(result.success).toBe(true);
      expect(store.backups).toHaveLength(0);
      expect(store.selectedBackupId).toBeNull();
      expect(store.hasBackups).toBe(false);
    });

    it('应处理清空失败的情况', async () => {
      mockedInvoke.mockResolvedValueOnce({
        success: false,
        error: '清空失败',
      });

      const store = useBackupStore();
      const result = await store.clearAllBackups();

      expect(result.success).toBe(false);
      expect(result.error).toBe('清空失败');
    });
  });

  describe('restoreBackup - 恢复备份', () => {
    it('应成功恢复备份', async () => {
      const mockResult = {
        success: true,
        previousGuid: 'OLD-GUID-HERE',
        restoredGuid: '550E8400-E29B-41D4-A716-446655440000',
        preBackup: {
          id: '2',
          guid: 'OLD-GUID-HERE',
          source: 'auto',
          timestamp: 1700000001,
        },
        restoredFrom: {
          id: '1',
          guid: '550E8400-E29B-41D4-A716-446655440000',
          source: 'manual',
          timestamp: 1700000000,
        },
        message: '恢复成功',
      };

      mockedInvoke.mockResolvedValueOnce(mockResult);
      mockedInvoke.mockResolvedValueOnce({
        success: true,
        backups: [],
        count: 0,
      });

      const store = useBackupStore();
      const result = await store.restoreBackup('1');

      expect(result.success).toBe(true);
      expect(result.data?.previousGuid).toBe('OLD-GUID-HERE');
      expect(result.data?.restoredGuid).toBe('550E8400-E29B-41D4-A716-446655440000');
      expect(mockedInvoke).toHaveBeenCalledWith('restore_backup_by_id_command', { id: '1' });
    });

    it('应处理恢复失败的情况', async () => {
      mockedInvoke.mockResolvedValueOnce({
        success: false,
        error: '恢复失败',
      });

      const store = useBackupStore();
      const result = await store.restoreBackup('1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('恢复失败');
    });
  });

  describe('selectBackup - 选择备份', () => {
    it('应能选择备份', () => {
      const store = useBackupStore();

      store.selectBackup('1');

      expect(store.selectedBackupId).toBe('1');
    });

    it('应能取消选择', () => {
      const store = useBackupStore();
      store.selectedBackupId = '1';

      store.selectBackup(null);

      expect(store.selectedBackupId).toBeNull();
    });
  });

  describe('copyBackupGuid - 复制备份GUID', () => {
    it('应成功复制GUID到剪贴板', async () => {
      const store = useBackupStore();
      const result = await store.copyBackupGuid('550E8400-E29B-41D4-A716-446655440000');

      expect(result).toBe(true);
    });
  });

  describe('formattedBackups - 格式化备份列表', () => {
    it('应正确格式化备份日期', () => {
      const store = useBackupStore();
      store.backups = [
        {
          id: '1',
          guid: '550E8400-E29B-41D4-A716-446655440000',
          source: 'manual',
          timestamp: 1700000000, // 2023-11-14
        },
      ];

      const formatted = store.formattedBackups;

      expect(formatted[0].formattedDate).toBeDefined();
      expect(formatted[0].guid).toBe('550E8400-E29B-41D4-A716-446655440000');
    });
  });
});
