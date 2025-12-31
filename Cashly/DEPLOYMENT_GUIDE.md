# Deployment Guide (Netlify + Vercel)

This guide walks you through deploying the **Cashly** frontend to Netlify and backend to Vercel.

## 1. Backend Deployment (Vercel)

We will deploy the `server` directory to Vercel.

### Steps:
1.  **Push your code to GitHub** (if you haven't already).
2.  Go to the [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..."** -> **"Project"**.
3.  Import your GitHub repository.
4.  **Configure Project:**
    *   **Root Directory:** Click "Edit" and select `Cashly/server` (or just `server` if that's where it is relative to repo root).
    *   **Environment Variables:** Add the following (copy values from your local `.env`):
        *   `SUPABASE_URL`
        *   `SUPABASE_KEY`
        *   `OPENAI_API_KEY`
        *   `GEMINI_API_KEY` (if used)
        *   `JWT_SECRET`
        *   `NODE_ENV` = `production`
        *   `CLIENT_URL` = (Your Netlify Frontend URL, e.g., `https://cashly.netlify.app`) - Used for password reset links.
5.  Click **Deploy**.
6.  Once deployed, copy the **Deployment Domain** (e.g., `https://cashly-server.vercel.app`). You will need this for the frontend.

**Note:** The code has been updated to support Vercel serverless functions automatically (`server.js` exports the app).

## 2. Frontend Deployment (Netlify)

We will deploy the `client` directory to Netlify.

### Steps:
1.  Go to the [Netlify Dashboard](https://app.netlify.com/).
2.  Click **"Add new site"** -> **"Import from an existing project"**.
3.  Select GitHub and choose your repository.
4.  **Configure Build Settings:**
    *   **Base directory:** `Cashly/client`
    *   **Build command:** `npm run build`
    *   **Publish directory:** `dist`
5.  **Environment Variables:**
    *   Click "Advanced" (or go to Site Settings -> Environment variables after creation).
    *   Add `VITE_API_URL` with the value of your **Vercel Backend URL** from Step 1 (e.g., `https://cashly-server.vercel.app/api`).
        *   *Important:* Make sure to include `/api` at the end if your axios setup expects it (which we updated to standard logic, but verifying the backend URL root is crucial). our logic: `baseURL: import.meta.env.VITE_API_URL || '/api'`. If you set `VITE_API_URL` to `https://.../api`, it works.
    *   Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as well.
6.  Click **Deploy Site**.

### Addressing Common Issues
*   **"Page Not Found" on Refresh:** We added a `public/_redirects` file and a `netlify.toml` to handle SPA routing. This ensures `/dashboard` works when refreshed.
*   **Dashboard Loading Issues:** If the dashboard hangs, check the Browser Console (F12). If you see CORS errors or 404s on API calls, ensure `VITE_API_URL` is set correctly in Netlify.

## 3. Trouble Shooting
*   **CORS:** The backend is currently configured to allow all origins (`origin: '*'`). This avoids CORS issues during initial setup.
*   **Database:** Ensure your Supabase database is accessible from anywhere (it is check cloud hosted).
