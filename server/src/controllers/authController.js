import { AuthService } from '../services/authService.js';
import { ApiResponse } from '../utils/api-response.js';

export class AuthController {
  static async register(req, res, next) {
    try {
      const result = await AuthService.register(req.body);
      return ApiResponse.created(res, result, 'User registered successfully');
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const result = await AuthService.login(req.body);
      return ApiResponse.success(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  static async logout(req, res, next) {
    try {
      if (req.user?.id) {
        await AuthService.logout(req.user.id);
      }
      return ApiResponse.success(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const result = await AuthService.refreshToken(refreshToken);
      return ApiResponse.success(res, result, 'Token refreshed successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req, res, next) {
    try {
      const user = await AuthService.getProfile(req.user.id);
      return ApiResponse.success(res, { ...user, user }, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const updated = await AuthService.updateProfile(req.user.id, req.body);
      return ApiResponse.success(res, updated, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getFreelancers(req, res, next) {
    try {
      const result = await AuthService.getFreelancers(req.query);
      return ApiResponse.success(res, result, 'Freelancers retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getFreelancerById(req, res, next) {
    try {
      const freelancer = await AuthService.getFreelancerById(req.params.id);
      return ApiResponse.success(res, freelancer, 'Freelancer details retrieved');
    } catch (error) {
      next(error);
    }
  }
}
