# Deploy to Vercel - Complete Guide

## 🚀 Environment Variables for Vercel

When pushing code to Vercel, you need to set these environment variables:

---

## ✅ Required Environment Variables

### Database
```
DATABASE_URL=postgresql://user:password@host:5432/database
```
**Where to get:** 
- Neon: https://neon.tech (free tier)
- Railway: https://railway.app
- Supabase: https://supabase.com

---

### Session Management
```
SESSION_SECRET=your-random-secret-key-min-32-characters
```
**Generate:** Use any random string with 32+ characters
```bash
# Generate random secret:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### Square Payment Gateway
```
VITE_SQUARE_APPLICATION_ID=sq_apia_xxxxxxxxxxxxx
VITE_SQUARE_LOCATION_ID=sq_location_xxxxxxxxxxxxx
SQUARE_ACCESS_TOKEN=sq_pata_xxxxxxxxxxxxx
```
**Where to get:** https://squareup.com → Developer Dashboard

---

### Environment
```
NODE_ENV=production
```

---

## 📋 Complete List of All Env Variables

```
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Session
SESSION_SECRET=your-secret-key-min-32-chars

# Square Payment
VITE_SQUARE_APPLICATION_ID=sq_apia_xxxxx
VITE_SQUARE_LOCATION_ID=sq_location_xxxxx
SQUARE_ACCESS_TOKEN=sq_pata_xxxxx

# Environment
NODE_ENV=production

# Optional - Stripe (if using instead of Square)
# VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
# STRIPE_SECRET_KEY=sk_live_xxxxx
```

---

## 🔧 How to Add Env Variables to Vercel

### Method 1: From Vercel Dashboard (Easiest)

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard

2. **Select your project**

3. **Click Settings** (top navigation)

4. **Click Environment Variables** (left sidebar)

5. **Add each variable:**
   - Name: `DATABASE_URL`
   - Value: `postgresql://...`
   - Click Add

6. **Repeat for all variables:**
   ```
   DATABASE_URL
   SESSION_SECRET
   VITE_SQUARE_APPLICATION_ID
   VITE_SQUARE_LOCATION_ID
   SQUARE_ACCESS_TOKEN
   NODE_ENV
   ```

7. **Redeploy** - After adding env vars, Vercel automatically redeployes

### Method 2: From Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Add environment variables
vercel env add DATABASE_URL
vercel env add SESSION_SECRET
vercel env add VITE_SQUARE_APPLICATION_ID
vercel env add VITE_SQUARE_LOCATION_ID
vercel env add SQUARE_ACCESS_TOKEN
vercel env add NODE_ENV

# Deploy
vercel --prod
```

### Method 3: From .env.production File

Create `.env.production` file:
```
DATABASE_URL=postgresql://...
SESSION_SECRET=your-secret
VITE_SQUARE_APPLICATION_ID=sq_apia_xxxxx
VITE_SQUARE_LOCATION_ID=sq_location_xxxxx
SQUARE_ACCESS_TOKEN=sq_pata_xxxxx
NODE_ENV=production
```

**Then deploy with Vercel CLI:**
```bash
vercel --prod
```

---

## 📊 Environment Variables Explained

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection | `postgresql://user:pass@host:5432/db` |
| `SESSION_SECRET` | Encrypt user sessions | `abc123xyz789...` (32+ chars) |
| `VITE_SQUARE_APPLICATION_ID` | Square app ID | `sq_apia_xxxxxxxxxxxxxxxx` |
| `VITE_SQUARE_LOCATION_ID` | Square location ID | `sq_location_xxxxxxxxxxxxxxxx` |
| `SQUARE_ACCESS_TOKEN` | Square API token | `sq_pata_xxxxxxxxxxxxxxxx` |
| `NODE_ENV` | Production mode | `production` |

---

## 🎯 Setup Steps (From Start to Live)

