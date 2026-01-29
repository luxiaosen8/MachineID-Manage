/**
 * GUID 值对象
 * 封装 GUID 的验证和生成逻辑
 */

import { ValueObject } from '@domains/shared/types/entity.type';
import { Result } from '@domains/shared/types/result.type';
import { ValidationError } from '@domains/shared/errors/domain.error';

export class Guid extends ValueObject<string> {
  /**
   * GUID 格式正则表达式
   * 匹配标准 GUID 格式: XXXXXXXX-XXXX-4XXX-XXXX-XXXXXXXXXXXX
   */
  private static readonly PATTERN = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

  private constructor(value: string) {
    super(value.toUpperCase());
  }

  /**
   * 从字符串创建 GUID
   * @param value GUID 字符串
   * @returns Result<Guid, ValidationError>
   */
  static create(value: string): Result<Guid, ValidationError> {
    if (!value || value.trim() === '') {
      return Result.failure(new ValidationError('GUID 不能为空'));
    }

    const trimmed = value.trim();

    if (!Guid.PATTERN.test(trimmed)) {
      return Result.failure(new ValidationError('无效的 GUID 格式，应为: XXXXXXXX-XXXX-4XXX-XXXX-XXXXXXXXXXXX'));
    }

    return Result.success(new Guid(trimmed));
  }

  /**
   * 生成随机 GUID
   * 使用 crypto.getRandomValues 生成密码学安全的随机数
   * 遵循 RFC 4122 版本 4 UUID 标准
   * @returns 新的 GUID 实例
   */
  static generate(): Guid {
    // 使用 crypto.getRandomValues 生成密码学安全的随机数
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);

    // 设置版本 (4) 和变体位 (RFC 4122)
    array[6] = (array[6] & 0x0f) | 0x40; // 版本 4
    array[8] = (array[8] & 0x3f) | 0x80; // 变体 10

    // 转换为十六进制字符串
    const hex = Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');

    // 格式化为 GUID 格式
    const value = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;

    return new Guid(value.toUpperCase());
  }

  /**
   * 比较两个 GUID 是否相等
   */
  equals(other: ValueObject<string>): boolean {
    if (!(other instanceof Guid)) {
      return false;
    }
    return this._value === other._value;
  }

  /**
   * 获取 GUID 字符串值
   */
  get value(): string {
    return this._value;
  }

  /**
   * 获取 GUID 字符串表示
   */
  toString(): string {
    return this._value;
  }

  /**
   * 验证字符串是否为有效的 GUID 格式
   * @param value 要验证的字符串
   * @returns 是否有效
   */
  static isValid(value: string): boolean {
    if (!value || value.trim() === '') {
      return false;
    }
    return Guid.PATTERN.test(value.trim());
  }
}
