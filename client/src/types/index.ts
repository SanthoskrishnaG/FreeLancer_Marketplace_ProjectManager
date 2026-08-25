export type UserRole = 'CLIENT' | 'FREELANCER' | 'ADMIN';
export type ExperienceLevel = 'ENTRY' | 'INTERMEDIATE' | 'EXPERT';
export type ProjectStatus =
  'DRAFT' | 'PUBLISHED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED' | 'ARCHIVED';

export type ProposalStatus = 'PENDING' | 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';

export type MilestoneStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'REVISION_REQUESTED'
  | 'APPROVED'
  | 'COMPLETED';

export type ContractStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';

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

export interface FileItem {
  id: string;
  originalName: string;
  storageKey: string;
  url: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export interface MilestoneSubmission {
  id: string;
  milestoneId: string;
  freelancerProfileId: string;
  description: string;
  notes?: string | null;
  links: string[];
  files?: FileItem[];
  submittedAt: string;
  freelancerProfile?: {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      avatarUrl?: string | null;
    };
  };
}

export interface MilestoneRevision {
  id: string;
  milestoneId: string;
  clientId: string;
  submissionId?: string | null;
  feedback: string;
  requestedChanges: string[];
  dueDate?: string | null;
  createdAt: string;
}

export interface Milestone {
  id: string;
  projectId?: string | null;
  contractId?: string | null;
  title: string;
  description?: string | null;
  deliverables: string[];
  estimatedDuration?: string | null;
  budgetPercentage?: number | string | null;
  dependencies: string[];
  acceptanceCriteria: string[];
  order: number;
  amount: string | number;
  status: MilestoneStatus;
  dueDate?: string | null;
  submissions?: MilestoneSubmission[];
  revisions?: MilestoneRevision[];
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

export interface Contract {
  id: string;
  projectId: string;
  proposalId?: string | null;
  clientId: string;
  freelancerProfileId: string;
  status: ContractStatus;
  totalAmount: string | number;
  startDate: string;
  endDate?: string | null;
  terms?: string | null;
  createdAt: string;
  updatedAt: string;
  totalMilestones?: number;
  completedMilestones?: number;
  progressPercentage?: number;
  project?: {
    id: string;
    title: string;
    status: ProjectStatus;
    category?: Category | null;
  };
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
  freelancerProfile?: {
    id: string;
    title?: string | null;
    hourlyRate?: string | number | null;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      avatarUrl?: string | null;
      location?: string | null;
    };
    skills?: FreelancerSkill[];
  };
  milestones?: Milestone[];
  conversation?: {
    id: string;
  } | null;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
  };
  files?: FileItem[];
}

export interface Conversation {
  id: string;
  contractId?: string | null;
  projectId?: string | null;
  updatedAt: string;
  isUnread?: boolean;
  partner?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
    role: UserRole;
  };
  lastMessage?: Message | null;
  contract?: {
    id: string;
    status: ContractStatus;
    project: {
      id: string;
      title: string;
    };
  } | null;
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
