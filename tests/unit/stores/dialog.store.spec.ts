/**
 * Dialog Store 单元测试
 * TDD 实践：测试驱动开发
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useDialogStore } from '@stores/dialog';

describe('Dialog Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('初始状态', () => {
    it('应有正确的初始状态', () => {
      const store = useDialogStore();

      expect(store.confirmVisible).toBe(false);
      expect(store.alertVisible).toBe(false);
      expect(store.replaceModalVisible).toBe(false);
      expect(store.generateModalVisible).toBe(false);
      expect(store.isLoading).toBe(false);
      expect(store.confirmConfig.title).toBe('确认操作');
      expect(store.alertConfig.title).toBe('提示');
    });
  });

  describe('showConfirm - 显示确认对话框', () => {
    it('应显示确认对话框并返回Promise', async () => {
      const store = useDialogStore();

      const promise = store.showConfirm({
        title: '测试确认',
        message: '确认消息',
        confirmText: '确认',
        cancelText: '取消',
        variant: 'default',
        type: 'confirm',
      });

      expect(store.confirmVisible).toBe(true);
      expect(store.confirmConfig.title).toBe('测试确认');
      expect(store.confirmConfig.message).toBe('确认消息');
      expect(store.confirmConfig.confirmText).toBe('确认');
      expect(store.confirmConfig.cancelText).toBe('取消');

      // 模拟确认
      store.confirm();

      const result = await promise;
      expect(result).toBe(true);
      expect(store.confirmVisible).toBe(false);
    });

    it('应处理取消操作', async () => {
      const store = useDialogStore();

      const promise = store.showConfirm({
        title: '测试确认',
        message: '确认消息',
      });

      // 模拟取消
      store.cancel();

      const result = await promise;
      expect(result).toBe(false);
      expect(store.confirmVisible).toBe(false);
    });

    it('应使用默认配置', async () => {
      const store = useDialogStore();

      store.showConfirm({
        title: '测试',
        message: '消息',
      });

      expect(store.confirmConfig.confirmText).toBe('确认');
      expect(store.confirmConfig.cancelText).toBe('取消');
      expect(store.confirmConfig.variant).toBe('default');
      expect(store.confirmConfig.type).toBe('confirm');
    });
  });

  describe('showAlert - 显示提示对话框', () => {
    it('应显示提示对话框', async () => {
      const store = useDialogStore();

      const promise = store.showAlert({
        title: '测试提示',
        message: '提示消息',
        type: 'info',
        confirmText: '确定',
      });

      expect(store.alertVisible).toBe(true);
      expect(store.alertConfig.title).toBe('测试提示');
      expect(store.alertConfig.message).toBe('提示消息');
      expect(store.alertConfig.type).toBe('info');

      // 模拟关闭
      store.closeAlert();

      await promise;
      expect(store.alertVisible).toBe(false);
    });
  });

  describe('showSuccess - 显示成功提示', () => {
    it('应显示成功提示', async () => {
      const store = useDialogStore();

      const promise = store.showSuccess('操作成功', '数据已保存');

      expect(store.alertVisible).toBe(true);
      expect(store.alertConfig.title).toBe('操作成功');
      expect(store.alertConfig.message).toBe('数据已保存');
      expect(store.alertConfig.type).toBe('success');

      store.closeAlert();
      await promise;
    });
  });

  describe('showError - 显示错误提示', () => {
    it('应显示错误提示', async () => {
      const store = useDialogStore();

      const promise = store.showError('操作失败', '网络连接错误');

      expect(store.alertVisible).toBe(true);
      expect(store.alertConfig.title).toBe('操作失败');
      expect(store.alertConfig.message).toBe('网络连接错误');
      expect(store.alertConfig.type).toBe('error');

      store.closeAlert();
      await promise;
    });
  });

  describe('showWarning - 显示警告提示', () => {
    it('应显示警告提示', async () => {
      const store = useDialogStore();

      const promise = store.showWarning('警告', '此操作不可撤销');

      expect(store.alertVisible).toBe(true);
      expect(store.alertConfig.title).toBe('警告');
      expect(store.alertConfig.message).toBe('此操作不可撤销');
      expect(store.alertConfig.type).toBe('warning');

      store.closeAlert();
      await promise;
    });
  });

  describe('showPermissionAlert - 显示权限提示', () => {
    it('应显示权限提示', async () => {
      const store = useDialogStore();

      const promise = store.showPermissionAlert('需要权限', '请使用管理员权限运行');

      expect(store.alertVisible).toBe(true);
      expect(store.alertConfig.title).toBe('需要权限');
      expect(store.alertConfig.message).toBe('请使用管理员权限运行');
      expect(store.alertConfig.type).toBe('permission');

      store.closeAlert();
      await promise;
    });
  });

  describe('setLoading - 设置加载状态', () => {
    it('应能设置加载状态', () => {
      const store = useDialogStore();

      store.setLoading(true);
      expect(store.isLoading).toBe(true);

      store.setLoading(false);
      expect(store.isLoading).toBe(false);
    });
  });

  describe('Replace Modal - 替换模态框', () => {
    it('应能打开替换模态框', () => {
      const store = useDialogStore();

      store.openReplaceModal();

      expect(store.replaceModalVisible).toBe(true);
    });

    it('应能关闭替换模态框', () => {
      const store = useDialogStore();

      store.openReplaceModal();
      store.closeReplaceModal();

      expect(store.replaceModalVisible).toBe(false);
    });
  });

  describe('Generate Modal - 生成模态框', () => {
    it('应能打开生成模态框', () => {
      const store = useDialogStore();

      store.openGenerateModal();

      expect(store.generateModalVisible).toBe(true);
    });

    it('应能关闭生成模态框', () => {
      const store = useDialogStore();

      store.openGenerateModal();
      store.closeGenerateModal();

      expect(store.generateModalVisible).toBe(false);
    });
  });

  describe('对话框类型', () => {
    it('应支持不同类型的确认对话框', async () => {
      const store = useDialogStore();
      const types = ['confirm', 'delete', 'restore', 'permission', 'restart', 'warning'] as const;

      for (const type of types) {
        const promise = store.showConfirm({
          title: '测试',
          message: '消息',
          type,
        });

        expect(store.confirmConfig.type).toBe(type);

        store.confirm();
        await promise;
      }
    });

    it('应支持不同类型的提示对话框', async () => {
      const store = useDialogStore();
      const types = ['info', 'success', 'error', 'warning', 'permission'] as const;

      for (const type of types) {
        const promise = store.showAlert({
          title: '测试',
          message: '消息',
          type,
        });

        expect(store.alertConfig.type).toBe(type);

        store.closeAlert();
        await promise;
      }
    });
  });

  describe('变体样式', () => {
    it('应支持不同的确认按钮变体', async () => {
      const store = useDialogStore();
      const variants = ['default', 'destructive'] as const;

      for (const variant of variants) {
        const promise = store.showConfirm({
          title: '测试',
          message: '消息',
          variant,
        });

        expect(store.confirmConfig.variant).toBe(variant);

        store.confirm();
        await promise;
      }
    });
  });
});
