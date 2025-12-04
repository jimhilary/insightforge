# Backend Deployment Guide - Render

This guide walks you through deploying the InsightForge backend to Render.

## Prerequisites

- GitHub account with your backend code pushed
- Render account (sign up at [render.com](https://render.com))
- Firebase project with service account credentials
- Google Gemini API key

## Step 1: Prepare Your Repository

Your backend is already configured with:
- ✅ `package.json` with `"start": "node index.js"` script
- ✅ Server listens on `process.env.PORT` (Render will set this automatically)
- ✅ Environment variable support via `.env` or Render's environment variables

## Step 2: Create a Render Web Service

1. **Sign in to Render**
   - Go to [render.com](https://render.com)
   - Sign in with your GitHub account

2. **Create New Web Service**
   - Click **"New +"** → **"Web Service"**
   - Connect your GitHub repository (`insightforge` or create a separate backend repo)
   - Select your repository

3. **Configure the Service**

   **Basic Settings:**
   - **Name:** `insightforge-backend` (or your preferred name)
   - **Environment:** `Node`
   - **Region:** Choose closest to your users
   - **Branch:** `main` (or your default branch)

   **Build & Deploy:**
   - **Root Directory:** `server` (if backend is in a subdirectory)
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

   **Advanced Settings:**
   - **Auto-Deploy:** `Yes` (recommended)

## Step 3: Add Environment Variables

Click on **"Environment"** tab and add the following variables:

### Required Variables:

```bash
# Server Configuration
NODE_ENV=production
PORT=5000  # Render sets this automatically, but include for clarity

# Frontend URL (update with your actual frontend URL after deployment)
FRONTEND_URL=https://your-frontend-app.netlify.app

# Google Gemini API Key
GEMINI_API_KEY=your_actual_gemini_api_key_here

# Firebase Admin - Option 1: Environment Variables (Recommended)
FIREBASE_PROJECT_ID=insightforge-828ee
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour full private key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@insightforge-828ee.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40insightforge-828ee.iam.gserviceaccount.com
```

### Getting Firebase Credentials:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** → **Service Accounts**
4. Click **"Generate New Private Key"**
5. Download the JSON file
6. Copy the values from the JSON to the environment variables above
7. **Important:** For `FIREBASE_PRIVATE_KEY`, keep the newlines (`\n`) in the string

### Getting Gemini API Key:

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy and paste it as `GEMINI_API_KEY`

## Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will:
   - Clone your repository
   - Run `npm install`
   - Start your server with `npm start`
3. Wait for the build to complete (usually 2-5 minutes)

## Step 5: Test Your Deployment

Once deployed, you'll get a URL like:
```
https://insightforge-backend.onrender.com
```

### Test Endpoints:

1. **Health Check:**
   ```bash
   curl https://insightforge-backend.onrender.com/api/health
   ```
   Should return: `{"status":"ok","message":"Server is running"}`

2. **Auth Health Check:**
   ```bash
   curl https://insightforge-backend.onrender.com/api/auth/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

### Troubleshooting:

- **Build fails:** Check build logs in Render dashboard
- **Server crashes:** Check runtime logs for errors
- **CORS errors:** Make sure `FRONTEND_URL` is set correctly
- **Firebase errors:** Verify all Firebase environment variables are set correctly
- **Gemini API errors:** Check that `GEMINI_API_KEY` is valid

## Step 6: Update Frontend API URL

Once backend is deployed, update your frontend to use the Render URL:

1. Create `.env` or `.env.production` in your frontend:
   ```bash
   VITE_API_BASE_URL=https://insightforge-backend.onrender.com
   ```

2. Update your frontend API service to use this URL (if not already using env vars)

## Important Notes

⚠️ **Free Tier Limitations:**
- Render free tier services "spin down" after 15 minutes of inactivity
- First request after spin-down takes 30-50 seconds (cold start)
- Consider upgrading for production or use a keep-alive service

✅ **Best Practices:**
- Never commit `.env` files or `serviceAccountKey.json` to git
- Use environment variables for all secrets
- Enable auto-deploy for easy updates
- Monitor logs regularly in Render dashboard

## Next Steps

After backend is deployed and tested:
1. ✅ Backend is live on Render
2. 📝 Update frontend to point to Render backend URL
3. 🚀 Deploy frontend to Netlify (see frontend deployment guide)

