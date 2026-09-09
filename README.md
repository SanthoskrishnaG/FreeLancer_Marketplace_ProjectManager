# WorkPulse AI — Production-Grade AI Freelancer Marketplace

> An enterprise-ready, full-stack **AI-Powered Freelancer Marketplace and Project Management Platform** featuring:
> - **React.js + Vite** frontend (100% Pure JavaScript / JSX).
> - **Node.js + Express.js** primary application backend (100% Pure JavaScript ES Modules).
> - **PostgreSQL** external database managed via **Prisma ORM**.
> - **Django Admin** separate internal administration interface sharing the same PostgreSQL database.
> - **OpenAI GPT-4o** automated requirement analysis and milestone decomposition.
> - **Socket.IO** real-time messaging, typing indicators, and notifications.
> - **Interactive Stopwatch** time tracking and automated PDF invoicing.

---

## 🏛️ System Architecture

```mermaid
graph TD
    ClientApp["Client Application (React.js + Vite)"] -->|REST API & JWT| ExpressAPI["Express.js Primary Backend"]
    ClientApp <-->|WebSockets| SocketServer["Socket.IO Realtime Engine"]
    
    ExpressAPI -->|Prisma ORM| PostgresDB[("PostgreSQL Database (Neon / Supabase / Local)")]
    ExpressAPI -->|Scoping & Milestones| OpenAI["OpenAI API (GPT-4o)"]
    ExpressAPI -->|Media Storage| Cloudinary["Cloudinary Storage"]
    ExpressAPI -->|Payment Gateway| Razorpay["Razorpay / Mock Escrow"]
    ExpressAPI -->|Transacational Mail| Resend["Resend / Dev Email"]
    
    subgraph Internal Governance
        DjangoPortal["Django Admin Portal (Python 3.11)"] -->|psycopg2 / Django ORM| PostgresDB
    end
```

### Shared Database Architecture
Both **Node.js/Express (via Prisma ORM)** and **Django Admin (via Django ORM)** connect to the exact same PostgreSQL database instance. Django's models specify `managed = False` and map directly to Prisma's table names (`db_table = 'User'`, `db_table = 'Project'`, etc.). This ensures that:
1. Express remains the high-throughput, primary application backend for clients and freelancers.
2. Django provides an internal administrative interface for audit compliance, dispute arbitration, and data governance without duplicating business APIs.

---

## 🚨 Technology Stack Adherence

* **Frontend**: React.js, Vite, JavaScript, JSX, React Router v6, Tailwind CSS, Recharts, Lucide React, Axios, TanStack Query, React Hook Form, Zod.
* **Backend**: Node.js, Express.js, JavaScript (ES Modules), Prisma ORM, Socket.IO, PDFKit, Bcrypt, JsonWebToken.
* **Internal Admin**: Python, Django, Django Admin.
* **Database**: PostgreSQL with 28 relational models, UUID primary keys, and indexes.
* **Zero TypeScript Guarantee**: 0 `.ts` files, 0 `.tsx` files, and 0 `tsconfig.json` files in the React and Node applications.

---

## 🚀 Key Features

### 1. AI Requirement Scoping & Milestone Decomposition
- Input unstructured project descriptions (e.g. *"Build an AI-powered tele-health platform with doctor appointments, WebRTC video calling, and billing"*).
- The AI Engine (GPT-4o with deterministic procedural fallback) analyzes requirements and predicts:
  - Project complexity and category
  - Required engineering skills and tech stack
  - Milestone schedule with deliverables, budget percentages, durations, and acceptance criteria.
- Clients can edit milestones, reorder phases, adjust escrow amounts, and add/remove deliverables before publishing.

### 2. Smart Escrow & Contracts
- Acceptance of a freelancer's proposal triggers an atomic PostgreSQL transaction that initializes a contract and locks milestone funds in escrow.
- Freelancers submit deliverables with walkthrough notes and repository links.
- Clients review submissions and can either **Approve & Release Escrow Payment** or **Request Revisions** with specific feedback.

### 3. Real-Time Dashboards & Analytics
- **Client Dashboard**: Spending over time charts, active project management, pending milestone approvals, and contract progress.
- **Freelancer Dashboard**: Monthly earnings breakdown, proposal success rate, active contracts, and active deliverables queue.
- **Admin Governance Console**: 10 enterprise KPIs (GMV, platform revenue, users, disputes), user suspension with mandatory reasons, freelancer verification badges, and dispute arbitration with escrow refund or release.
- **Interactive Stopwatch Timer**: Digital stopwatch (`HH : MM : SS`) with live database synchronization and manual entry logging.

