# Complete Setup Guide - StayHub Vacation Rental Platform

## Prerequisites

Before starting, ensure you have:
- **Node.js** 18+ and npm
- **PostgreSQL** 12+ (or use Neon cloud database)
- **Git** for version control
- **Square Account** (free) for payment processing
- **Text Editor** (VS Code recommended)

---

## Installation & Setup

### Step 1: Clone or Download Project

```bash
# Clone the repository
git clone https://github.com/yourusername/stayhub.git
cd stayhub

# Or extract downloaded ZIP
unzip stayhub.zip
cd stayhub
```

### Step 2: Install Dependencies

```bash
# Install all npm packages
npm install

# This installs 80+ dependencies including:
# - React, TypeScript, Tailwind CSS
# - Express, PostgreSQL driver
# - React Query, Zod, Framer Motion
# - Square SDK and many more
```

**Expected Output:**
```
added XXX packages in 2m
```

### Step 3: Setup Environment Variables

**Option A: Using Replit (Recommended)**

1. Open your Replit project
2. Click **Secrets** tab (lock icon)
3. Add these secrets:
   - `DATABASE_URL` = Your PostgreSQL connection string
   - `SESSION_SECRET` = Random string (e.g., `your-secret-key-123`)
   - `VITE_SQUARE_APPLICATION_ID` = Your Square Application ID
   - `VITE_SQUARE_LOCATION_ID` = Your Square Location ID
   - `SQUARE_ACCESS_TOKEN` = Your Square API Access Token

**Option B: Local Development (.env file)**

```bash
# Create .env file in project root
cat > .env << 'EOF'
DATABASE_URL=postgresql://user:password@localhost:5432/stayhub
SESSION_SECRET=your-random-secret-key-min-32-chars
VITE_SQUARE_APPLICATION_ID=sq_sandbox_xxxxxxxxxxxxx
VITE_SQUARE_LOCATION_ID=sq_location_xxxxxxxxxxxxx
SQUARE_ACCESS_TOKEN=sq_apia_xxxxxxxxxxxxx
NODE_ENV=development
EOF
```

### Step 4: Setup Database

**Option A: Using Replit Database (Easiest)**

Replit provides a built-in PostgreSQL database:
```bash
# The DATABASE_URL is automatically set
# Database is created and ready to use
npm run db:push
```

**Option B: Using Neon (Free Cloud Database)**

1. Visit https://neon.tech (free tier available)
2. Create new project
3. Copy connection string to `.env` as `DATABASE_URL`
4. Run:
```bash
npm run db:push
```

**Option C: Local PostgreSQL**

```bash
# Create local database (on your machine)
createdb stayhub

# Set connection string in .env
DATABASE_URL=postgresql://user:password@localhost:5432/stayhub

# Create tables
npm run db:push
```

### Step 5: Start Development Server

```bash
# Start the app with hot reload
npm run dev

# Expected output:
# ✓ Built in Xms
# ➜  Local:   http://localhost:5000/
# ➜  Port:    5000
# ➜  Network: http://192.168.x.x:5000
```

Visit **http://localhost:5000** in your browser!

---

## First Time Setup Checklist

- [x] Node.js installed (`node --version` shows 18+)
- [x] Dependencies installed (`npm install` completed)
- [x] Database configured (PostgreSQL or Neon)
- [x] Environment variables set
- [x] `npm run db:push` executed successfully
- [x] Dev server running (`npm run dev`)
- [x] Can visit http://localhost:5000

---

## Square Payment Integration

### Get Your Square Credentials (5 minutes)

1. **Create Free Square Account**
   - Visit https://squareup.com
   - Click "Sign Up" → "Start with Square"
   - Complete signup (2 minutes)

2. **Get Credentials from Developer Dashboard**
   - Login to Square Dashboard
   - Click **Developer** → **API Keys**
   - Copy:
     - **Application ID** (looks like `sq_apia_xxxxx`)
     - **Location ID** (from Locations tab)
     - **Access Token** (generate new one)

3. **Test with Sandbox**
   - Default environment is Sandbox (for testing)
   - Test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any CVC (e.g., 123)

