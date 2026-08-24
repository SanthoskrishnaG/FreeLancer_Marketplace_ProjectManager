import { Request, Response } from 'express';
import { HealthService } from '../services/health.service.js';

export class HealthController {
  public static getHealth(_req: Request, res: Response): void {
    const status = HealthService.getHealthStatus();
    res.status(200).json(status);
  }
}
