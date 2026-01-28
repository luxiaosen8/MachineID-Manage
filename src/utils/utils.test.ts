import { describe, it, expect } from 'vitest';
import { isValidGuid, generateGuid, cn } from './index';

describe('工具函数测试', () => {
  describe('isValidGuid', () => {
    it('应该验证有效的 GUID', () => {
      const validGuids = [
        '550E8400-E29B-41D4-A716-446655440000',
        '12345678-1234-1234-1234-123456789012',
        '00000000-0000-0000-0000-000000000000',
        'FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF',
      ];

      validGuids.forEach((guid) => {
        expect(isValidGuid(guid)).toBe(true);
      });
    });

    it('应该拒绝无效的 GUID', () => {
      const invalidGuids = [
        'invalid-guid',
        '550E8400-E29B-41D4-A716',
        '550E8400E29B41D4A716446655440000',
        '550E8400-E29B-41D4-A716-44665544000',
        '550E8400-E29B-41D4-A716-4466554400000',
        '550E8400-E29B-41D4-A716-44665544000g',
        '',
      ];

      invalidGuids.forEach((guid) => {
        expect(isValidGuid(guid)).toBe(false);
      });
    });
  });

  describe('generateGuid', () => {
    it('应该生成有效的 GUID', () => {
      const guid = generateGuid();
      expect(isValidGuid(guid)).toBe(true);
    });

    it('应该生成唯一的 GUID', () => {
      const guids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        guids.add(generateGuid());
      }
      expect(guids.size).toBe(100);
    });
  });

  describe('cn', () => {
    it('应该合并类名', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
    });

    it('应该处理条件类名', () => {
      expect(cn('class1', false && 'class2', 'class3')).toBe('class1 class3');
    });

    it('应该处理对象形式', () => {
      expect(cn('class1', { class2: true, class3: false })).toBe('class1 class2');
    });
  });
});
