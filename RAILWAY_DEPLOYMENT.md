# Railway Deployment Guide - ProposalForge/StayHub

## Quick Setup (5 minutes)

### Step 1: Create Railway Project
1. Go to [railway.app](https://railway.app)
2. Click "Create Project"
3. Select "Deploy from GitHub"
4. Select your GitHub repo
5. Railway will auto-build and deploy

### Step 2: Add PostgreSQL Database
1. In your Railway project, click "Create Service"
2. Select "PostgreSQL"
3. Railway creates a database automatically
4. The `DATABASE_URL` is automatically added to your environment!

### Step 3: Add Required Environment Variables
In Railway, go to your **main app service** → **Variables** tab and add:

```
SESSION_SECRET = any-random-string-here
NODE_ENV = production
```

**That's it!** DATABASE_URL is already set by Railway when you add PostgreSQL.

### Step 4: Redeploy
1. Go to **Deployments** tab
2. Click the three dots (...) on the latest deployment
3. Click "Redeploy"
4. Wait 3-5 minutes for build to complete

### Step 5: Access Your App
Your app will be at: `https://[project-name].up.railway.app`

---

## Environment Variables Explained

| Variable | Required | Where it comes from | Example |
|----------|----------|-------------------|---------|
| `DATABASE_URL` | ✅ YES | Automatic (from PostgreSQL service) | `postgresql://...` |
| `SESSION_SECRET` | ✅ YES | You create this | `my-secret-key-123` |
| `NODE_ENV` | ✅ YES | You set this | `production` |

---

## Troubleshooting

### App shows "Error" page
- Check **Deployments** → click latest deployment
- Look at the **logs** section
- If it says "DATABASE_URL must be set", you forgot step 2 (add PostgreSQL)
- If it shows "Cannot connect to database", check the PostgreSQL service is running

### Domain not working
- Go to **Settings** → **Domains**
- Click "Generate Domain" if no domain exists
- Wait 1-2 minutes for DNS to propagate

### Properties not seeding
- This is normal on first deployment
- Database tables are created automatically
- Properties seed on app startup

---

## Test Credentials (Already Seeded)

Login with these accounts to test:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@stayhub.test | admin123 |
| Host | host@example.com | password123 |
| Guest | user@example.com | password123 |

---

## That's it! 🚀

Your vacation rental app is now live and production-ready!
