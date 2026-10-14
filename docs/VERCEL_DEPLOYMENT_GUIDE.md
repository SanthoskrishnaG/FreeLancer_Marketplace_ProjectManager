# WorkPulse AI — Vercel & Managed Database Deployment Guide

This guide provides the complete, step-by-step instructions to deploy **WorkPulse AI** using the production-grade hybrid architecture:
- **Frontend:** React + Vite on **Vercel** (Global Edge CDN, instant loading, automated CI/CD)
- **Database:** **Vercel Postgres** (powered by Neon Serverless PostgreSQL)
- **Backend:** Node.js + Express + Socket.IO on **Render / Railway** (Persistent WebSocket connections & real-time chat)

---

## 1. Architecture Overview

```text
[ Browser Clients ]
        │
        ├───> (HTTPS) ───> [ Vercel Edge Network ] ──> React + Vite SPA (client/)
        │
        └───> (HTTPS & WSS) ───> [ Render / Railway ] ──> Node.js Express + Socket.IO (server/)
                                        │
                                        └───> (TLS Prisma Pooled) ───> [ Vercel Postgres / Neon ]
```

### Why this architecture?
1. **Real-time WebSockets:** Socket.IO requires persistent HTTP upgrade/TCP connections. Vercel's serverless lambdas terminate after each request and cannot hold open WebSocket streams. Keeping the Express server on Render/Railway guarantees that real-time chat, notifications, and milestone updates work without drops.
2. **Global CDN Frontend:** Vercel serves the compiled React application directly from edge locations worldwide with sub-50ms latency.
3. **Managed Serverless PostgreSQL:** Vercel Postgres / Neon provides automated backups, connection pooling (PgBouncer), branching, and scaling.

---

## 2. Step 1: Create Your Vercel Postgres / Neon Database

Vercel provides native PostgreSQL storage powered by Neon.

