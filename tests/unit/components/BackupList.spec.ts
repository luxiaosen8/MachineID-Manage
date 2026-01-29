/**
 * BackupList 组件单元测试
 * TDD 实践：测试驱动开发
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { ref, computed } from 'vue';
import BackupList from '@components/features/BackupList.vue';

// Mock 依赖
vi.mock('lucide-vue-next', () => ({
  Archive: { render: () => null },
  Trash2: { render: () => null },
  Copy: { render: () => null },
  RotateCcw: { render: () => null },
  Clock: { render: () => null },
  FileText: { render: () => null },
}));

vi.mock('@utils', () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
}));

describe('BackupList Component', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('渲染', () => {
    it('应正确渲染组件', () => {
      const wrapper = mount(BackupList, {
        global: {
          stubs: {
            Button: {
              props: ['variant', 'size', 'disabled'],
              template: '<button :disabled="disabled"><slot /></button>',
            },
          },
        },
      });

      expect(wrapper.find('h2').text()).toContain('备份列表');
      expect(wrapper.text()).toContain('管理和恢复历史备份');
    });
  });

  describe('空状态', () => {
    it('应能渲染空状态', () => {
      const wrapper = mount(BackupList, {
        global: {
          stubs: {
            Button: {
              props: ['variant', 'size', 'disabled'],
              template: '<button :disabled="disabled"><slot /></button>',
            },
          },
        },
      });

      // 组件应该能正常渲染
      expect(wrapper.find('section').exists()).toBe(true);
    });
  });

  describe('组件结构', () => {
    it('应包含 section 元素', () => {
      const wrapper = mount(BackupList, {
        global: {
          stubs: {
            Button: {
              props: ['variant', 'size', 'disabled', 'title'],
              template: '<button :disabled="disabled" :title="title"><slot /></button>',
            },
          },
        },
      });

      // 检查是否有 section 存在
      expect(wrapper.find('section').exists()).toBe(true);
    });
  });
});