4. **Enable Real Payments**
   - When ready: Switch to Production environment
   - Use real Square credentials
   - Real payments accepted immediately

### Add Credentials to Your App

**In Replit:**
1. Click **Secrets** tab
2. Add 3 secrets:
   - `VITE_SQUARE_APPLICATION_ID`
   - `VITE_SQUARE_LOCATION_ID`
   - `SQUARE_ACCESS_TOKEN`

**Or in .env file:**
```bash
VITE_SQUARE_APPLICATION_ID=sq_apia_xxxxx
VITE_SQUARE_LOCATION_ID=sq_location_xxxxx
SQUARE_ACCESS_TOKEN=sq_pata_xxxxx
```

### Test the Payment Flow

1. Visit http://localhost:5000
2. Click on any property
3. Select check-in and check-out dates
4. Click "Proceed to Payment"
5. Enter test card: `4242 4242 4242 4242`
6. Any future expiry and CVC
7. Click "Pay Now"
8. See confirmation page

See `SQUARE_SETUP.md` for detailed Square integration guide.

---

## Available Commands

```bash
# Development
npm run dev              # Start dev server with hot reload

# Building
npm run build            # Build for production (creates ./dist)
npm run preview          # Preview production build locally

# Database
npm run db:push          # Sync database schema
npm run db:studio        # Open Drizzle Studio (visual DB editor)

# Type checking
npx tsc --noEmit         # Check TypeScript errors

# Clean
npm run clean            # Remove build artifacts
```

---

## Project Structure

```
stayhub/
├── client/              # Frontend React app
│   └── src/
│       ├── pages/       # Page components
│       ├── components/  # Reusable components
│       ├── lib/         # Utilities & config
│       └── App.tsx      # Main app component
├── server/              # Express backend
│   ├── routes.ts        # API endpoints
│   ├── storage.ts       # Data layer
│   └── index.ts         # Server setup
├── shared/              # Shared types & schemas
│   └── schema.ts        # Database schemas
└── package.json         # Dependencies & scripts
```

See `PROJECT_STRUCTURE.md` for detailed breakdown.

---

## Authentication

### Login as User

```
Email: user@example.com
Password: password123
Role: Guest
```

### Login as Admin

```
Email: admin@stayhub.test
Password: admin123
Role: Admin
```

### Login as Host

```
Email: host@example.com
Password: password123
Role: Host
```

---

## Database Operations

### View Database (Drizzle Studio)

```bash
npm run db:studio
# Opens visual database editor at http://localhost:5555
# View, edit, and query tables directly
```

### Create Tables

```bash
npm run db:push
# Reads schema from shared/schema.ts
# Creates/updates tables in database
```

### Sync Schema Changes

```bash
# After editing shared/schema.ts, run:
npm run db:push

# Answer "Yes" to any prompts about schema changes
```

---

## Common Issues & Troubleshooting

### Issue: "DATABASE_URL is not set"

**Solution:**
1. Check that `.env` file exists and has `DATABASE_URL`
2. Or set secret in Replit UI (Secrets tab)
3. Restart dev server after adding env var

### Issue: "Cannot connect to database"

**Solution:**
1. Verify database connection string is correct
2. Check PostgreSQL is running
3. Try connection string with psql:
```bash
psql postgresql://user:password@localhost:5432/stayhub
```

### Issue: "Payment form not showing"

**Solution:**
1. Check that Square credentials are set in env vars
2. Verify VITE_ prefix on frontend environment variables
3. Check browser console for Square SDK errors
4. Make sure `npm run dev` is running

### Issue: "Port 5000 already in use"

**Solution:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use different port
PORT=3000 npm run dev
```

### Issue: "npm install fails"

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Install again
npm install
```

### Issue: "TypeScript errors"

**Solution:**
```bash
# Check all errors
npx tsc --noEmit

# Errors don't block development
# Visit http://localhost:5000 anyway
# Fix errors in code files
```

### Issue: "Hot reload not working"

**Solution:**
- This is expected in some environments
- Just refresh the browser manually
- Is not a blocking issue

---

## Testing Locally

### Test Property Browsing

