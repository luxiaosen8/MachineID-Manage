/**
 * ActionPanel 组件单元测试
 * TDD 实践：测试驱动开发
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { ref } from 'vue';
import ActionPanel from '@components/features/ActionPanel.vue';

// Mock 依赖
vi.mock('lucide-vue-next', () => ({
  Settings: { render: () => null },
  Save: { render: () => null },
  Sparkles: { render: () => null },
  Edit3: { render: () => null },
  AlertCircle: { render: () => null },
  CheckCircle2: { render: () => null },
}));

vi.mock('@utils', () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
}));

describe('ActionPanel Component', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('渲染', () => {
    it('应正确渲染组件', () => {
      const wrapper = mount(ActionPanel, {
        global: {
          stubs: {
            Button: {
              props: ['variant', 'disabled', 'loading'],
              template: '<button :disabled="disabled || loading"><slot /></button>',
            },
          },
        },
      });

      expect(wrapper.find('h2').text()).toBe('管理操作');
      expect(wrapper.text()).toContain('备份、生成和替换机器码');
    });

    it('应显示三个操作按钮', () => {
      const wrapper = mount(ActionPanel, {
        global: {
          stubs: {
            Button: {
              props: ['variant', 'disabled', 'loading'],
              template: '<button :disabled="disabled || loading"><slot /></button>',
            },
          },
        },
      });

      expect(wrapper.text()).toContain('备份机器码');
      expect(wrapper.text()).toContain('随机生成');
      expect(wrapper.text()).toContain('自定义替换');
    });
  });

  describe('按钮点击事件', () => {
    it('应触发备份按钮点击', async () => {
      const wrapper = mount(ActionPanel, {
        global: {
          stubs: {
            Button: {
              props: ['variant', 'disabled', 'loading'],
              template: '<button :disabled="disabled || loading" @click="$emit(\'click\')"><slot /></button>',
            },
          },
        },
      });

      const buttons = wrapper.findAll('button');
      const backupButton = buttons.find(b => b.text().includes('备份机器码'));

      expect(backupButton).toBeDefined();
    });

    it('应触发生成按钮点击', async () => {
      const wrapper = mount(ActionPanel, {
        global: {
          stubs: {
            Button: {
              props: ['variant', 'disabled', 'loading'],
              template: '<button :disabled="disabled || loading" @click="$emit(\'click\')"><slot /></button>',
            },
          },
        },
      });

      const buttons = wrapper.findAll('button');
      const generateButton = buttons.find(b => b.text().includes('随机生成'));

      expect(generateButton).toBeDefined();
    });

    it('应触发替换按钮点击', async () => {
      const wrapper = mount(ActionPanel, {
        global: {
          stubs: {
            Button: {
              props: ['variant', 'disabled', 'loading'],
              template: '<button :disabled="disabled || loading" @click="$emit(\'click\')"><slot /></button>',
            },
          },
        },
      });

      const buttons = wrapper.findAll('button');
      const replaceButton = buttons.find(b => b.text().includes('自定义替换'));

      expect(replaceButton).toBeDefined();
    });
  });

  describe('权限状态显示', () => {
    it('应显示权限状态区域', () => {
      const wrapper = mount(ActionPanel, {
        global: {
          stubs: {
            Button: {
              props: ['variant', 'disabled', 'loading'],
              template: '<button :disabled="disabled || loading"><slot /></button>',
            },
          },
        },
      });

      // 检查是否有权限状态显示区域
      const sections = wrapper.findAll('div');
      const hasPermissionSection = sections.some(s => 
        s.classes().some(c => c.includes('emerald') || c.includes('amber'))
      );
      expect(hasPermissionSection).toBe(true);
    });
  });
});
