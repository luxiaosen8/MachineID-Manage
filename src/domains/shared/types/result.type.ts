/**
 * Result 类型 - 函数式编程风格的结果封装
 * 用于处理操作成功或失败的情况，避免使用异常控制流程
 */

export class Result<T, E = Error> {
  private constructor(
    private readonly _isSuccess: boolean,
    private readonly _value?: T,
    private readonly _error?: E
  ) {}

  /**
   * 创建成功的结果
   */
  static success<T, E = Error>(value: T): Result<T, E> {
    return new Result<T, E>(true, value, undefined);
  }

  /**
   * 创建失败的结果
   */
  static failure<T, E = Error>(error: E): Result<T, E> {
    return new Result<T, E>(false, undefined, error);
  }

  /**
   * 检查是否成功
   */
  isSuccess(): boolean {
    return this._isSuccess;
  }

  /**
   * 检查是否失败
   */
  isFailure(): boolean {
    return !this._isSuccess;
  }

  /**
   * 获取成功值（失败时抛出错误）
   */
  getValue(): T {
    if (!this._isSuccess) {
      throw new Error('Cannot get value from a failed result');
    }
    return this._value as T;
  }

  /**
   * 获取错误（成功时抛出错误）
   */
  getError(): E {
    if (this._isSuccess) {
      throw new Error('Cannot get error from a successful result');
    }
    return this._error as E;
  }

  /**
   * 映射成功值
   */
  map<U>(fn: (value: T) => U): Result<U, E> {
    if (this._isSuccess) {
      return Result.success(fn(this._value as T));
    }
    return Result.failure(this._error as E);
  }

  /**
   * 扁平映射成功值
   */
  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    if (this._isSuccess) {
      return fn(this._value as T);
    }
    return Result.failure(this._error as E);
  }

  /**
   * 获取成功值或默认值
   */
  getOrElse(defaultValue: T): T {
    return this._isSuccess ? (this._value as T) : defaultValue;
  }

  /**
   * 获取成功值或执行函数
   */
  getOrElseFn(fn: (error: E) => T): T {
    return this._isSuccess ? (this._value as T) : fn(this._error as E);
  }
}

/**
 * 异步 Result 类型
 */
export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

/**
 * 尝试执行函数并包装为 Result
 */
export function tryCatch<T>(fn: () => T): Result<T, Error> {
  try {
    return Result.success(fn());
  } catch (error) {
    return Result.failure(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * 尝试执行异步函数并包装为 Result
 */
export async function tryCatchAsync<T>(fn: () => Promise<T>): AsyncResult<T, Error> {
  try {
    const value = await fn();
    return Result.success(value);
  } catch (error) {
    return Result.failure(error instanceof Error ? error : new Error(String(error)));
  }
}
