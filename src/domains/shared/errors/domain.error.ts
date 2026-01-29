/**
 * 领域错误基类
 * 所有领域层错误都应继承此类
 */

export abstract class DomainError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, DomainError.prototype);
  }
}

/**
 * 验证错误
 */
export class ValidationError extends DomainError {
  readonly code = 'VALIDATION_ERROR';
  readonly statusCode = 400;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * 未找到错误
 */
export class NotFoundError extends DomainError {
  readonly code = 'NOT_FOUND';
  readonly statusCode = 404;

  constructor(resource: string, identifier?: string) {
    super(identifier ? `${resource} with id '${identifier}' not found` : `${resource} not found`);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * 权限错误
 */
export class PermissionError extends DomainError {
  readonly code = 'PERMISSION_DENIED';
  readonly statusCode = 403;

  constructor(message: string = 'Permission denied') {
    super(message);
    Object.setPrototypeOf(this, PermissionError.prototype);
  }
}

/**
 * 操作错误
 */
export class OperationError extends DomainError {
  readonly code = 'OPERATION_FAILED';
  readonly statusCode = 500;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, OperationError.prototype);
  }
}

/**
 * 重复错误
 */
export class DuplicateError extends DomainError {
  readonly code = 'DUPLICATE_ERROR';
  readonly statusCode = 409;

  constructor(resource: string) {
    super(`${resource} already exists`);
    Object.setPrototypeOf(this, DuplicateError.prototype);
  }
}