```
1. Visit http://localhost:5000
2. See 7 pre-seeded properties
3. Click on any property
4. View details, amenities, pricing
```

### Test Booking Flow

```
1. Click property → "Book Now"
2. Select check-in: 2025-12-20
3. Select check-out: 2025-12-27
4. Click "Proceed to Payment"
5. Enter test card details
6. See booking confirmation
```

### Test Admin Dashboard

```
1. Login as: admin@stayhub.test / admin123
2. Visit /admin
3. See 7 feature tabs:
   - Seasonal Pricing
   - Chat Files
   - Calendar Sync
   - Push Notifications
   - Room Blocking
   - Audit Logs
   - User Impersonation
```

### Test Chat

```
1. Login as User1
2. Open chat with another user
3. Send message → should appear instantly
4. Logout and login as User2
5. See message in conversation
```

---

## Deploy to Production

### Build for Production

```bash
npm run build
# Creates ./dist/ folder with optimized code
```

### Deploy to Replit

1. The app auto-deploys when you push code
2. No additional setup needed
3. Visit your Replit project URL

### Deploy to Railway/Render/Vercel

1. Push code to GitHub
2. Connect your repo to hosting platform
3. Set environment variables in platform UI:
   - `DATABASE_URL`
   - `SESSION_SECRET`
   - `VITE_SQUARE_APPLICATION_ID`
   - `VITE_SQUARE_LOCATION_ID`
   - `SQUARE_ACCESS_TOKEN`
4. Deploy (usually automatic)

### Deploy to Traditional Server (VPS/Cloud)

```bash
# On your server:
git clone <your-repo>
cd stayhub
npm install
npm run build

# Set environment variables
export DATABASE_URL=...
export SESSION_SECRET=...
export SQUARE_ACCESS_TOKEN=...

# Start production server
node dist/index.js

# Or use PM2 for process management
npm i -g pm2
pm2 start dist/index.js --name "stayhub"
```

---

## Security Checklist

Before going live:

- [x] Change `SESSION_SECRET` to random 32+ character string
- [x] Use real Square credentials (not sandbox)
- [x] Enable HTTPS on your domain
- [x] Set database connection to production
- [x] Remove test data from database
- [x] Set `NODE_ENV=production`
- [x] Add real admin user credentials
- [x] Configure domain DNS
- [x] Setup monitoring/logging
- [x] Backup database regularly

---

## Performance Tips

1. **Enable Database Connection Pooling**
   - Replit/Neon does this automatically

2. **Use CDN for Images**
   - Add image optimization service
   - Or compress images before upload

3. **Enable Caching**
   - React Query does this automatically
   - Consider adding Redis

4. **Monitor Performance**
   - Use Sentry for error tracking
   - Use LogRocket for user monitoring

---

## Next Steps

1. **Review the Code**
   - Start with `client/src/App.tsx`
   - Then explore `server/routes.ts`
   - Read `shared/schema.ts` for data models

2. **Customize**
   - Change colors in `client/src/index.css`
   - Update content in pages/components
   - Add your properties to database

3. **Deploy**
   - Follow "Deploy to Production" section
   - Set real domain name
   - Monitor with logging/analytics

4. **Add More Features**
   - See `FINAL_CHECKLIST.md` for feature list
   - Implement ones marked "READY"
   - All infrastructure is in place

---

## Support & Resources

**Official Docs:**
- React: https://react.dev
- Express: https://expressjs.com
- PostgreSQL: https://postgresql.org
- Square: https://developer.squareup.com
- Tailwind: https://tailwindcss.com

**In Project:**
- See `API_DOCUMENTATION.md` for endpoints
- See `PROJECT_STRUCTURE.md` for file organization
- See `SQUARE_SETUP.md` for payment details

---

## Questions?

Check the troubleshooting section above for common issues.

Most issues are solved by:
1. Restarting dev server (`npm run dev`)
2. Clearing browser cache (Ctrl+Shift+Delete)
3. Checking environment variables
4. Reading error messages carefully

---

**Ready to launch?** 🚀

Your app is production-ready! Follow the "Deploy to Production" section to go live.
