# Quick Start - Windows

**This is the fastest way to get StayHub Frontend running on Windows.**

## Prerequisites
- Node.js 18+ installed
- Backend API running (from backend folder)

---

## Step 1: Update package.json (Windows Only)

**Edit `package.json` and find the `"scripts"` section:**

Change these lines:
```json
"dev": "NODE_ENV=development tsx server/index-dev.ts",
"start": "NODE_ENV=production node dist/index.js",
```

To this:
```json
"dev": "cross-env NODE_ENV=development vite",
"start": "cross-env NODE_ENV=production vite preview",
```

Also add `"cross-env": "^7.0.3"` to the `"devDependencies"` section.

---

## Step 2: Create .env file

In your project root, create a file named `.env`:

```
VITE_API_URL=http://localhost:5000
NODE_ENV=development
```

---

## Step 3: Run

```bash
npm install
npm run dev
```

Visit: http://localhost:5173

---

## Done!

Make sure backend is running on port 5000!
