# Manual Deploy to Vercel - Step by Step

## Problem
Git command line has restrictions. Solution: Upload files manually through GitHub web interface.

---

## Step 1: Go to GitHub Repository

1. Go to: https://github.com/ayyanulhaq997-cmd/ProposalForge
2. Click **main** branch (top left)
3. You should see your existing code files

---

## Step 2: Upload vercel.json

1. Click **Add file** button (top right, green button)
2. Click **Upload files**
3. **Drag and drop** `vercel.json` from your computer OR:
   - Click the file selector
   - Browse to `/home/runner/workspace/vercel.json`
   - Select it
4. At the bottom, click **Commit changes**
5. Leave message as is, click **Commit changes** again

---

## Step 3: Upload api/index.js

1. Click **Add file** button again
2. Click **Upload files**
3. **Create a folder first:**
   - In the upload area, type: `api/`
   - Then drag/upload the `index.js` file
4. OR manually:
   - Click **Add file** → **Create new file**
   - Name it: `api/index.js`
   - Copy content from `/home/runner/workspace/api/index.js` (see below)
   - Click **Commit changes**

---

## Step 4: Upload public/ folder files

1. Click **Add file** → **Upload files**
2. **Upload all files from** `/home/runner/workspace/public/`:
   - `public/index.html`
   - `public/favicon.png`
   - All files in `public/assets/`

---

## What Files You're Uploading

### vercel.json
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "npm run build && cp -r dist/public/* public/",
  "installCommand": "npm install",
  "framework": null,
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api"
    },
    {
      "source": "/:path*",
      "destination": "/index.html"
    }
  ]
}
```

### api/index.js
```javascript
// Vercel serverless function entry point
export default async function handler(req, res) {
  try {
    // Import and run the server
    const { app, server } = await import('../dist/index.js');
    
    // Let Express handle the request
    app(req, res);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

---

## Step 5: Redeploy on Vercel

1. Go to: https://vercel.com/dashboard
2. Click **proposal-forge-one** project
3. Wait a few seconds (Vercel auto-detects GitHub push)
4. You should see a new deployment in the **Deployments** tab
5. Click **Redeploy** when ready
6. Wait 2-3 minutes for deployment to complete ⏳

---

## Result

Your app will now:
- ✅ Display the website (NOT code)
- ✅ Serve frontend from `public/`
- ✅ Handle API calls through `/api/index.js`
- ✅ Work on Vercel production URL

---

## If Still Showing Code

Check Vercel deployment logs:
1. Go to https://vercel.com/dashboard
2. Click **proposal-forge-one**
3. Click the red X on failed deployment
4. Scroll down to see error messages
5. Share the error and we'll fix it

---

Good luck! Your app is ready to deploy! 🚀
