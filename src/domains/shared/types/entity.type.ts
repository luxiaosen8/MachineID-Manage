/**
 * 实体基类
 * 所有领域实体都应继承此类
 */

export abstract class Entity<TId> {
  protected constructor(protected readonly _id: TId) {}

  /**
   * 获取实体ID
   */
  get id(): TId {
    return this._id;
  }

  /**
   * 比较两个实体是否相等
   */
  equals(other: Entity<TId>): boolean {
    if (!(other instanceof Entity)) {
      return false;
    }
    return this._id === other._id;
  }

  /**
   * 获取实体哈希值（用于集合）
   */
  hashCode(): string {
    return String(this._id);
  }
}

/**
 * 值对象基类
 * 所有领域值对象都应继承此类
 */

export abstract class ValueObject<T> {
  protected constructor(protected readonly _value: T) {}

  /**
   * 获取值
   */
  get value(): T {
    return this._value;
  }

  /**
   * 比较两个值对象是否相等
   */
  abstract equals(other: ValueObject<T>): boolean;

  /**
   * 获取字符串表示
   */
  toString(): string {
    return String(this._value);
  }
}
