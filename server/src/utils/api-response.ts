export interface ApiResponseOptions<T> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: Record<string, unknown>;
}

export class ApiResponse<T> {
  public readonly success: boolean;
  public readonly message?: string;
  public readonly data?: T;
  public readonly meta?: Record<string, unknown>;

  constructor(options: ApiResponseOptions<T>) {
    this.success = options.success;
    this.message = options.message;
    this.data = options.data;
    this.meta = options.meta;
  }

  static success<T>(data?: T, message = 'Success', meta?: Record<string, unknown>): ApiResponse<T> {
    return new ApiResponse({
      success: true,
      message,
      data,
      meta,
    });
  }

  static error<T = undefined>(message = 'Internal Server Error', data?: T): ApiResponse<T> {
    return new ApiResponse({
      success: false,
      message,
      data,
    });
  }
}
