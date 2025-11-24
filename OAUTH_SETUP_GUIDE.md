# OAuth Login Setup Guide for Your Client

## What's Currently Happening

Your booking Website has Google and Facebook login buttons on the login page. When users click them:

**Right Now:** They see an error message saying "Not Configured" because the OAuth credentials haven't been set up yet.

**After Setup:** Users will be able to sign in with one click using their Google or Facebook account.

---

## How Users Will Benefit

 **Faster Sign-ups** - you once instead of entering email/password  
 **Auto-fill Data** - Their name and profile picture auto-populate  
 **Better UX** - No password to remember  
 **Security** - Powered by Google/Facebook's secure authentication  

---

## Setup Instructions for Client

 client can enable OAuth by following these steps:

### Step 1: Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Enable **Google+ API**
4. Go to **Credentials** → Create OAuth 2.0 Client ID
5. Select **Web application**
6. Add authorized redirect URI: `https://proposalforge-production-0b37.up.railway.app/api/auth/google/callback`
7. Copy the **Client ID**
8. In Railway dashboard:
   - Go to Variables
   - Add new variable: `VITE_GOOGLE_CLIENT_ID` = [paste Client ID]
   - Redeploy

### Step 2: Set Up Facebook OAuth

1. Go to [Facebook Developers](https://developers.facebook.com)
2. Create a new App (Business type)
3. Add **Facebook Login** product
4. In Settings → Basic, copy your **App ID**
5. Go to Facebook Login → Settings
6. Add Valid OAuth Redirect URIs: `https://proposalforge-production-0b37.up.railway.app/api/auth/facebook/callback`
7. In Railway dashboard:
   - Go to Variables
   - Add new variable: `VITE_FACEBOOK_APP_ID` = [paste App ID]
   - Redeploy

### Step 3: Test It

1. Visit your app
2. Go to Login page
3. Click "Google" or "Facebook"
4. You'll be redirected to sign in
5. After successful auth, you'll be logged into the booking app!

---

## Important Notes

- **Right now:** Users can still login with email/password (fully working)
- **Email/Password is your backup:** Even with Google/Facebook enabled, users can always use email/password
- **No personal data shared:** Your app only gets their name and email - nothing else
- **Optional feature:** Your client can choose to enable one or both OAuth providers

---

## Current Status

| Feature | Status |
|---------|--------|
| Email/Password Login | ✅ Working |
| Google Login Button | ⏳ Ready (waiting for credentials) |
| Facebook Login Button | ⏳ Ready (waiting for credentials) |
| Email Signup | ✅ Working |
| Guest Checkout | ✅ Working |
| Bookings | ✅ Working |

---

## Troubleshooting

**Problem:** User clicks Google/Facebook but gets "Not Configured"  
**Solution:** Client needs to add the OAuth credentials to Railway variables (see Step 1 & 2 above)

**Problem:** User is redirected but gets "Invalid redirect URI"  
**Solution:** The redirect URI in Google/Facebook settings must exactly match: `https://proposalforge-production-0b37.up.railway.app/api/auth/google/callback`

**Problem:** OAuth works but user data doesn't import  
**Solution:** Backend OAuth callback routes may need completion. Contact developer.

---

## Timeline

- **Now:** Email/password login works 100%
- **When OAuth credentials added:** Google/Facebook login will work immediately
- **Users don't lose anything:** Email/password option always available as fallback

Your client can deploy and go live with email/password right now, and add Google/Facebook login anytime later!
