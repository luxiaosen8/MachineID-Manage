/**
 * BackupId 值对象
 * 备份唯一标识符
 */

import { ValueObject } from '@domains/shared/types/entity.type';

export class BackupId extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  /**
   * 创建新的 BackupId
   */
  static create(): BackupId {
    const value = `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return new BackupId(value);
  }

  /**
   * 从字符串创建 BackupId
   */
  static fromString(value: string): BackupId {
    return new BackupId(value);
  }

  /**
   * 比较两个 BackupId 是否相等
   */
  equals(other: ValueObject<string>): boolean {
    if (!(other instanceof BackupId)) {
      return false;
    }
    return this._value === other._value;
  }

  /**
   * 获取字符串值
   */
  get value(): string {
    return this._value;
  }

  /**
   * 转换为字符串
   */
  toString(): string {
    return this._value;
  }
}
