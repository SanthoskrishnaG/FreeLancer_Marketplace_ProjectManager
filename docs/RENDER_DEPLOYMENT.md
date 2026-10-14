# WorkPulse AI — Render Production Deployment Guide

This guide details the end-to-end procedure for deploying **WorkPulse AI** (AI-Powered Freelancer Marketplace and Intelligent Project Management System) to **Render** using a decoupled 3-tier production architecture:

1. **Database**: Render PostgreSQL Database
2. **Backend**: Render Web Service (Node.js + Express + Prisma + Socket.IO)
3. **Frontend**: Render Static Site (React + Vite SPA)

---

## 1. Architecture Overview

```
                                  +------------------------------------+
                                  |         Render Static Site         |
                                  |      (workpulse-client)            |
                                  |       React.js + Vite SPA          |
                                  +-----------------+------------------+
                                                    |
                                HTTPS API Requests  |  WSS WebSocket
                           (VITE_API_URL)          |  (VITE_SOCKET_URL)
                                                    v
                                  +-----------------+------------------+
                                  |         Render Web Service         |
                                  |         (workpulse-api)            |
                                  |      Node.js + Express API         |
                                  +-----------------+------------------+
                                                    |
                                      Prisma TCP    |  Internal Network
                                      (Port 5432)   |  (DATABASE_URL)
                                                    v
                                  +-----------------+------------------+
                                  |      Render PostgreSQL Service     |
                                  |         (workpulse-db)             |
                                  |    PostgreSQL 16 + Auto-Backups    |
                                  +------------------------------------+
```

---

## 2. Prerequisites & GitHub Repository