### 4. Direct Messaging & Notifications
- Socket.IO WebSockets provide real-time messaging, online/offline presence dots, typing indicators, and instant bell alerts.

### 5. Invoicing & PDF Downloads
- Automatic invoice generation upon milestone clearance with downloadable PDF statements.

---

## 🔑 Default Credentials

All pre-seeded demo accounts share the password: **`Password123!`**

| Persona | Email | Role | Accessible Portals |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@marketplace.com` | `ADMIN` | `/admin` (React Console) & `http://localhost:8000/admin` (Django Admin) |
| **Enterprise Client** | `client1@marketplace.com` | `CLIENT` | `/client/dashboard`, `/projects`, `/client/projects/create` |
| **Verified Freelancer** | `freelancer1@marketplace.com` | `FREELANCER` | `/freelancer/dashboard`, `/freelancer/time-tracking`, `/projects` |

---

## 📁 Project Structure

```
Freelancer_Marketplace_ProjectManager/
├── package.json              # Root npm workspaces configuration
├── docker-compose.yml        # Orchestration for PostgreSQL, Server, Client, Django
├── .gitignore
│
├── client/                   # React.js + Vite + Tailwind CSS (100% Pure JS/JSX)
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── App.jsx           # Master route definitions
│       ├── main.jsx          # React 18 DOM mount
│       ├── api/              # Axios modules with auto JWT interceptors
│       ├── context/          # AuthContext & SocketContext
│       ├── components/       # MetricCard, ChartCard, DataTable, Modal, Badge, Skeleton
│       └── pages/            # Public, Client, Freelancer, and Admin views
│
├── server/                   # Node.js + Express.js + Prisma (100% Pure JS)
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma     # 28 relational PostgreSQL models
│   │   └── seed.js           # Synthetic development seed script
│   └── src/
│       ├── app.js            # Express app with Helmet, CORS, Swagger
│       ├── server.js         # HTTP + Socket.IO server entrypoint
│       ├── config/           # Database, Swagger (/api/docs), Environment
│       ├── controllers/      # 14 REST API controllers
│       ├── middleware/       # Auth, upload, rate limiting, error handlers
│       ├── routes/           # REST endpoints (/api/*)
│       ├── services/         # Business logic, AI engine, payment providers
│       ├── socket/           # WebSocket real-time event handlers
│       └── tests/            # Vitest unit test suite
│
└── django-admin/             # Python + Django Admin Interface
    ├── manage.py
    ├── requirements.txt
    ├── Dockerfile
    ├── core/                 # Django settings, URLs, WSGI
    └── marketplace_admin/    # Unmanaged models & rich Admin configurations
```

---

## 🛠️ Local Installation & Development

### 1. Install Node Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
```bash
cp server/.env.example server/.env
```
Ensure your `DATABASE_URL` in `server/.env` points to your PostgreSQL instance:
```env
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/freelancer_marketplace?schema=public"
JWT_SECRET="supersecret_jwt_key_for_development_purposes_only"
JWT_REFRESH_SECRET="supersecret_refresh_jwt_key_for_development_purposes_only"
PORT=5000
CLIENT_URL="http://localhost:5173"
NODE_ENV=development
```

### 3. Generate Prisma Client & Run Seed Data
```bash
# Generate Prisma Client
npm run db:generate --workspace=server

# Seed development database (1 admin, 10 clients, 20 freelancers, 30+ projects)
npm run db:seed --workspace=server
```

### 4. Start Development Servers

* **Start React Frontend & Express Backend**:
  ```bash
  npm run dev
  ```
  - **Frontend Client**: `http://localhost:5173`
  - **Express API**: `http://localhost:5000/api`
  - **Swagger API Docs**: `http://localhost:5000/api/docs`

* **Start Django Admin (Optional / Separate Terminal)**:
  ```bash
  cd django-admin
  pip install -r requirements.txt
  python manage.py runserver 8000
  ```
  - **Django Admin Interface**: `http://localhost:8000/admin`

---

## 🧪 Testing

Run backend unit tests with Vitest:
```bash
npm test --workspace=server
```

Verify zero TypeScript files in the React and Node application:
```powershell
Get-ChildItem -Path client, server -Recurse -Include *.ts, *.tsx, tsconfig*
# Output: 0 files found.
```

---

## 🐳 Docker Deployment

Launch all four containers (PostgreSQL, Express Backend, React Frontend, and Django Admin) simultaneously:
```bash
docker-compose up --build
```
- **React Client**: `http://localhost:5173`
- **Express API & Swagger**: `http://localhost:5000/api/docs`
- **Django Admin**: `http://localhost:8000/admin`
