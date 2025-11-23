# How to Download & Use StayHub Package

## Download Complete Project

The complete StayHub project is available in this Replit workspace.

### Option 1: Download from Replit

1. **In Replit UI:**
   - Click **Files** (top left)
   - Click **⋮** (three dots) menu
   - Click **Download as ZIP**
   - Save `stayhub.zip`

2. **Extract and use:**
   ```bash
   unzip stayhub.zip
   cd stayhub
   npm install
   ```

### Option 2: Clone from Git

If code is in GitHub:
```bash
git clone https://github.com/yourusername/stayhub.git
cd stayhub
npm install
```

### Option 3: Manual Download

All project files are organized in:
- `/client` - Frontend React app
- `/server` - Express backend
- `/shared` - Shared types
- `/public` - Static assets
- Root config files

## What You're Getting

### Source Code
```
✅ Complete React frontend (client/)
✅ Complete Express backend (server/)
✅ Database schemas (shared/)
✅ All configuration files
✅ 30+ React components
✅ 40+ API endpoints
✅ WebSocket chat system
✅ Payment integration (Square)
```

### Documentation (10 Files)
```
✅ README.md - Quick start
✅ COMPREHENSIVE_README.md - Full guide
✅ SETUP_GUIDE.md - Installation steps
✅ API_DOCUMENTATION.md - All endpoints
✅ PROJECT_STRUCTURE.md - Code organization
✅ DEPENDENCIES.md - All 80+ libraries
✅ SQUARE_SETUP.md - Payment integration
✅ FINAL_CHECKLIST.md - Feature list
✅ REQUIREMENTS_COMPLETION.md - Verification
✅ PACKAGE_CONTENTS.md - What's included
```

### Configuration
```
✅ package.json - Dependencies & scripts
✅ tsconfig.json - TypeScript setup
✅ tailwind.config.ts - Styling config
✅ vite.config.ts - Bundler config
✅ drizzle.config.ts - Database config
✅ .env.example - Environment template
```

### Test Data
```
✅ 7 pre-seeded properties
✅ Sample user accounts
✅ Test payment card details
✅ Sample bookings
```

## Getting Started (5 Minutes)

### Step 1: Setup
```bash
npm install
```

### Step 2: Environment
```bash
cp .env.example .env
# Edit .env with your database and payment details
```

### Step 3: Database
```bash
npm run db:push
```

### Step 4: Run
```bash
npm run dev
# Visit http://localhost:5000
```

### Step 5: Deploy
```bash
npm run build
# Deploy to your hosting platform
```

## File Structure in Download

```
stayhub/
├── client/                  Frontend React app
│   ├── src/pages/          8 page components
│   ├── src/components/     30+ UI components
│   ├── src/lib/            Utilities & config
│   └── src/main.tsx        Entry point
│
├── server/                  Express backend
│   ├── routes.ts           40+ API endpoints
│   ├── storage.ts          Data layer
│   ├── index.ts            Server setup
│   └── websocket.ts        Chat system
│
├── shared/                  Shared types
│   └── schema.ts           Database schemas
│
├── public/                  Static assets
│
├── dist/                    Build output (after npm run build)
│
├── Documentation Files
│   ├── README.md
│   ├── SETUP_GUIDE.md
│   ├── API_DOCUMENTATION.md
│   ├── COMPREHENSIVE_README.md
│   ├── PROJECT_STRUCTURE.md
│   ├── DEPENDENCIES.md
│   ├── SQUARE_SETUP.md
│   ├── FINAL_CHECKLIST.md
│   ├── REQUIREMENTS_COMPLETION.md
│   ├── PACKAGE_CONTENTS.md
│   └── DOWNLOAD_INSTRUCTIONS.md (this file)
│
└── Configuration Files
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.ts
    ├── vite.config.ts
    ├── drizzle.config.ts
    ├── .env.example
    └── .gitignore
```

## System Requirements

**Before Running:**
- Node.js 18+ (check: `node --version`)
- npm (comes with Node.js)
- PostgreSQL 12+ or Neon account (free)
- Square account (free) for payments

## Installation Steps

### 1. Prerequisites Check
```bash
# Check Node version
node --version    # Should be v18 or higher
npm --version     # Should be 8 or higher
```

### 2. Install Dependencies
```bash
npm install
# Takes 2-3 minutes
# Installs 80+ packages
```

### 3. Setup Database

**Option A: Neon (Easiest)**
- Go to https://neon.tech
- Sign up free
- Create project
- Copy connection string to `.env`

**Option B: Local PostgreSQL**
```bash
# Create database
createdb stayhub
# Update .env with connection string
DATABASE_URL=postgresql://user:password@localhost:5432/stayhub
```

