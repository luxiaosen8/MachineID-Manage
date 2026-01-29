/**
 * MachineId 实体单元测试
 * TDD 实践：测试驱动开发
 */

import { describe, it, expect } from 'vitest';
import { MachineId } from '@domains/machine-id/entities/machine-id.entity';
import { Guid } from '@domains/machine-id/value-objects/guid.vo';

describe('MachineId Entity', () => {
  const testGuid = Guid.create('550E8400-E29B-41D4-A716-446655440000').getValue();

  describe('创建 MachineId', () => {
    it('应使用有效的 GUID 和来源创建 MachineId', () => {
      const machineId = new MachineId({
        guid: testGuid,
        source: 'registry',
      });

      expect(machineId.guidString).toBe('550E8400-E29B-41D4-A716-446655440000');
      expect(machineId.source).toBe('registry');
      expect(machineId.id).toBe('550E8400-E29B-41D4-A716-446655440000');
    });

    it('应设置默认创建时间', () => {
      const before = new Date();
      const machineId = new MachineId({
        guid: testGuid,
        source: 'registry',
      });
      const after = new Date();

      expect(machineId.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(machineId.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('应接受自定义创建时间', () => {
      const customDate = new Date('2024-01-01');
      const machineId = new MachineId({
        guid: testGuid,
        source: 'registry',
        createdAt: customDate,
      });

      expect(machineId.createdAt).toEqual(customDate);
    });
  });

  describe('属性访问', () => {
    it('应返回正确的 GUID 值对象', () => {
      const machineId = new MachineId({
        guid: testGuid,
        source: 'registry',
      });

      expect(machineId.guid.equals(testGuid)).toBe(true);
    });

    it('应返回正确的 GUID 字符串', () => {
      const machineId = new MachineId({
        guid: testGuid,
        source: 'manual',
      });

      expect(machineId.guidString).toBe('550E8400-E29B-41D4-A716-446655440000');
      expect(machineId.source).toBe('manual');
    });
  });

  describe('相等性比较', () => {
    it('相同 GUID 的 MachineId 应相等', () => {
      const machineId1 = new MachineId({
        guid: testGuid,
        source: 'registry',
      });
      const machineId2 = new MachineId({
        guid: testGuid,
        source: 'manual',
      });

      expect(machineId1.equals(machineId2)).toBe(true);
    });

    it('不同 GUID 的 MachineId 不应相等', () => {
      const machineId1 = new MachineId({
        guid: testGuid,
        source: 'registry',
      });
      const machineId2 = new MachineId({
        guid: Guid.generate(),
        source: 'registry',
      });

      expect(machineId1.equals(machineId2)).toBe(false);
    });
  });

  describe('复制功能', () => {
    it('应创建具有相同属性的副本', () => {
      const original = new MachineId({
        guid: testGuid,
        source: 'registry',
      });
      const copy = original.copy();

      expect(copy.guidString).toBe(original.guidString);
      expect(copy.source).toBe(original.source);
      expect(copy.createdAt).toEqual(original.createdAt);
    });

    it('应允许修改副本的属性', () => {
      const original = new MachineId({
        guid: testGuid,
        source: 'registry',
      });
      const newGuid = Guid.generate();
      const copy = original.copy({
        guid: newGuid,
        source: 'manual',
      });

      expect(copy.guidString).toBe(newGuid.value);
      expect(copy.source).toBe('manual');
      expect(original.source).toBe('registry'); // 原始对象不变
    });
  });

  describe('JSON 序列化', () => {
    it('应正确转换为 JSON', () => {
      const customDate = new Date('2024-01-15T10:30:00.000Z');
      const machineId = new MachineId({
        guid: testGuid,
        source: 'registry',
        createdAt: customDate,
      });

      const json = machineId.toJSON();

      expect(json).toEqual({
        id: '550E8400-E29B-41D4-A716-446655440000',
        guid: '550E8400-E29B-41D4-A716-446655440000',
        source: 'registry',
        createdAt: '2024-01-15T10:30:00.000Z',
      });
    });
  });
});
