# Complete Hosting Guide

## Step 1: Deploy Backend to Railway

1. **Go to**: https://railway.app/
2. **Sign up** with GitHub
3. **Click**: "New Project" → "Deploy from GitHub repo"
4. **Select**: Your backend folder (or create separate repo for backend)
5. **Add Environment Variables** in Railway dashboard:
   ```
   PORT=5000
   FIREBASE_PROJECT_ID=login-system-114fe
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@login-system-114fe.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY=<paste your private key from the JSON file>
   ```
6. **Copy your Railway URL**: e.g., `https://your-backend.railway.app`

---

## Step 2: Deploy Frontend to Vercel

1. **Go to**: https://vercel.com/
2. **Sign up** with GitHub
3. **Click**: "Add New" → "Project"
4. **Import** your GitHub repository
5. **Configure**:
   - Framework Preset: Create React App
   - Root Directory: `./` (leave as is)
6. **Add Environment Variables**:
   ```
   REACT_APP_API_KEY=AIzaSyCTSe8wfvULQYbsGyXEgrJD1yOgGkTWkhw
   REACT_APP_AUTH_DOMAIN=login-system-114fe.firebaseapp.com
   REACT_APP_PROJECT_ID=login-system-114fe
   REACT_APP_STORAGE_BUCKET=login-system-114fe.firebasestorage.app
   REACT_APP_MESSAGING_SENDER_ID=132443361016
   REACT_APP_APP_ID=1:132443361016:web:8a731a75fc1406b9be750d
   REACT_APP_API_URL=https://your-backend.railway.app
   REACT_APP_BASE_URL=https://your-app.vercel.app
   ```
7. **Deploy**!
8. **Copy your Vercel URL**: e.g., `https://your-app.vercel.app`

---

## Step 3: Update Environment Variables

Go back to **Vercel** and update:
```
REACT_APP_BASE_URL=https://your-app.vercel.app
```
(Use the actual Vercel URL you got)

**Redeploy** the frontend.

---

## Step 4: Test QR Code

1. Register a new account
2. Go to verification page
3. Select "QR Code"
4. Scan with your phone
5. Phone opens the verification page
6. Desktop auto-detects and proceeds!

---

## Alternative: Separate Backend Repo

If Railway can't find your backend:

1. Create new repo: `sia-backend`
2. Copy `backend/` folder contents to root
3. Push to GitHub
4. Deploy that repo to Railway

---

## Costs:
- **Vercel**: FREE (100GB bandwidth/month)
- **Railway**: FREE ($5 credit/month, ~550 hours)
- **Total**: $0/month for small projects

---

## Need Help?
- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app/
