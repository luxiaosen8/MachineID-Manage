/**
 * MachineId 实体
 * 表示 Windows 机器码的领域实体
 */

import { Entity } from '@domains/shared/types/entity.type';
import { Guid } from '../value-objects/guid.vo';

export interface MachineIdProps {
  guid: Guid;
  source: string;
  createdAt?: Date;
}

export class MachineId extends Entity<string> {
  private readonly _guid: Guid;
  private readonly _source: string;
  private readonly _createdAt: Date;

  constructor(props: MachineIdProps) {
    super(props.guid.value);
    this._guid = props.guid;
    this._source = props.source;
    this._createdAt = props.createdAt ?? new Date();
  }

  /**
   * 获取 GUID 值对象
   */
  get guid(): Guid {
    return this._guid;
  }

  /**
   * 获取 GUID 字符串值
   */
  get guidString(): string {
    return this._guid.value;
  }

  /**
   * 获取机器码来源
   */
  get source(): string {
    return this._source;
  }

  /**
   * 获取创建时间
   */
  get createdAt(): Date {
    return this._createdAt;
  }

  /**
   * 比较两个 MachineId 是否相等
   */
  equals(other: MachineId): boolean {
    if (!(other instanceof MachineId)) {
      return false;
    }
    return this._guid.equals(other._guid);
  }

  /**
   * 创建 MachineId 的副本，可以修改部分属性
   */
  copy(props: Partial<MachineIdProps> = {}): MachineId {
    return new MachineId({
      guid: props.guid ?? this._guid,
      source: props.source ?? this._source,
      createdAt: props.createdAt ?? this._createdAt,
    });
  }

  /**
   * 转换为普通对象
   */
  toJSON(): {
    id: string;
    guid: string;
    source: string;
    createdAt: string;
  } {
    return {
      id: this.id,
      guid: this._guid.value,
      source: this._source,
      createdAt: this._createdAt.toISOString(),
    };
  }
}
