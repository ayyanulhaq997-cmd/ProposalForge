# What Your Client Needs for Real Money & OAuth Login

## 1. Real Money Payments 💰

Your client needs credentials from **ONE** of these payment providers:

### Option A: Stripe (Recommended)
**What they need:**
1. Stripe account (stripe.com)
2. API Keys from Stripe Dashboard:
   - `STRIPE_SECRET_KEY` (starts with `sk_live_` or `sk_test_`)
   - `STRIPE_PUBLISHABLE_KEY` (starts with `pk_live_` or `pk_test_`)

**Steps for client:**
1. Go to https://stripe.com and sign up
2. Click "Developers" → "API Keys"
3. Copy "Secret Key" and "Publishable Key"
4. Send both to you
5. You add to Railway environment variables
6. Payments work immediately

### Option B: Square
**What they need:**
1. Square account (squareup.com)
2. API credentials:
   - `SQUARE_ACCESS_TOKEN` 
   - `SQUARE_LOCATION_ID`

**Steps for client:**
1. Go to https://squareup.com and sign up
2. Click "Developer" → "Credentials"
3. Copy Access Token and Location ID
4. Send both to you
5. You add to Railway environment variables
6. Payments work immediately

---

## 2. Google Login 🔵

Your client needs:

### Google OAuth App Setup
**What to collect from client:**

1. **Google Client ID** (looks like: `123456789-abcdefg.apps.googleusercontent.com`)

**Steps for client:**

1. Go to https://console.cloud.google.com
2. Create new project (or select existing)
3. Search for "Google+ API" and enable it
4. Go to "Credentials" tab
5. Click "Create Credentials" → "OAuth 2.0 Client ID"
6. Choose "Web application"
7. Under "Authorized redirect URIs" add:
   ```
   https://proposalforge-production-0b37.up.railway.app/api/auth/google/callback
   ```
   (Replace with their custom domain if they have one)
8. Click Create
9. Copy the **Client ID**
10. Send to you

**What you do with it:**
- Add to Railway environment variable: `VITE_GOOGLE_CLIENT_ID`
- Restart app
- Google login button works

---

## 3. Facebook Login 🔵

Your client needs:

### Facebook App Setup
**What to collect from client:**

1. **Facebook App ID** (a long number like: `123456789012345`)

**Steps for client:**

1. Go to https://developers.facebook.com
2. Click "My Apps" → "Create App"
3. Choose "Consumer" as app type
4. Fill in app details
5. Add "Facebook Login" product
6. Go to "Settings" → "Basic"
7. Copy the **App ID**
8. Go to "Products" → "Facebook Login" → "Settings"
9. Under "Valid OAuth Redirect URIs" add:
   ```
   https://proposalforge-production-0b37.up.railway.app/api/auth/facebook/callback
   ```
   (Replace with their custom domain if they have one)
10. Save settings
11. Send App ID to you

**What you do with it:**
- Add to Railway environment variable: `VITE_FACEBOOK_APP_ID`
- Restart app
- Facebook login button works

---

## Summary Checklist

### For Payments (Pick ONE):

**If using Stripe:**
- [ ] Client has Stripe account
- [ ] Client provides `STRIPE_SECRET_KEY`
- [ ] Client provides `STRIPE_PUBLISHABLE_KEY`
- [ ] You add both to Railway
- [ ] App restarts
- [ ] ✅ Real payments work

**If using Square:**
- [ ] Client has Square account
- [ ] Client provides `SQUARE_ACCESS_TOKEN`
- [ ] Client provides `SQUARE_LOCATION_ID`
- [ ] You add both to Railway
- [ ] App restarts
- [ ] ✅ Real payments work

### For Google Login:

- [ ] Client has Google Cloud account
- [ ] Client enables Google+ API
- [ ] Client creates OAuth credentials
- [ ] Client adds redirect URI
- [ ] Client provides Google Client ID
- [ ] You add `VITE_GOOGLE_CLIENT_ID` to Railway
- [ ] App restarts
- [ ] ✅ Google login works

### For Facebook Login:

- [ ] Client has Facebook Developer account
- [ ] Client creates app
- [ ] Client adds Facebook Login product
- [ ] Client adds redirect URI
- [ ] Client provides Facebook App ID
- [ ] You add `VITE_FACEBOOK_APP_ID` to Railway
- [ ] App restarts
- [ ] ✅ Facebook login works

---

## How to Add Credentials to Railway