- A Render account: [https://dashboard.render.com](https://dashboard.render.com)
- Your GitHub repository: `https://github.com/SanthoskrishnaG/FreeLancer_Marketplace_ProjectManager`
- Ensure all recent changes are pushed to branch `main`.

---

## 3. Step-by-Step Deployment Instructions

### Option A: 1-Click Render Blueprint Deployment (Recommended)

WorkPulse AI includes a production-ready `render.yaml` specification at the repository root.

1. Navigate to the **Render Dashboard** -> Click **New +** -> Select **Blueprint**.
2. Connect your GitHub repository: `FreeLancer_Marketplace_ProjectManager`.
3. Render will inspect `render.yaml` and provision:
   - `workpulse-db` (PostgreSQL Database)
   - `workpulse-api` (Web Service)
   - `workpulse-client` (Static Site with SPA rewrite rules)
4. Follow the prompt to fill in any sensitive external API keys (e.g., `GROQ_API_KEY`).
5. Click **Apply**.

---

### Option B: Manual Service-by-Service Deployment

If you prefer provisioning each service individually through the Render GUI, follow the steps below in order.

#### Step 1: Create the PostgreSQL Database

1. Click **New +** -> **PostgreSQL**.
2. Configure settings:
   - **Name**: `workpulse-db`
   - **Database**: `freelancer_marketplace`
   - **User**: `postgres`
   - **Region**: Choose closest to you (e.g., `Oregon`, `Frankfurt`, or `Singapore`).
   - **Instance Type**: `Free` (or higher).
3. Click **Create Database**.
4. Once created, copy the **Internal Database URL** (e.g., `postgresql://postgres:pass@dpg-xxx-a:5432/freelancer_marketplace`).
   > [!IMPORTANT]
   > Use the **Internal Database URL** for your backend Web Service. It communicates via Render's private high-speed network with no egress bandwidth fees.

#### Step 2: Deploy the Backend Web Service

1. Click **New +** -> **Web Service**.
2. Select your repository: `FreeLancer_Marketplace_ProjectManager`.
3. Configure the service settings:
   - **Name**: `workpulse-api`
   - **Region**: *Same region as your database*
   - **Branch**: `main`
   - **Root Directory**: `.` (leave as root)
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm install && npm run db:generate --workspace=server
     ```
   - **Start Command**:
     ```bash
     npm run start --workspace=server
     ```
   - **Plan**: `Free` (or higher).
4. Expand **Advanced** -> Configure the **Health Check Path**:
   - Path: `/api/health`
5. Under **Environment Variables**, configure:

| Variable | Recommended Value | Notes |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production optimizations & error masking |
| `PORT` | `5000` | Render assigns dynamically if omitted |
| `DATABASE_URL` | *Paste Internal Database URL* | From Step 1 |
| `CLIENT_URL` | `https://workpulse-client.onrender.com` | Update after creating frontend |
| `SERVER_URL` | `https://workpulse-api.onrender.com` | Your backend Render URL |
| `JWT_SECRET` | *Click "Generate"* | Minimum 32-character random string |
| `JWT_REFRESH_SECRET` | *Click "Generate"* | Minimum 32-character random string |
| `GROQ_API_KEY` | `gsk_...` | For AI milestone generation (Groq LPU) |
| `GROQ_MODEL` | `openai/gpt-oss-120b` | High-speed structured milestone model |
| `OPENAI_API_KEY` | *(Optional)* | Alternative AI fallback |
| `CLOUDINARY_CLOUD_NAME`| *(Optional)* | Cloudinary media upload cloud |
| `CLOUDINARY_API_KEY` | *(Optional)* | Cloudinary API Key |
| `CLOUDINARY_API_SECRET`| *(Optional)* | Cloudinary API Secret |
| `RAZORPAY_KEY_ID` | *(Optional)* | Escrow payment integration |
| `RAZORPAY_KEY_SECRET` | *(Optional)* | Escrow payment integration |
| `RESEND_API_KEY` | *(Optional)* | Email dispatch provider |

6. Click **Create Web Service**.

#### Step 3: Initialize Database Schema & Seed Data

Once the backend is building, you must push the Prisma database schema to the clean Render PostgreSQL database.

From the Render Dashboard:
1. Go to your `workpulse-api` service.
2. Click the **Shell** tab (opens remote terminal inside container).
3. Run the schema push command:
   ```bash
   npx prisma db push --schema=server/prisma/schema.prisma
   ```
4. *(Optional — Recommended for initial demo accounts)* Seed the 15 categories, 54 verified skills, and demo accounts:
   ```bash
   node server/prisma/seed.js
   ```

#### Step 4: Deploy the Frontend Static Site

1. Click **New +** -> **Static Site**.
2. Connect your repository: `FreeLancer_Marketplace_ProjectManager`.
3. Configure the settings:
   - **Name**: `workpulse-client`
   - **Branch**: `main`
   - **Root Directory**: `.` (leave as root)
   - **Build Command**:
     ```bash
     npm install && npm run build --workspace=client
     ```
   - **Publish Directory**:
     ```bash
     client/dist
     ```
4. Under **Environment Variables**, add:

| Variable | Value | Notes |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://workpulse-api.onrender.com/api` | Your backend URL from Step 2 with `/api` |
| `VITE_SOCKET_URL` | `https://workpulse-api.onrender.com` | Your backend URL from Step 2 without `/api` |

5. Under **Redirects / Rewrites**, add the React Router SPA rewrite rule:
   - **Type**: `Rewrite`
   - **Source**: `/*`
   - **Destination**: `/index.html`

6. Click **Create Static Site**.

#### Step 5: Sync CORS & Origin Verification

Once both services are deployed:
1. Copy your frontend Static Site URL (e.g., `https://workpulse-client.onrender.com`).
2. Go back to `workpulse-api` -> **Environment**.
3. Verify that `CLIENT_URL` matches your exact frontend URL **without** a trailing slash:
   ```env
   CLIENT_URL=https://workpulse-client.onrender.com
   ```
4. Save Changes (Render will trigger a zero-downtime redeploy of the backend).

---

## 4. Verification & Testing Checklist

Once deployment completes, test the live deployment:

- [ ] **Health Endpoint**: Visit `https://workpulse-api.onrender.com/api/health` -> Verify HTTP 200 response:
  ```json
  {
    "status": "healthy",
    "success": true,
    "message": "WorkPulse API and Database operational",
    "database": "connected"
  }
  ```
- [ ] **Landing Page**: Visit `https://workpulse-client.onrender.com` -> Verify `<WorkPulse/>` logo, network particle animation, and dark cybersecurity styling.
- [ ] **Theme Switching**: Click Sun/Moon icon in navbar -> Verify instant switch between dark and light themes without UI glitch.
- [ ] **Authentication**: Navigate to `/login` -> Click "Client Demo" chip -> Click "Authenticate & Enter Workspace".
- [ ] **Direct URL Refresh**: Navigate to `/client/dashboard` -> Press Ctrl+R (or Cmd+R) -> Verify the page reloads cleanly without 404 errors (verifying SPA rewrite rule).
- [ ] **AI Project Breakdown**: Navigate to `/client/projects/create` -> Enter requirements -> Click "Generate Phased Milestones with AI" -> Verify milestone breakdown.
- [ ] **Real-time WebSockets**: Navigate to `/client/messages` -> Verify WebSocket connection is established (`⚡ Connected to WorkPulse WebSocket cluster` in dev console).
- [ ] **Invoice PDF Download**: Navigate to `/client/invoices` -> Click PDF download -> Verify receipt downloads cleanly from the backend.

---

## 5. Free-Tier Considerations & Troubleshooting

### Free-Tier Cold Starts (Spin-down)
- Render Free Web Services sleep after 15 minutes of inactivity. The first incoming request will take ~30–50 seconds to spin up.
- The health probe (`/api/health`) will return HTTP 200 once active.

### CORS Errors
- If you see `CORS violation: Origin https://... is not allowed by WorkPulse security policy`:
  - Check that `CLIENT_URL` in the backend environment matches the exact frontend domain.
  - Do NOT include trailing slashes (e.g. `https://domain.onrender.com`, NOT `https://domain.onrender.com/`).

### Database Disconnected
- Verify that `DATABASE_URL` in the backend Web Service is set to the **Internal Database URL** of `workpulse-db`.
- Check backend deploy logs for `✅ Connected to PostgreSQL database via Prisma`.

### Django Admin Interface Note
- The optional Django administration service in `django-admin/` is decoupled from the main application. It is not required for the Node.js/Express + React architecture and does not need to be deployed to Render for WorkPulse AI to function fully.
