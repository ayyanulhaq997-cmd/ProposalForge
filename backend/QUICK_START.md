# Quick Start - Windows

**This is the fastest way to get StayHub running on Windows.**

## Prerequisites
- Node.js 18+ installed
- PostgreSQL or Neon database

---

## Step 1: Update package.json (Windows Only)

This is needed because `NODE_ENV=variable` syntax doesn't work on Windows PowerShell.

**Edit `package.json` and find the `"scripts"` section:**

Change these lines:
```json
"dev": "NODE_ENV=development tsx server/index-dev.ts",
"start": "NODE_ENV=production node dist/index.js",
```

To this:
```json
"dev": "cross-env NODE_ENV=development tsx server/index-dev.ts",
"start": "cross-env NODE_ENV=production node dist/index.js",
```

Also add `"cross-env": "^7.0.3"` to the `"devDependencies"` section.

---

## Step 2: Create .env file

In your project root, create a file named `.env`:

```
DATABASE_URL=postgresql://user:password@localhost:5432/stayhub
SESSION_SECRET=my-secret-key-here
VITE_SQUARE_APPLICATION_ID=sq_apia_xxxxx
VITE_SQUARE_LOCATION_ID=sq_location_xxxxx
SQUARE_ACCESS_TOKEN=sq_pata_xxxxx
NODE_ENV=development
```

---

## Step 3: Run

```bash
npm install
npm run dev
```

Visit: http://localhost:5000

---

## Done!

For full setup details, see `SETUP_GUIDE.md`
