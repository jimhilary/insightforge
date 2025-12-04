# Frontend Deployment Guide - Netlify

This guide walks you through deploying the InsightForge frontend to Netlify.

## Prerequisites

- ✅ Backend deployed on Render (you should have your backend URL)
- ✅ GitHub repository with frontend code
- ✅ Netlify account (sign up at [netlify.com](https://netlify.com))

## Step 1: Verify Local Build

Before deploying, test that your build works locally:

```bash
cd client
npm install
npm run build
```

This should create a `client/dist` folder with no errors. If there are errors, fix them before deploying.

## Step 2: Create Netlify Account & Connect Repository

1. **Sign in to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Sign in with your GitHub account

2. **Create New Site**
   - Click **"Add new site"** → **"Import an existing project"**
   - Choose **GitHub** as your Git provider
   - Authorize Netlify to access your repositories
   - Select your repository: `jimhilary/insightforge` (or your repo name)

## Step 3: Configure Build Settings

On the deployment configuration screen, set:

### Basic Settings:
- **Base directory:** `client`
  - This tells Netlify to run commands from the `client` folder

- **Build command:** `npm run build`
  - This builds your Vite app

- **Publish directory:** `dist`
  - This is where Vite outputs the built files

### Summary:
```
Base directory: client
Build command: npm run build
Publish directory: dist
```

## Step 4: Add Environment Variables

**Before clicking "Deploy site"**, click **"Show advanced"** or go to **"Environment variables"** section:

### Required Variable:

**`VITE_API_URL`**
- **Key:** `VITE_API_URL`
- **Value:** `https://your-backend-url.onrender.com/api`
  - Replace `your-backend-url.onrender.com` with your actual Render backend URL
  - Make sure to include `/api` at the end
  - Example: `https://insightforge-backend.onrender.com/api`

### Optional Variables (for Firebase):
If you want to move Firebase config to environment variables later:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- etc.

**Note:** Currently Firebase config is hardcoded in `client/src/lib/firebase.js`, which is fine for client-side.

## Step 5: Deploy

1. Click **"Deploy site"**
2. Netlify will:
   - Clone your repository
   - Navigate to `client` directory
   - Run `npm install`
   - Run `npm run build`
   - Deploy the `dist` folder

3. Wait for deployment (usually 2-5 minutes)

4. Once deployed, you'll get a URL like:
   ```
   https://insightforge-frontend.netlify.app
   ```
   (Your actual URL may vary based on site name)

## Step 6: Update Backend CORS

After getting your Netlify URL, update your Render backend environment variables:

1. Go to your Render dashboard
2. Select your backend service
3. Go to **Environment** tab
4. Update `FRONTEND_URL` to your Netlify URL:
   ```
   FRONTEND_URL=https://your-app-name.netlify.app
   ```
5. Save and redeploy if needed

## Step 7: Test Your Deployment

Visit your Netlify URL and test:

1. **Landing Page** - Should load at root `/`
2. **Authentication** - Test login/signup
3. **Create Project** - Verify API calls work
4. **Run Research** - Check Network tab in DevTools:
   - Requests should go to: `https://your-backend.onrender.com/api/...`
   - Should not see CORS errors

### Troubleshooting:

**Build fails:**
- Check build logs in Netlify dashboard
- Verify all dependencies are in `package.json`
- Make sure `vite.config.js` is correct

**404 errors on routes (like `/dashboard`):**
- Verify `client/public/_redirects` file exists with: `/* /index.html 200`
- This file enables SPA routing on Netlify

**CORS errors:**
- Verify `FRONTEND_URL` in Render backend matches your Netlify URL exactly
- Check that backend CORS allows your Netlify origin

**API calls fail:**
- Verify `VITE_API_URL` environment variable is set correctly in Netlify
- Check that it includes `/api` at the end
- Verify backend is running and accessible

**Firebase errors:**
- Check that Firebase config in `client/src/lib/firebase.js` is correct
- Verify Firebase project settings allow your Netlify domain

## Step 8: Custom Domain (Optional)

1. Go to your site settings in Netlify
2. Click **"Domain settings"**
3. Click **"Add custom domain"**
4. Follow the instructions to configure DNS

## Step 9: Enable Continuous Deployment

Netlify automatically enables continuous deployment:
- Every push to `main` branch triggers a new build
- Pull requests can create deploy previews

You can configure branch builds in **Site settings** → **Build & deploy** → **Continuous Deployment**.

## Important Files

### `client/public/_redirects`
This file tells Netlify to serve `index.html` for all routes, enabling React Router to work:
```
/* /index.html 200
```

### `client/src/services/api.js`
Uses environment variable for API base URL:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

### Environment Variables Summary

| Variable | Purpose | Example Value |
|----------|---------|---------------|
| `VITE_API_URL` | Backend API base URL | `https://insightforge-backend.onrender.com/api` |

## Next Steps

✅ Frontend is live on Netlify  
✅ Backend is live on Render  
✅ CORS configured  
🎉 Your full-stack app is deployed!

---

**Quick Links:**
- [Netlify Dashboard](https://app.netlify.com)
- [Netlify Docs](https://docs.netlify.com)
- [Vite Deployment Guide](https://vite.dev/guide/static-deploy.html#netlify)

