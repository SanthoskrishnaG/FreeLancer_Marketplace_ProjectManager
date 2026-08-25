# 🚀 Freelancer Marketplace & Project Manager

A modern, scalable monorepo application for managing freelance talent, contracts, escrow milestones, and project delivery.

---

## 🏗️ Project Architecture (Phase 1 & Phase 2)

```
Freelancer_Marketplace_ProjectManager/
├── docs/                       # Architecture & API documentation
│   └── architecture.md
├── client/                     # Frontend Application (React 18 + Vite + TS + Tailwind + Router)
│   ├── src/
│   │   ├── api/                # API client with token interceptors & refresh rotation
│   │   ├── components/         # Shared UI components (Navbar, Footer, HealthBadge, ProtectedRoute)
│   │   ├── context/            # AuthContext & useAuth state manager
│   │   ├── features/           # Domain feature slices
│   │   ├── hooks/              # Custom React hooks (useHealthCheck)
│   │   ├── layouts/            # Page layouts (MainLayout)
│   │   ├── pages/              # Routed pages (Landing, Login, Register, Forgot/Reset Password, Dashboard, 404)
│   │   ├── services/           # Service layer
│   │   ├── types/              # TypeScript interface & type definitions
│   │   ├── utils/              # Tailwind class merger & helper utilities
│   │   ├── App.tsx             # Root router & layout container
│   │   ├── main.tsx            # React DOM mounting
│   │   └── index.css           # Global Tailwind CSS styles
│   ├── .env.example            # Client environment template
│   ├── eslint.config.mjs       # ESLint 9 configuration
│   ├── package.json            # Client dependencies & scripts
│   ├── tailwind.config.js      # Tailwind CSS design system config
│   ├── tsconfig.json           # Frontend TypeScript configuration
│   └── vite.config.ts          # Vite build & dev server config
├── server/                     # Backend Application (Node.js + Express + TypeScript + Prisma)
│   ├── prisma/
│   │   ├── schema.prisma       # 18 PostgreSQL Prisma ORM relational models & enums
│   │   └── seed.ts             # Comprehensive database seed script
│   ├── src/
│   │   ├── __tests__/          # Automated authentication & health test suite (Vitest)
│   │   ├── config/             # Environment, JWT & Prisma client setup
│   │   ├── controllers/        # Health and Auth API controllers
│   │   ├── middleware/         # Logging, error handling, 404, requireAuth & requireRole RBAC
│   │   ├── modules/            # Modular domain modules
│   │   ├── repositories/       # Prisma data-access abstractions (UserRepository)
│   │   ├── routes/             # Express API routing (/api/health, /api/auth)
│   │   ├── services/           # Business logic layer (AuthService, HealthService)
│   │   ├── utils/              # ApiError, ApiResponse, Logger, JWT, Password & Token utilities
│   │   ├── validators/         # Zod schema validators (Register, Login, Password Reset)
│   │   ├── app.ts              # Express application factory with cookie-parser & cors
│   │   └── server.ts           # Server bootstrap & graceful shutdown
│   ├── .env.example            # Server environment template
│   ├── eslint.config.mjs       # ESLint 9 configuration
│   ├── package.json            # Server dependencies & scripts
│   └── tsconfig.json           # Backend TypeScript configuration
├── .gitignore                  # Global Git ignore rules
├── .prettierrc                 # Code formatting rules
├── package.json                # Root workspaces & orchestration
└── README.md                   # Project documentation
```

---

## 🛠️ Tech Stack

### Frontend

- **React 18** + **TypeScript**
- **Vite** for fast HMR and optimized builds
- **Tailwind CSS** for responsive design system
- **React Router v7** for client-side routing & protected routes
- **Lucide React** for modern UI icons
- **Axios** with automatic 401 refresh token interceptor

### Backend

- **Node.js** + **Express** + **TypeScript**
- **PostgreSQL** + **Prisma ORM** (18 relational models, UUIDs, enums, indexes)
- **bcryptjs** for secure password hashing
- **jsonwebtoken (JWT)** access + refresh token rotation + HTTP-only cookies
- **Zod** for strict request validation
- **Vitest & Supertest** for automated security & auth test suite

