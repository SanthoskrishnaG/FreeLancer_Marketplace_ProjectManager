export type UserRole = 'CLIENT' | 'FREELANCER' | 'ADMIN';
export type ExperienceLevel = 'ENTRY' | 'INTERMEDIATE' | 'EXPERT';
export type ProjectStatus =
  'DRAFT' | 'PUBLISHED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED' | 'ARCHIVED';

export type ProposalStatus = 'PENDING' | 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  _count?: {
    projects: number;
  };
}

export interface Skill {
  id: string;
  name: string;
  slug: string;
  categoryId?: string | null;
}

export interface PortfolioItem {
  title: string;
  description?: string;
  url?: string;
  imageUrl?: string;
}

export interface FreelancerSkill {
  id: string;
  skillId: string;
  proficiency?: string | null;
  skill: Skill;
}

export interface ClientProfile {
  id: string;
  companyName?: string | null;
  companyWebsite?: string | null;
  logoUrl?: string | null;
  description?: string | null;
  industry?: string | null;
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
  experienceLevel: ExperienceLevel;
  country?: string | null;
  languages: string[];
  portfolio?: PortfolioItem[] | null;
  totalEarned: string | number;
  rating: string | number;
  reviewCount: number;
  isAvailable: boolean;
  skills?: FreelancerSkill[];
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
    location?: string | null;
    createdAt?: string;
  };
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
  location?: string | null;
  createdAt: string;
  clientProfile?: ClientProfile | null;
  freelancerProfile?: FreelancerProfile | null;
}

export interface Milestone {
  id: string;
  projectId?: string | null;
  title: string;
  description?: string | null;
  deliverables: string[];
  estimatedDuration?: string | null;
  budgetPercentage?: number | string | null;
  dependencies: string[];
  acceptanceCriteria: string[];
  order: number;
  amount: string | number;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'RELEASED' | 'CANCELLED';
  dueDate?: string | null;
}

export interface ProposalMilestonePricing {
  title: string;
  amount: number;
  duration?: string;
}

export interface Proposal {
  id: string;
  projectId: string;
  freelancerProfileId: string;
  coverLetter: string;
  bidAmount: string | number;
  estimatedDuration?: string | null;
  milestonePricing?: ProposalMilestonePricing[] | null;
  attachments?: Array<{ name: string; url: string; size?: number }> | null;
  status: ProposalStatus;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: string;
    title: string;
    budget: string | number;
    budgetType: 'FIXED' | 'HOURLY';
    status: ProjectStatus;
    category?: Category | null;
    skills?: Array<{ skill: Skill }>;
    client?: {
      id: string;
      companyName?: string | null;
      user: {
        id: string;
        firstName: string;
        lastName: string;
        avatarUrl?: string | null;
        location?: string | null;
      };
    };
  };
  freelancerProfile?: FreelancerProfile;
}

export interface ProjectSkill {
  id: string;
  skillId: string;
  skill: Skill;
}

export interface Project {
  id: string;
  clientId: string;
  categoryId?: string | null;
  category?: Category | null;
  title: string;
  description: string;
  requirements?: string | null;
  budget: string | number;
  minBudget?: string | number | null;
  maxBudget?: string | number | null;
  budgetType: 'FIXED' | 'HOURLY';
  experienceLevel: ExperienceLevel;
  status: ProjectStatus;
  deadline?: string | null;
  attachments?: Array<{ name: string; url: string; size?: number }> | null;
  proposalCount: number;
  skills: ProjectSkill[];
  milestones?: Milestone[];
  client: {
    id: string;
    companyName?: string | null;
    rating?: string | number;
    totalSpent?: string | number;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      avatarUrl?: string | null;
      location?: string | null;
    };
  };
  isBookmarked?: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    proposals: number;
    milestones: number;
  };
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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