### Step 1: Create GitHub Repo
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/stayhub.git
git push -u origin main
```

### Step 2: Create Free Neon Database
1. Go to https://neon.tech
2. Sign up free
3. Create project
4. Copy connection string

### Step 3: Get Square Credentials
1. Go to https://squareup.com
2. Sign up free
3. Go to Developer Dashboard
4. Copy:
   - Application ID
   - Location ID
   - Generate Access Token

### Step 4: Deploy to Vercel
1. Go to https://vercel.com
2. Click "New Project"
3. Select GitHub repo
4. Click "Deploy"
5. Go to Settings → Environment Variables
6. Add all 6 variables
7. Vercel auto-redeploys

### Step 5: Test Live App
- Visit your Vercel URL
- Test booking flow
- Test admin dashboard
- Test payments

---

## ⚠️ Important Notes

**NEVER commit .env file to Git**
```bash
# Add to .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore
```

**Frontend vs Backend Variables**
- Variables starting with `VITE_` are for frontend
- Other variables are for backend only

**Redeploy After Adding Env Vars**
- Vercel automatically redeployls when you add env variables
- Takes ~2 minutes to be live

**Use Production Credentials**
- After testing: Use real Square API keys (not sandbox)
- Real payments will be processed immediately

---

## 🔒 Database Options for Vercel

### Option 1: Neon (Recommended)
```
- Free tier: 3GB storage
- Connection string: postgresql://...
- Easy to setup
- Go to: https://neon.tech
```

### Option 2: Railway
```
- Free tier: $5/month credit
- PostgreSQL included
- Go to: https://railway.app
```

### Option 3: Supabase
```
- Free tier: 500MB storage
- PostgreSQL + extras
- Go to: https://supabase.com
```

### Option 4: Digital Ocean
```
- Managed PostgreSQL
- Reliable production option
- Go to: https://digitalocean.com
```

---

## 🚨 Troubleshooting Vercel Deployment

### "DATABASE_URL is not set"
1. Check Vercel Settings → Environment Variables
2. Make sure `DATABASE_URL` is added
3. Redeploy after adding

### "Can't connect to database"
1. Check DATABASE_URL is correct
2. Test with: `psql $DATABASE_URL`
3. Make sure database is accessible from internet

### "Payment form not working"
1. Check `VITE_SQUARE_APPLICATION_ID` is set
2. Verify `VITE_SQUARE_LOCATION_ID` is set
3. Check both are production credentials (not sandbox)

### "Build fails on Vercel"
1. Check build logs in Vercel Dashboard
2. Make sure `npm run build` works locally
3. Check all dependencies are in package.json

### "Session not persisting"
1. Check `SESSION_SECRET` is set and long enough (32+ chars)
2. Make sure database is working
3. Redeploy after setting variable

---

## 🎯 Vercel Build Settings

When Vercel asks:
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`
- **Development Command:** `npm run dev`

These are already configured in your `package.json`, so Vercel should auto-detect them.

---

## 📈 Performance on Vercel

**Expected Response Times:**
- First page load: <2 seconds
- API calls: <200ms
- Database queries: <100ms

**Scaling:**
- Vercel auto-scales your functions
- No worries about traffic spikes
- Pay only for what you use

---

## 💰 Cost on Vercel

**Vercel:** Free tier available
- Unlimited deployments
- 100GB bandwidth/month
- Automatic scaling

**Database (Neon):**
- Free: 3GB storage
- Paid: $0.22 per 1GB

**Square Payments:**
- Visa/Mastercard: 2.9% + $0.30
- No monthly fee

---

## ✅ Checklist Before Deploying

- [ ] Code pushed to GitHub
- [ ] `.gitignore` includes `.env*`
- [ ] Neon/Database created and connected
- [ ] Square account created with API keys
- [ ] Vercel project created
- [ ] All 6 environment variables added to Vercel
- [ ] Build works locally: `npm run build`
- [ ] Can run locally: `npm run dev`
- [ ] Tested booking flow locally
- [ ] Ready to go live!

---

## 🎉 After Deployment

1. **Get your live URL** from Vercel Dashboard
2. **Test the app** (visit URL, try booking)
3. **Share with friends** to test
4. **Monitor** in Vercel Dashboard
5. **Configure custom domain** (optional)

---

## 📞 Support

- Vercel Docs: https://vercel.com/docs
- Neon Docs: https://neon.tech/docs
- Square Docs: https://developer.squareup.com
- This Project: See SETUP_GUIDE.md

---

**Ready to deploy?** Follow the 5 steps above and your app will be live in minutes! 🚀

**Vercel URL:** `https://your-project.vercel.app`