1. Go to Railway Dashboard: https://railway.app
2. Click on your ProposalForge project
3. Click "Variables" tab
4. Add new variables:
   - Key: `STRIPE_SECRET_KEY` → Value: (from Stripe)
   - Key: `STRIPE_PUBLISHABLE_KEY` → Value: (from Stripe)
   - Key: `VITE_GOOGLE_CLIENT_ID` → Value: (from Google)
   - Key: `VITE_FACEBOOK_APP_ID` → Value: (from Facebook)
5. Click "Deploy"
6. Wait for redeploy (2-3 minutes)
7. Features enabled!

---

## Testing

### Test Payments
1. Use test card: `4242 4242 4242 4242`
2. Any future expiry date
3. Any 3-digit CVC
4. Click "Pay"
5. Should show "Payment successful" ✅

### Test Google Login
1. Click "Login with Google" button
2. Sign in with Google account
3. Should redirect back and login ✅

### Test Facebook Login
1. Click "Login with Facebook" button
2. Sign in with Facebook account
3. Should redirect back and login ✅

---

## What Client Gets

### Without Credentials
- ✅ Browse properties
- ✅ Create bookings
- ✅ Email/password login
- ⚠️ Payments show "not configured" message
- ⚠️ Google/Facebook buttons show "not configured" message

### With Credentials
- ✅ Browse properties
- ✅ Create bookings
- ✅ Email/password login
- ✅ **Real payments with Stripe/Square** 💰
- ✅ **Google login** 🔵
- ✅ **Facebook login** 🔵
- ✅ Full feature platform 🎉

---

## Cost Considerations

### Stripe
- Free to sign up
- Charges: 2.9% + $0.30 per transaction
- Example: $100 booking = $3.20 fee

### Square
- Free to sign up
- Charges: 2.6% + $0.30 per transaction
- Example: $100 booking = $2.90 fee

### Google OAuth
- Free to set up
- No per-login charges

### Facebook OAuth
- Free to set up
- No per-login charges

---

## Important Notes

1. **Test vs Live Keys:**
   - Client should start with test/sandbox keys
   - After testing, switch to live/production keys
   - Test cards won't charge real money

2. **Redirect URIs must be exact:**
   - Must include `https://`
   - Must match their exact domain
   - If they add custom domain later, update redirect URIs

3. **Timeline:**
   - Stripe setup: 5-10 minutes
   - Google setup: 10-15 minutes
   - Facebook setup: 10-15 minutes
   - Each feature works immediately after credentials added

4. **Security:**
   - Never share secret keys publicly
   - Never commit keys to GitHub
   - Always use Railway environment variables
   - Keys are encrypted at rest

---

## What to Tell Your Client

**For Payments:**
> "To accept real payments, you need to create a Stripe or Square account, get your API keys, and send them to me. I'll add them to the platform and payments will start working immediately. Takes about 10 minutes."

**For Google Login:**
> "To enable Google login, create a Google Cloud app, get your Client ID, and send it to me. I'll add it and the login button will work. Takes about 15 minutes."

**For Facebook Login:**
> "To enable Facebook login, create a Facebook app, get your App ID, and send it to me. I'll add it and the login button will work. Takes about 15 minutes."

---

## Troubleshooting

**Problem:** Payments not working after adding credentials
**Solution:** 
1. Check credentials are exactly right (no extra spaces)
2. Check you restarted the app in Railway
3. Clear browser cache
4. Test with test card

**Problem:** Google login shows "not configured"
**Solution:**
1. Check Client ID added to Railway
2. Check it's under variable name `VITE_GOOGLE_CLIENT_ID`
3. Check app was redeployed
4. Check redirect URI matches in Google console

**Problem:** Facebook login shows "not configured"
**Solution:**
1. Check App ID added to Railway
2. Check it's under variable name `VITE_FACEBOOK_APP_ID`
3. Check app was redeployed
4. Check redirect URI matches in Facebook console

---

## Quick Reference

| Feature | What Client Provides | Setup Time |
|---------|----------------------|-----------|
| Stripe Payments | Secret Key + Publishable Key | 5 mins |
| Square Payments | Access Token + Location ID | 5 mins |
| Google Login | Client ID | 10 mins |
| Facebook Login | App ID | 10 mins |

---

## Summary

Your client needs to:

1. **For Real Payments:** Get Stripe OR Square credentials (takes 5 minutes)
2. **For Google Login:** Get Google Client ID (takes 10 minutes)
3. **For Facebook Login:** Get Facebook App ID (takes 10 minutes)

You then:
1. Add credentials to Railway environment variables
2. Restart app
3. ✅ Features work!

Total setup time: ~20-30 minutes, and your client's platform is fully functional with payments and OAuth! 🚀