**Option C: Replit Database (Auto)**
- Already configured in Replit
- Just set `.env` variables

### 4. Setup Payments

**Get Square Credentials (5 minutes):**
1. Visit https://squareup.com
2. Sign up free
3. Go to Developer Dashboard
4. Copy Application ID
5. Copy Location ID
6. Generate Access Token
7. Add to `.env`:
```
VITE_SQUARE_APPLICATION_ID=your_id
VITE_SQUARE_LOCATION_ID=your_location
SQUARE_ACCESS_TOKEN=your_token
```

### 5. Initialize Database
```bash
npm run db:push
```

### 6. Start Development
```bash
npm run dev
# Opens http://localhost:5000
```

### 7. Test the App
1. Visit home page
2. Click on a property
3. Select dates
4. Try booking
5. Test payment (use card: 4242 4242 4242 4242)

## Build for Production

```bash
npm run build
# Creates ./dist/ folder with optimized code
```

Then deploy:
- **Replit:** Push to Replit (auto-deploys)
- **Railway/Render:** Connect GitHub repo
- **VPS/Traditional:** Copy to server and run `node dist/index.js`

## Documentation Guide

### Start Here
1. **README.md** - Quick overview (5 min read)
2. **SETUP_GUIDE.md** - Installation (10 min read)

### Deep Dive
3. **COMPREHENSIVE_README.md** - Full features (15 min read)
4. **PROJECT_STRUCTURE.md** - How code is organized (10 min read)

### Development
5. **API_DOCUMENTATION.md** - All endpoints (reference)
6. **DEPENDENCIES.md** - All libraries (reference)

### Special Topics
7. **SQUARE_SETUP.md** - Payment integration
8. **FINAL_CHECKLIST.md** - Feature list

### Verification
9. **REQUIREMENTS_COMPLETION.md** - What's included
10. **PACKAGE_CONTENTS.md** - Complete inventory

## Common First Steps

### Test Properties
```
Already pre-loaded with 7 test properties:
1. Beachfront Paradise Villa - $250/night
2. Mountain Cabin Retreat - $180/night
3. City Downtown Apartment - $200/night
4. Tropical Paradise Resort - $350/night
5. Countryside Farm House - $150/night
6. Luxury Penthouse - $500/night
7. Private Beach House - $400/night
```

### Test Accounts
```
Admin:
- Email: admin@stayhub.test
- Password: admin123
- Role: Full admin access

Host:
- Email: host@example.com
- Password: password123
- Role: Can manage properties

Guest:
- Email: user@example.com
- Password: password123
- Role: Can book properties
```

### Test Payment Card
```
Number: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/26)
CVC: Any 3 digits (e.g., 123)
(Only works in Sandbox mode)
```

## Next Steps After Download

1. **Extract files** from ZIP
2. **Read SETUP_GUIDE.md** (10 min)
3. **Install dependencies:** `npm install` (3 min)
4. **Setup .env file** (5 min)
5. **Setup database:** `npm run db:push` (1 min)
6. **Run dev server:** `npm run dev` (instant)
7. **Visit http://localhost:5000**
8. **Test booking flow**
9. **Customize & deploy**

Total time: **30 minutes to launch**

## Troubleshooting Downloads

**"Can't extract ZIP"**
- Use 7-Zip, WinRAR, or built-in extractor
- Make sure path doesn't have special characters

**"npm install fails"**
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**"Database connection error"**
- Check `.env` has correct DATABASE_URL
- Test with: `psql $DATABASE_URL`
- Or use free Neon database

**"App won't start"**
- Check Node.js version: `node --version` (18+)
- Clear port 5000: `lsof -ti:5000 | xargs kill -9`
- Try: `npm run dev`

## Support Resources

### In Project Documentation
- All questions answered in documentation files
- See COMPREHENSIVE_README.md > Troubleshooting

### Official Resources
- React: https://react.dev
- Express: https://expressjs.com
- PostgreSQL: https://postgresql.org
- Square: https://developer.squareup.com

### Tips
- Search `.md` files for your issue
- Check error messages carefully
- Try restarting with `npm run dev`

## What to Customize

After download, customize:

1. **Colors** - `client/src/index.css`
2. **Branding** - Update titles in pages
3. **Properties** - Add your own to database
4. **Pricing** - Adjust fees and taxes
5. **Content** - Update home page text
6. **Images** - Replace placeholder images

## License

MIT License - Use freely, modify, distribute, commercial use allowed.

## Ready?

1. Download and extract ZIP
2. Open terminal in folder
3. Run: `npm install`
4. Read: `SETUP_GUIDE.md`
5. Follow installation steps
6. Launch your rental platform! 🚀

---

**Questions?** Check the documentation files included in the download.