---

## 🐘 PostgreSQL Database Setup

### 1. Configure Environment Variables

Create `server/.env` with your PostgreSQL connection string and JWT secrets:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# PostgreSQL Connection String
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/freelancer_marketplace?schema=public"

# JWT Secrets
JWT_ACCESS_SECRET="your_strong_access_jwt_secret_key"
JWT_REFRESH_SECRET="your_strong_refresh_jwt_secret_key"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
```

### 2. Run Prisma Migrations

Apply the database schema to your PostgreSQL instance:

```bash
npm run prisma:migrate --workspace=server
```

Or push directly to database:

```bash
npx prisma db push --schema=server/prisma/schema.prisma
```

### 3. Seed Sample Data

Populate the database with sample admin, clients, freelancers, categories, skills, and projects:

```bash
npm run prisma:seed --workspace=server
```

#### Seeded Demo Accounts (Password: `Password123!`)

- **Admin**: `admin@freelancermarket.com`
- **Client 1**: `alex.rivers@techcorp.io`
- **Client 2**: `sarah.chen@innovatestudio.co`
- **Freelancer 1**: `marcus.vance@devpro.com`
- **Freelancer 2**: `elena.rostova@designcraft.io`

---

## 🔐 Authentication Endpoints

| Method | Endpoint                    | Protection    | Description                                                                   |
| ------ | --------------------------- | ------------- | ----------------------------------------------------------------------------- |
| `GET`  | `/api/health`               | Public        | Server health status                                                          |
| `POST` | `/api/auth/register`        | Public        | Register client or freelancer account                                         |
| `POST` | `/api/auth/login`           | Public        | Log in with credentials, returns access token + sets HTTP-only refresh cookie |
| `POST` | `/api/auth/refresh`         | Public        | Rotate refresh token & issue new access token                                 |
| `POST` | `/api/auth/forgot-password` | Public        | Request password reset instructions / token                                   |
| `POST` | `/api/auth/reset-password`  | Public        | Set new password with valid token                                             |
| `GET`  | `/api/auth/me`              | `requireAuth` | Get current authenticated user and profile                                    |
| `POST` | `/api/auth/logout`          | `requireAuth` | Invalidate refresh token & clear cookies                                      |

### Storage & File Management Configuration

The backend includes a storage abstraction supporting local disk storage and cloud storage providers (S3/Cloudinary):

```env
# File Storage Configuration
UPLOAD_DIR="./uploads"              # Local storage directory
MAX_FILE_SIZE_MB=15                 # Maximum allowed upload size (MB)
ALLOWED_MIME_TYPES="image/*,application/pdf,application/zip,application/msword,text/*"

# Cloud Storage Integration (Optional)
# CLOUDINARY_CLOUD_NAME=your_cloud_name
# CLOUDINARY_API_KEY=your_api_key
# CLOUDINARY_API_SECRET=your_api_secret
# AWS_S3_BUCKET=your_bucket
# AWS_ACCESS_KEY_ID=your_key
# AWS_SECRET_ACCESS_KEY=your_secret
```

### Real-Time Socket.IO Messaging

Socket.IO is configured on the primary HTTP server port (`5000` by default):

- **Authentication**: JWT access token in WebSocket connection handshake.
- **Presence & State**: Real-time online/offline presence broadcast and typing indicators.
- **Channels**: Auto-joined rooms per user (`user:${userId}`) and per conversation (`conversation:${conversationId}`).

---

## 💻 Running The Application

### Option A: Run Both Client & Server Concurrently

```bash
npm run dev
```

### Option B: Run Individually

**Backend Server:**

```bash
npm run dev:server
```

- Server runs on: `http://localhost:5000`
- Health check API: `http://localhost:5000/api/health`

**Frontend Client:**

```bash
npm run dev:client
```

- Client runs on: `http://localhost:5173`

---

## 🧪 Testing & Verification

### Run Automated Security & Auth Test Suite

```bash
npm run test --workspace=server
```

### Type Checking & Build

```bash
# Frontend
npm run build --workspace=client

# Backend
npm run build --workspace=server
```

### Linting & Formatting

```bash
npm run lint
npm run format
```