1. Go to your **[Vercel Dashboard](https://vercel.com/dashboard)**.
2. Click on the **Storage** tab in the top navigation.
3. Click **Create Database** and select **Postgres** (or create a free database directly on **[Neon.tech](https://neon.tech)**).
4. Give your database a name (e.g., `workpulse-production-db`) and choose your primary region (e.g., `Washington, D.C. (iad1)` or `Frankfurt (fra1)`).
5. Once created, click on the **.env.local** or **Quickstart** tab to reveal your connection strings.
6. Copy the **`POSTGRES_PRISMA_URL`** (connection-pooled URL) or **`DATABASE_URL`**:
   ```bash
   # Example Neon / Vercel Postgres connection string:
   DATABASE_URL="postgresql://default:password@ep-cool-fog-123456-pooler.us-east-1.aws.neon.tech/verceldb?sslmode=require&pgbouncer=true"
   DIRECT_URL="postgresql://default:password@ep-cool-fog-123456.us-east-1.aws.neon.tech/verceldb?sslmode=require"
   ```

---

## 3. Step 2: Push Database Schema & Seed Data

From your local machine, apply your Prisma schema and seed initial sample data directly to your new Vercel Postgres database:

```bash
# From project root:
cd server

# 1. Generate Prisma Client
npx prisma generate

# 2. Push schema to Vercel Postgres
DATABASE_URL="<PASTE_YOUR_VERCEL_POSTGRES_DATABASE_URL>" npx prisma db push

# 3. Seed initial users, projects, and categories (optional)
DATABASE_URL="<PASTE_YOUR_VERCEL_POSTGRES_DATABASE_URL>" node prisma/seed.js
```

---

## 4. Step 3: Deploy the Backend to Render (or Railway)

Your repository is already pre-configured with `render.yaml` and a `Dockerfile`.

1. Go to your **[Render Dashboard](https://dashboard.render.com)** and click **New +** -> **Web Service**.
2. Connect your GitHub repository (`Freelancer_Marketplace_ProjectManager`).
3. Set the following settings:
   - **Name:** `workpulse-api`
   - **Root Directory:** `server`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npx prisma generate`
   - **Start Command:** `node src/server.js`
4. Add the following **Environment Variables** in Render:

| Variable | Value | Description |
|:---|:---|:---|
| `NODE_ENV` | `production` | Enables production optimizations & logging |
| `PORT` | `5000` | Port bound to `0.0.0.0` |
| `DATABASE_URL` | `<YOUR_VERCEL_POSTGRES_URL>` | Pooled connection string from Step 1 |
| `CLIENT_URL` | `https://your-workpulse.vercel.app` | Your Vercel frontend URL (CORS allowed) |
| `JWT_SECRET` | *(64-char random hex string)* | Token encryption secret |
| `JWT_REFRESH_SECRET`| *(64-char random hex string)* | Refresh token secret |
| `GROQ_API_KEY` | *(Your Groq API Key)* | AI milestone generation |
| `GROQ_MODEL` | `openai/gpt-oss-120b` | Groq LPU model |
| `CLOUDINARY_CLOUD_NAME`| *(Your Cloudinary Name)* | Cloudinary media upload |
| `CLOUDINARY_API_KEY` | *(Your Cloudinary Key)* | Cloudinary API Key |
| `CLOUDINARY_API_SECRET`| *(Your Cloudinary Secret)* | Cloudinary Secret |
| `RAZORPAY_KEY_ID` | `rzp_test_...` | Razorpay Key ID |
| `RAZORPAY_KEY_SECRET` | *(Your Razorpay Secret)* | Razorpay Secret |

5. Click **Create Web Service**.
6. When deployment completes, note your backend URL (e.g., `https://workpulse-api.onrender.com`).
7. Verify the backend health check in your browser:
   ```text
   https://workpulse-api.onrender.com/api/health
   ```
   It should return:
   ```json
   {
     "status": "healthy",
     "success": true,
     "message": "WorkPulse API and Database operational",
     "database": "connected"
   }
   ```

---

## 5. Step 4: Deploy the Frontend to Vercel

1. Go to your **[Vercel Dashboard](https://vercel.com/dashboard)**.
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository (`Freelancer_Marketplace_ProjectManager`).
4. Configure the **Project Settings**:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click **Edit** and select `client`
   - **Build Command:** `npm run build` (or leave default)
   - **Output Directory:** `dist`
5. Expand **Environment Variables** and add the following two variables:

| Variable | Value | Description |
|:---|:---|:---|
| `VITE_API_URL` | `https://workpulse-api.onrender.com/api` | Full backend API path with `/api` |
| `VITE_SOCKET_URL` | `https://workpulse-api.onrender.com` | Backend root URL for Socket.IO |

6. Click **Deploy**.
7. Vercel will build the frontend and provide your production URL (e.g., `https://workpulse-ai.vercel.app`).
8. Notice that client-side navigation (`/login`, `/dashboard`, `/projects`) is handled by the included [client/vercel.json](file:///c:/Users/Santhoskrishna/Documents/Freelancer_Marketplace_ProjectManager/client/vercel.json) rewrite rule:
   ```json
   {
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```

---

## 6. Step 5: Final Cross-Origin Sync

Once your Vercel deployment completes and you have your live domain (e.g. `https://workpulse-ai.vercel.app`):

1. Go to your **Render Dashboard** -> `workpulse-api` -> **Environment**.
2. Verify that `CLIENT_URL` includes your live Vercel domain:
   ```text
   CLIENT_URL=https://workpulse-ai.vercel.app
   ```
3. *Note:* Both `server/src/app.js` and `server/src/server.js` automatically permit any `*.vercel.app` domain by default, so Vercel preview branch deployments will work out-of-the-box!

---

## 7. Verification Checklist

- [ ] **Database Connection:** Vercel Postgres / Neon cluster created and populated via `npx prisma db push`.
- [ ] **Backend Health Check:** `https://your-backend.onrender.com/api/health` returns `status: "healthy"` and `database: "connected"`.
- [ ] **Frontend Loading:** `https://your-frontend.vercel.app` loads the WorkPulse landing page with styles and assets.
- [ ] **Client-Side Routing:** Direct navigation to `/login` and `/projects` resolves without 404 errors.
- [ ] **Authentication Flow:** User registration and login succeed against the remote database.
- [ ] **Real-time WebSockets:** Chat and notifications show green active connection icon.
