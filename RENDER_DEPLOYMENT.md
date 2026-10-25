# Hosting D&G E-Commerce Backend on Render

This guide outlines how to deploy the Node.js/Express backend API connected to Neon PostgreSQL on [Render](https://render.com/).

---

## Prerequisites
1. A free account on [Render](https://dashboard.render.com/).
2. Your Neon PostgreSQL database connection string (`DATABASE_URL`).
3. GitHub repository: [`clesanyirahabimana238-beep/DGE`](https://github.com/clesanyirahabimana238-beep/DGE).

---

## Deployment Option 1: 1-Click Render Blueprint (Recommended)

Because the project includes a `render.yaml` blueprint at the repository root, Render can automatically configure the service for you.

1. Go to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** (top right) and select **Blueprint**.
3. Connect your GitHub repository: `clesanyirahabimana238-beep/DGE`.
4. Render will parse `render.yaml`:
   - **Service Name:** `dgecommerce-api`
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/health`
5. Under **Environment Variables**:
   - `DATABASE_URL`: Paste your Neon connection string (e.g. `postgresql://...aws.neon.tech/neondb?sslmode=require`).
   - `JWT_SECRET`: Leave as auto-generated or paste your own 32+ character secret.
   - `NODE_ENV`: Automatically set to `production`.
6. Click **Apply**.
7. Render will build and deploy your API. Once finished, you will receive a public HTTPS URL (e.g., `https://dgecommerce-api.onrender.com`).

---

## Deployment Option 2: Manual Web Service Setup

If you prefer to configure manually on the Render dashboard:

1. In the Render Dashboard, click **New +** and select **Web Service**.
2. Select **Build and deploy from a Git repository** and connect `clesanyirahabimana238-beep/DGE`.
3. Fill in the service configuration:
   - **Name:** `dgecommerce-api` (or your preferred name)
   - **Region:** Choose the region closest to your Neon database (e.g., *Oregon (US West)* or *Frankfurt (EU Central)*)
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
4. Expand **Advanced** settings:
   - **Health Check Path:** `/health`
   - **Auto-Deploy:** `Yes`
5. Add the following **Environment Variables**:

| Variable Key | Recommended Value / Description |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Your Neon connection string: `postgresql://user:pass@ep-....aws.neon.tech/neondb?sslmode=require` |
| `JWT_SECRET` | A secure random string (e.g., generate a 32+ char secret) |

6. Click **Create Web Service**.

---

## Verifying Deployment

Once Render finishes deploying:

1. **Service Health Check:**
   Visit: `https://<YOUR-RENDER-URL>/health`
   Expected response:
   ```json
   {
     "status": "OK",
     "service": "D&G E-Commerce API",
     "environment": "production",
     "timestamp": "2026-10-25T15:45:00.000Z"
   }
   ```

2. **Database Connectivity Check:**
   Visit: `https://<YOUR-RENDER-URL>/health/db`
   Expected response:
   ```json
   {
     "status": "OK",
     "database": "connected",
     "serverTime": "2026-10-25T15:45:00.000Z"
   }
   ```

---

## Connecting the React Native Mobile App

Once your Render backend is live:

1. Open [`mobile/src/config/environment.js`](file:///mobile/src/config/environment.js).
2. Set your Render URL:
   ```javascript
   const PROD_API_URL = 'https://<YOUR-RENDER-SERVICE-NAME>.onrender.com';

   export const ENV = {
     IS_PRODUCTION: true, // Switch to true for production build
     API_BASE_URL: true ? PROD_API_URL : DEV_API_URL,
   };
   ```
3. The mobile application will now communicate directly with your hosted Render API over HTTPS from any Android or iOS device worldwide.
