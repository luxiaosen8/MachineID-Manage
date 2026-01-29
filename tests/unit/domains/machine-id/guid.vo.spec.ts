/**
 * Guid 值对象单元测试
 * TDD 实践：测试驱动开发
 */

import { describe, it, expect } from 'vitest';
import { Guid } from '@domains/machine-id/value-objects/guid.vo';
import { validGuidTestCases, invalidGuidTestCases } from '@tests/data/guid-test-data';

describe('Guid Value Object', () => {
  describe('创建有效的 GUID', () => {
    it.each(validGuidTestCases)('应接受 $description: $value', ({ value }) => {
      const result = Guid.create(value);
      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().value).toBe(value.toUpperCase());
    });

    it('应生成有效的随机 GUID', () => {
      const guid = Guid.generate();
      expect(Guid.isValid(guid.value)).toBe(true);
    });

    it('生成的 GUID 应符合 RFC 4122 版本 4 格式', () => {
      const guid = Guid.generate();
      const pattern = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/;
      expect(pattern.test(guid.value)).toBe(true);
    });
  });

  describe('拒绝无效的 GUID', () => {
    it.each(invalidGuidTestCases)('应拒绝 $description: "$value"', ({ value, expectedError }) => {
      const result = Guid.create(value);
      expect(result.isFailure()).toBe(true);
      expect(result.getError().message).toContain(expectedError);
    });
  });

  describe('GUID 唯一性', () => {
    it('应生成唯一的 GUID', () => {
      const guids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        guids.add(Guid.generate().value);
      }
      expect(guids.size).toBe(100);
    });
  });

  describe('GUID 相等性', () => {
    it('相同值的 GUID 应相等', () => {
      const guid1 = Guid.create('550E8400-E29B-41D4-A716-446655440000').getValue();
      const guid2 = Guid.create('550E8400-E29B-41D4-A716-446655440000').getValue();
      expect(guid1.equals(guid2)).toBe(true);
    });

    it('不同值的 GUID 不应相等', () => {
      const guid1 = Guid.generate();
      const guid2 = Guid.generate();
      expect(guid1.equals(guid2)).toBe(false);
    });

    it('大小写不敏感的相等性', () => {
      const guid1 = Guid.create('550E8400-E29B-41D4-A716-446655440000').getValue();
      const guid2 = Guid.create('550e8400-e29b-41d4-a716-446655440000').getValue();
      expect(guid1.equals(guid2)).toBe(true);
    });
  });

  describe('静态验证方法', () => {
    it.each(validGuidTestCases)('isValid 应返回 true 对于 $description', ({ value }) => {
      expect(Guid.isValid(value)).toBe(true);
    });

    it.each(invalidGuidTestCases)('isValid 应返回 false 对于 $description', ({ value }) => {
      expect(Guid.isValid(value)).toBe(false);
    });
  });

  describe('字符串表示', () => {
    it('toString 应返回 GUID 字符串', () => {
      const guid = Guid.create('550E8400-E29B-41D4-A716-446655440000').getValue();
      expect(guid.toString()).toBe('550E8400-E29B-41D4-A716-446655440000');
    });

    it('value getter 应返回 GUID 字符串', () => {
      const guid = Guid.create('550E8400-E29B-41D4-A716-446655440000').getValue();
      expect(guid.value).toBe('550E8400-E29B-41D4-A716-446655440000');
    });
  });
});
