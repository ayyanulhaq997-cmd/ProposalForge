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
git clone https://github.com/EdwardFeliz29/vacacional_back.git backend
cd backend

# Or extract downloaded ZIP
unzip backend.zip
cd backend
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

Create a `.env` file in the project root:

```bash
# Create .env file
cat > .env << 'EOF'
DATABASE_URL=postgresql://user:password@localhost:5432/stayhub
SESSION_SECRET=your-random-secret-key-min-32-chars
VITE_SQUARE_APPLICATION_ID=sq_sandbox_xxxxxxxxxxxxx
VITE_SQUARE_LOCATION_ID=sq_location_xxxxxxxxxxxxx
SQUARE_ACCESS_TOKEN=sq_apia_xxxxxxxxxxxxx
NODE_ENV=development
EOF
```

**Important: Never commit .env file to GitHub!** It's already in `.gitignore`

### Step 4: Setup Database

**Option A: Using Neon (Free Cloud Database)**

1. Visit https://neon.tech (free tier available)
2. Create new project
3. Copy connection string to `.env` as `DATABASE_URL`
4. Run:
```bash
npm run db:push
```

**Option B: Local PostgreSQL**

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
```

Visit **http://localhost:5000** in your browser!

---

## First Time Setup Checklist

- [ ] Node.js installed (`node --version` shows 18+)
- [ ] Dependencies installed (`npm install` completed)
- [ ] Database configured (PostgreSQL or Neon)
- [ ] Environment variables set in `.env` file
- [ ] `npm run db:push` executed successfully
- [ ] Dev server running (`npm run dev`)
- [ ] Can visit http://localhost:5000

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

Add to your `.env` file:
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
```

---

## Project Structure

```
backend/
├── server/              # Express backend
│   ├── routes.ts        # API endpoints
│   ├── storage.ts       # Data layer
│   ├── index-dev.ts     # Development server
│   └── index-prod.ts    # Production server
├── shared/              # Shared types & schemas
│   └── schema.ts        # Database schemas
└── package.json         # Dependencies & scripts
```

Frontend is in separate `frontend/` folder with its own React app.

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
1. Check that `.env` file exists in project root and has `DATABASE_URL`
2. Restart dev server after adding env var
3. Make sure `.env` is NOT in `.gitignore` locally (it is by default)

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
1. Check that Square credentials are set in `.env`
2. Verify VITE_ prefix on frontend environment variables
3. Check browser console for Square SDK errors
4. Make sure `npm run dev` is running

### Issue: "Port 5000 already in use"

**Solution:**
```bash
# Kill process on port 5000
# On Mac/Linux:
lsof -ti:5000 | xargs kill -9

# On Windows PowerShell:
netstat -ano | findstr :5000
# Note the PID, then:
taskkill /PID <PID> /F
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

---

## Testing Locally

### Test Property Browsing

```
1. Visit http://localhost:5000
2. See pre-seeded properties
3. Click on any property
4. View details, amenities, pricing
```

### Test Booking Flow

```
1. Click property → "Book Now"
2. Select check-in and check-out dates
3. Click "Proceed to Payment"
4. Enter test card details
5. See booking confirmation
```

### Test Admin Dashboard

```
1. Login as: admin@stayhub.test / admin123
2. Visit /admin
3. See admin features and controls
```

---

## Deploy to Production

### Build for Production

```bash
npm run build
# Creates ./dist/ folder with optimized code
```

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
cd backend
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

- [ ] Change `SESSION_SECRET` to random 32+ character string
- [ ] Use real Square credentials (not sandbox)
- [ ] Enable HTTPS on your domain
- [ ] Set database connection to production
- [ ] Remove test data from database
- [ ] Set `NODE_ENV=production`
- [ ] Add real admin user credentials
- [ ] Configure domain DNS
- [ ] Setup monitoring/logging
- [ ] Backup database regularly

---

## Performance Tips

1. **Enable Database Connection Pooling**
   - Use connection pooling in production
   - Neon handles this automatically

2. **Use CDN for Images**
   - Add image optimization service
   - Or compress images before upload

3. **Enable Caching**
   - React Query does this automatically
   - Consider adding Redis for backend

4. **Monitor Performance**
   - Use Sentry for error tracking
   - Use LogRocket for user monitoring

---

## Next Steps

1. **Review the Code**
   - Start with `server/routes.ts`
   - Then explore `shared/schema.ts` for data models
   - Check frontend in separate repo

2. **Customize**
   - Update database with your properties
   - Modify API endpoints as needed
   - Update frontend styling and content

3. **Deploy**
   - Follow "Deploy to Production" section
   - Set real domain name
   - Monitor with logging/analytics

---

## Support & Resources

**Official Docs:**
- React: https://react.dev
- Express: https://expressjs.com
- PostgreSQL: https://postgresql.org
- Square: https://developer.squareup.com
- Node.js: https://nodejs.org

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
3. Checking environment variables in `.env`
4. Reading error messages carefully

---

**Ready to launch?** 🚀

Your app is production-ready! Follow the "Deploy to Production" section to go live.
