# 🚀 Cashly Deployment Guide

Deploy Cashly with **Frontend on Vercel** and **Backend on Render**.

---

## 📋 Pre-Deployment Checklist

- [ ] Your code is pushed to GitHub
- [ ] MongoDB Atlas cluster is set up
- [ ] OpenRouter API key is ready

---

## 🖥️ Step 1: Deploy Backend to Render

### 1.1 Create Render Account
1. Go to [render.com](https://render.com) and sign up
2. Connect your GitHub account

### 1.2 Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repo: `2006-2006/cashly`
3. Configure the service:

| Setting | Value |
|---------|-------|
| **Name** | `cashly-api` |
| **Region** | Choose closest to you |
| **Branch** | `main` |
| **Root Directory** | `server` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | Free |

### 1.3 Add Environment Variables
In Render Dashboard → Your service → **Environment** → Add these:

```
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster.mongodb.net/cashly?retryWrites=true&w=majority

JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters

OPENROUTER_API_KEY=sk-or-v1-your-openrouter-key

FRONTEND_URL=https://cashly.vercel.app

PORT=5000
```

### 1.4 Deploy
1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Note your backend URL: `https://cashly-api.onrender.com`

### 1.5 Verify Backend
Visit: `https://your-backend.onrender.com/health`
Should return: `{"status":"ok"}`

---

## 🌐 Step 2: Deploy Frontend to Vercel

### 2.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com) and sign up
2. Connect your GitHub account

### 2.2 Import Project
1. Click **"Add New..."** → **"Project"**
2. Select your repo: `cashly`
3. Configure:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `client` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

### 2.3 Add Environment Variables
Click **"Environment Variables"** and add:

```
VITE_API_URL=https://cashly-api.onrender.com/api
```

⚠️ **IMPORTANT**: Replace `cashly-api.onrender.com` with YOUR actual Render URL!

### 2.4 Deploy
1. Click **"Deploy"**
2. Wait for build (2-3 minutes)
3. Your app is live! 🎉

---

## 🔧 Post-Deployment

### Update Render FRONTEND_URL
After Vercel deploys, update Render environment variable:
```
FRONTEND_URL=https://your-actual-vercel-url.vercel.app
```

### Test Everything
1. ✅ Visit your Vercel URL
2. ✅ Try logging in / registering
3. ✅ Upload some data
4. ✅ Test AI Chat
5. ✅ Check Dashboard

---

## 🐛 Troubleshooting

### CORS Errors
If you see CORS errors in console:
1. Check `FRONTEND_URL` in Render matches your Vercel URL exactly
2. Redeploy the backend after changing environment variables

### API Not Responding
1. Check Render logs for errors
2. Verify `MONGO_URI` is correct
3. Free Render services sleep after 15 min inactivity (first request may take 30 seconds)

### Build Failures
1. Check build logs for specific errors
2. Make sure all dependencies are in package.json
3. Ensure no TypeScript errors

### MongoDB Connection
1. In MongoDB Atlas, go to **Network Access**
2. Add `0.0.0.0/0` to allow all IPs (or add Render's IPs)

---

## 📱 Keep Backend Awake (Optional)

Free Render services sleep after 15 minutes. To keep it awake:

1. Use [cron-job.org](https://cron-job.org) (free)
2. Create a cron job to ping: `https://your-backend.onrender.com/health`
3. Set interval: Every 14 minutes

---

## 🔗 Quick Links

- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-api.onrender.com
- **Backend Health**: https://your-api.onrender.com/health

---

## 📝 Environment Variables Summary

### Render (Backend)
| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for JWT tokens (32+ chars) |
| `OPENROUTER_API_KEY` | AI API key |
| `FRONTEND_URL` | Your Vercel URL |
| `PORT` | 5000 (or let Render set it) |

### Vercel (Frontend)
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Your Render backend URL + /api |

---

Need help? Check the logs in Render and Vercel dashboards for detailed error messages.
