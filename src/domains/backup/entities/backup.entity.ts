/**
 * Backup 实体
 * 表示机器码备份的领域实体
 */

import { Entity } from '@domains/shared/types/entity.type';
import { BackupId } from '../value-objects/backup-id.vo';
import { MachineId } from '../../machine-id/entities/machine-id.entity';

export interface BackupProps {
  id?: BackupId;
  machineId: MachineId;
  timestamp?: Date;
  description?: string;
}

export class Backup extends Entity<string> {
  private readonly _machineId: MachineId;
  private readonly _timestamp: Date;
  private readonly _description?: string;

  constructor(props: BackupProps) {
    const id = props.id ?? BackupId.create();
    super(id.value);
    this._machineId = props.machineId;
    this._timestamp = props.timestamp ?? new Date();
    this._description = props.description;
  }

  /**
   * 获取备份ID
   */
  get backupId(): BackupId {
    return BackupId.fromString(this._id);
  }

  /**
   * 获取机器码
   */
  get machineId(): MachineId {
    return this._machineId;
  }

  /**
   * 获取备份时间戳
   */
  get timestamp(): Date {
    return this._timestamp;
  }

  /**
   * 获取 Unix 时间戳（秒）
   */
  get unixTimestamp(): number {
    return Math.floor(this._timestamp.getTime() / 1000);
  }

  /**
   * 获取描述
   */
  get description(): string | undefined {
    return this._description;
  }

  /**
   * 比较两个备份是否相等（基于机器码和时间戳）
   */
  equals(other: Backup): boolean {
    if (!(other instanceof Backup)) {
      return false;
    }
    return (
      this._machineId.equals(other._machineId) &&
      this._timestamp.getTime() === other._timestamp.getTime()
    );
  }

  /**
   * 检查是否与给定的机器码相同
   */
  hasSameMachineId(machineId: MachineId): boolean {
    return this._machineId.equals(machineId);
  }

  /**
   * 创建备份的副本，可以修改部分属性
   */
  copy(props: Partial<BackupProps> = {}): Backup {
    return new Backup({
      id: props.id ?? this.backupId,
      machineId: props.machineId ?? this._machineId,
      timestamp: props.timestamp ?? this._timestamp,
      description: props.description ?? this._description,
    });
  }

  /**
   * 转换为普通对象
   */
  toJSON(): {
    id: string;
    guid: string;
    source: string;
    timestamp: number;
    description?: string;
  } {
    return {
      id: this._id,
      guid: this._machineId.guidString,
      source: this._machineId.source,
      timestamp: this.unixTimestamp,
      description: this._description,
    };
  }

  /**
   * 从普通对象创建 Backup 实例
   */
  static async fromJSON(data: {
    id: string;
    guid: string;
    source: string;
    timestamp: number;
    description?: string;
  }): Promise<Backup | null> {
    const guidResult = (await import('../../machine-id/value-objects/guid.vo')).Guid.create(data.guid);
    if (guidResult.isFailure()) {
      return null;
    }

    const machineId = new (await import('../../machine-id/entities/machine-id.entity')).MachineId({
      guid: guidResult.getValue(),
      source: data.source,
    });

    return new Backup({
      id: BackupId.fromString(data.id),
      machineId,
      timestamp: new Date(data.timestamp * 1000),
      description: data.description,
    });
  }
}
