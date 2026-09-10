# Freelancer Marketplace - Architecture Guide

## Monorepo Architecture Overview

This project is organized as a clean, scalable monorepo separating concerns between client-side user interface and server-side business logic and APIs.

```
freelancer-marketplace/
├── client/          # Frontend application (React, Vite, Tailwind CSS, TypeScript)
├── server/          # Backend application (Express, TypeScript, Prisma ORM, PostgreSQL)
├── docs/            # Architecture documentation and guides
├── .gitignore       # Global ignore definitions
├── package.json     # Workspace management & orchestration scripts
└── README.md        # Getting started and setup guide
```

---

## 1. Frontend Architecture (`client/src/`)

The client follows a modular, feature-based and layer-based pattern:

- **`api/`**: Centralized API clients (e.g. Axios instances, interceptors, base API configuration).
- **`components/`**: Shared, reusable presentational UI elements (Buttons, Inputs, Cards, Modals, Navbar, Footer).
- **`features/`**: Domain-specific feature modules containing their own subcomponents, hooks, and state.
- **`hooks/`**: Custom, reusable React hooks for non-domain-specific state or browser abstractions.
- **`layouts/`**: Top-level page shells (e.g. `MainLayout`, `AuthLayout`, `DashboardLayout`).
- **`pages/`**: Routable page components mapped to React Router paths.
- **`services/`**: Frontend business logic, state orchestrators, and analytics/telemetry helpers.
- **`types/`**: Global TypeScript interfaces, type aliases, and DTO definitions.
- **`utils/`**: Helper utilities (date formatting, currency formatting, validation helpers, tailwind class mergers).
- **`App.tsx`**: Main application router and provider wrapping.

---

## 2. Backend Architecture (`server/src/`)

The backend follows a layered and modular architecture ensuring clean separation between HTTP handling, business logic, data persistence, and utilities:

- **`config/`**: Configuration loaders and environment variable validators.
- **`controllers/`**: HTTP request handlers that parse inputs, invoke services, and return standard API responses.
- **`middleware/`**: Express middleware (CORS, error handling, request logging, authentication guards, request validation).
- **`routes/`**: Express route definitions mapping HTTP verbs and paths to controllers.
- **`services/`**: Pure business logic layer decoupled from Express request/response objects.
- **`repositories/`**: Data access abstraction layer interacting with Prisma ORM / PostgreSQL.
- **`validators/`**: Request schema validation rules (e.g., using Zod).
- **`utils/`**: Helper functions, error classes (e.g., `ApiError`), standard response formatters (`ApiResponse`).
- **`modules/`**: High-cohesion modular domains grouping related routes, controllers, and services.
- **`app.ts`**: Express application factory configuring middlewares and routing.
- **`server.ts`**: Entry point handling network port binding and graceful lifecycle shutdowns.

---

## 3. Database Layer (`server/prisma/`)

- **ORM**: Prisma ORM with PostgreSQL provider.
- **`schema.prisma`**: Schema definition for models, relations, migrations, and database generators.
