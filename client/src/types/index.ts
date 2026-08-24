export type UserRole = 'CLIENT' | 'FREELANCER' | 'ADMIN';

export interface ClientProfile {
  id: string;
  companyName?: string | null;
  companyWebsite?: string | null;
  description?: string | null;
  country?: string | null;
  totalSpent: string | number;
  rating: string | number;
  reviewCount: number;
}

export interface FreelancerProfile {
  id: string;
  title?: string | null;
  bio?: string | null;
  hourlyRate?: string | number | null;
  experienceYears?: number | null;
  country?: string | null;
  totalEarned: string | number;
  rating: string | number;
  reviewCount: number;
  isAvailable: boolean;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isVerified: boolean;
  avatarUrl?: string | null;
  phoneNumber?: string | null;
  createdAt: string;
  clientProfile?: ClientProfile | null;
  freelancerProfile?: FreelancerProfile | null;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface HealthResponse {
  success: boolean;
  message: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}
