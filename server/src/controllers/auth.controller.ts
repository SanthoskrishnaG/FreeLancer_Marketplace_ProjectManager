import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { envConfig } from '../config/env.config.js';
import { ApiResponse } from '../utils/api-response.js';
import { ApiError } from '../utils/api-error.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: envConfig.isProduction,
  sameSite: (envConfig.isProduction ? 'strict' : 'lax') as 'strict' | 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export class AuthController {
  public static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, accessToken, refreshToken } = await AuthService.register(req.body);

      res.cookie(envConfig.jwt.cookieName, refreshToken, COOKIE_OPTIONS);

      res.status(201).json(
        ApiResponse.success(
          {
            user,
            accessToken,
          },
          'Account created successfully'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  public static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, accessToken, refreshToken } = await AuthService.login(req.body);

      res.cookie(envConfig.jwt.cookieName, refreshToken, COOKIE_OPTIONS);

      res.status(200).json(
        ApiResponse.success(
          {
            user,
            accessToken,
          },
          'Logged in successfully'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  public static async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.cookies?.[envConfig.jwt.cookieName] || req.body?.refreshToken;

      if (!token) {
        throw ApiError.unauthorized('Refresh token is required');
      }

      const { accessToken, refreshToken } = await AuthService.refresh(token);

      res.cookie(envConfig.jwt.cookieName, refreshToken, COOKIE_OPTIONS);

      res.status(200).json(
        ApiResponse.success(
          {
            accessToken,
          },
          'Token refreshed successfully'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  public static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user) {
        await AuthService.logout(req.user.userId);
      }

      res.clearCookie(envConfig.jwt.cookieName, COOKIE_OPTIONS);

      res.status(200).json(ApiResponse.success(null, 'Logged out successfully'));
    } catch (error) {
      next(error);
    }
  }

  public static async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw ApiError.unauthorized('Authentication required');
      }

      const user = await AuthService.getMe(req.user.userId);
      res.status(200).json(ApiResponse.success({ user }, 'Current user retrieved'));
    } catch (error) {
      next(error);
    }
  }

  public static async forgotPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await AuthService.forgotPassword(req.body.email);

      res.status(200).json(
        ApiResponse.success(
          envConfig.isDevelopment ? { resetToken: result.resetToken } : null,
          'If an account exists with this email, password reset instructions have been dispatched.'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  public static async resetPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await AuthService.resetPassword(req.body);

      res
        .status(200)
        .json(
          ApiResponse.success(
            null,
            'Password has been reset successfully. You can now log in with your new password.'
          )
        );
    } catch (error) {
      next(error);
    }
  }
}
