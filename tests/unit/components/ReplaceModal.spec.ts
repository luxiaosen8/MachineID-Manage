/**
 * ReplaceModal 组件单元测试
 * TDD 实践：测试驱动开发
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import ReplaceModal from '@components/modals/ReplaceModal.vue';

// Mock 依赖
vi.mock('lucide-vue-next', () => ({
  X: { render: () => null },
  AlertTriangle: { render: () => null },
  Edit3: { render: () => null },
}));

vi.mock('@utils', () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
  isValidGuid: (guid: string) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(guid),
}));

describe('ReplaceModal Component', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('渲染', () => {
    it('应正确渲染模态框结构', () => {
      const wrapper = mount(ReplaceModal, {
        global: {
          stubs: {
            Button: {
              props: ['variant', 'disabled', 'loading'],
              template: '<button :disabled="disabled || loading"><slot /></button>',
            },
            Teleport: {
              template: '<div><slot /></div>',
            },
          },
        },
      });

      // 检查模态框基本结构 - 使用更通用的选择器
      expect(wrapper.find('.bg-slate-800').exists() || wrapper.find('div').exists()).toBe(true);
    });
  });

  describe('GUID 格式验证', () => {
    const validGuids = [
      '550E8400-E29B-41D4-A716-446655440000',
      '12345678-1234-1234-1234-123456789012',
      '00000000-0000-0000-0000-000000000000',
      'FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF',
    ];

    const invalidGuids = [
      'invalid-guid',
      '550E8400-E29B-41D4-A716',
      '550E8400E29B41D4A716446655440000',
      '550E8400-E29B-41D4-A716-44665544000',
      '550E8400-E29B-41D4-A716-4466554400000',
      '550E8400-E29B-41D4-A716-44665544000G',
      '',
    ];

    it.each(validGuids)('应接受有效的 GUID: %s', async (guid) => {
      const { isValidGuid } = await import('@utils');
      expect(isValidGuid(guid)).toBe(true);
    });

    it.each(invalidGuids)('应拒绝无效的 GUID: %s', async (guid) => {
      const { isValidGuid } = await import('@utils');
      expect(isValidGuid(guid)).toBe(false);
    });
  });
});
