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

// ----------------------------------------------------
// Invoicing & Payment Interfaces
// ----------------------------------------------------

export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  milestoneId?: string | null;
  description: string;
  amount: string | number;
  order: number;
  createdAt: string;
}

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface Payment {
  id: string;
  invoiceId: string;
  contractId: string;
  amount: string | number;
  currency: string;
  provider: string;
  transactionId: string;
  status: PaymentStatus;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  invoice?: {
    id: string;
    invoiceNumber: string;
    status: InvoiceStatus;
    total: string | number;
  };
  contract?: {
    id: string;
    project?: {
      title: string;
    };
    client?: {
      user: {
        firstName: string;
        lastName: string;
      };
    };
    freelancerProfile?: {
      user: {
        firstName: string;
        lastName: string;
      };
    };
  };
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  freelancerProfileId: string;
  projectId: string;
  contractId: string;
  milestoneId?: string | null;
  issueDate: string;
  dueDate: string;
  subtotal: string | number;
  tax: string | number;
  total: string | number;
  status: InvoiceStatus;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
  items?: InvoiceItem[];
  payments?: Payment[];
  client?: {
    id: string;
    companyName?: string | null;
    user?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      location?: string | null;
    };
  };
  freelancerProfile?: {
    id: string;
    title?: string | null;
    user?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      location?: string | null;
    };
  };
  project?: {
    id: string;
    title: string;
  };
  contract?: {
    id: string;
    status: ContractStatus;
    totalAmount: string | number;
  };
}

export interface FinancialMetrics {
  totalInvoices: number;
  paidCount: number;
  pendingCount: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
}

// ----------------------------------------------------
// Reviews & Dispute Interfaces
// ----------------------------------------------------

export interface Review {
  id: string;
  contractId: string;
  authorId: string;
  recipientId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
    role: UserRole;
  };
  recipient?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
    role: UserRole;
  };
  contract?: {
    id: string;
    project?: {
      id: string;
      title: string;
    };
  };
}

export type DisputeStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED';

export interface DisputeMessage {
  id: string;
  disputeId: string;
  senderId: string;
  message: string;
  attachments?: string[] | null;
  createdAt: string;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
    role: UserRole;
  };
}

export interface Dispute {
  id: string;
  contractId: string;
  initiatorId: string;
  reason: string;
  description: string;
  evidence?: string[] | null;
  status: DisputeStatus;
  adminDecision?: string | null;
  resolutionNotes?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  initiator?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    role: UserRole;
  };
  contract?: {
    id: string;
    project?: {
      id: string;
      title: string;
    };
    client?: {
      userId?: string;
      companyName?: string | null;
      user?: {
        id: string;
        firstName: string;
        lastName: string;
      };
    };
    freelancerProfile?: {
      userId?: string;
      user?: {
        id: string;
        firstName: string;
        lastName: string;
      };
    };
  };
  messages?: DisputeMessage[];
  _count?: {
    messages: number;
  };
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  details?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  } | null;
}

