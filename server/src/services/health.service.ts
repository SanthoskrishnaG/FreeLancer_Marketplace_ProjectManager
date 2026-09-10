export interface HealthStatus {
  success: boolean;
  message: string;
}

export class HealthService {
  public static getHealthStatus(): HealthStatus {
    return {
      success: true,
      message: 'API is running',
    };
  }
}
