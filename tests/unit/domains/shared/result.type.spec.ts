/**
 * Result 类型单元测试
 * TDD 实践：测试驱动开发
 */

import { describe, it, expect } from 'vitest';
import { Result, tryCatch, tryCatchAsync } from '@domains/shared/types/result.type';

describe('Result Type', () => {
  describe('创建 Result', () => {
    it('应创建成功的 Result', () => {
      const result = Result.success(42);
      expect(result.isSuccess()).toBe(true);
      expect(result.isFailure()).toBe(false);
      expect(result.getValue()).toBe(42);
    });

    it('应创建失败的 Result', () => {
      const error = new Error('Something went wrong');
      const result = Result.failure(error);
      expect(result.isSuccess()).toBe(false);
      expect(result.isFailure()).toBe(true);
      expect(result.getError()).toBe(error);
    });
  });

  describe('获取值和错误', () => {
    it('getValue 在成功时应返回值', () => {
      const result = Result.success('test');
      expect(result.getValue()).toBe('test');
    });

    it('getValue 在失败时应抛出错误', () => {
      const result = Result.failure(new Error('Failed'));
      expect(() => result.getValue()).toThrow('Cannot get value from a failed result');
    });

    it('getError 在失败时应返回错误', () => {
      const error = new Error('Failed');
      const result = Result.failure(error);
      expect(result.getError()).toBe(error);
    });

    it('getError 在成功时应抛出错误', () => {
      const result = Result.success('test');
      expect(() => result.getError()).toThrow('Cannot get error from a successful result');
    });
  });

  describe('映射操作', () => {
    it('map 应转换成功值', () => {
      const result = Result.success(5);
      const mapped = result.map((x) => x * 2);
      expect(mapped.getValue()).toBe(10);
    });

    it('map 在失败时不应执行', () => {
      const result = Result.failure<number>(new Error('Failed'));
      const mapped = result.map((x) => x * 2);
      expect(mapped.isFailure()).toBe(true);
    });

    it('flatMap 应支持链式操作', () => {
      const result = Result.success(5);
      const flatMapped = result.flatMap((x) => Result.success(x * 2));
      expect(flatMapped.getValue()).toBe(10);
    });

    it('flatMap 在失败时不应执行', () => {
      const result = Result.failure<number>(new Error('Failed'));
      const flatMapped = result.flatMap((x) => Result.success(x * 2));
      expect(flatMapped.isFailure()).toBe(true);
    });
  });

  describe('默认值处理', () => {
    it('getOrElse 在成功时应返回值', () => {
      const result = Result.success(42);
      expect(result.getOrElse(0)).toBe(42);
    });

    it('getOrElse 在失败时应返回默认值', () => {
      const result = Result.failure<number>(new Error('Failed'));
      expect(result.getOrElse(0)).toBe(0);
    });

    it('getOrElseFn 在成功时应返回值', () => {
      const result = Result.success(42);
      expect(result.getOrElseFn(() => 0)).toBe(42);
    });

    it('getOrElseFn 在失败时应执行函数', () => {
      const result = Result.failure<number>(new Error('Failed'));
      expect(result.getOrElseFn(() => 0)).toBe(0);
    });
  });

  describe('tryCatch 辅助函数', () => {
    it('tryCatch 应包装成功的函数执行', () => {
      const result = tryCatch(() => 42);
      expect(result.isSuccess()).toBe(true);
      expect(result.getValue()).toBe(42);
    });

    it('tryCatch 应包装失败的函数执行', () => {
      const result = tryCatch(() => {
        throw new Error('Failed');
      });
      expect(result.isFailure()).toBe(true);
      expect(result.getError().message).toBe('Failed');
    });

    it('tryCatchAsync 应包装成功的异步函数', async () => {
      const result = await tryCatchAsync(async () => 42);
      expect(result.isSuccess()).toBe(true);
      expect(result.getValue()).toBe(42);
    });

    it('tryCatchAsync 应包装失败的异步函数', async () => {
      const result = await tryCatchAsync(async () => {
        throw new Error('Failed');
      });
      expect(result.isFailure()).toBe(true);
      expect(result.getError().message).toBe('Failed');
    });
  });
});
