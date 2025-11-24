# Square Payment Integration - Production Deployment Guide

**Platform:** Railway.app  
**Payment Provider:** Square  
**Status:** ✅ Ready for Production  
**Last Updated:** November 24, 2025

---

## Overview

The ProposalForge vacation rental booking platform is fully configured to accept **real Square payments**. All you need to do is add your Square credentials to the production environment.

---

## Step 1: Get Your Square Credentials

### Create/Access Your Square Account

1. Go to **https://developer.squareup.com**
2. Sign up or log in with your Square account
3. Accept the developer terms

### Find Your Production Credentials

1. Click **Applications** in the left sidebar
2. Select your application (or create a new one)
3. Click the **Credentials** tab
4. Under "Production" section, you'll find:
   - **Application ID** (looks like: `sq_prod_xxxxx...`)
   - **Access Token** (looks like: `sq_0_xxxxxxxxxxxxx...`)

### Find Your Location ID

1. Click **Locations** in the left sidebar
2. Select your primary location
3. Copy the **Location ID** (looks like: `L12345678...`)

---

## Step 2: Add Credentials to Railway

### Via Railway Dashboard

1. Go to **https://railway.app**
2. Select your **ProposalForge** project
3. Click the **Variables** tab
4. Add these 3 variables:

| Key | Value |
|-----|-------|
| `VITE_SQUARE_APPLICATION_ID` | Your production Application ID (sq_prod_...) |
| `VITE_SQUARE_LOCATION_ID` | Your Location ID (L...) |
| `SQUARE_ACCESS_TOKEN` | Your production Access Token (sq_0_...) |

5. Click **Save**
6. Railway will auto-redeploy (2-3 minutes)

### Via Railway CLI (Alternative)

```bash
railway link
railway variables set VITE_SQUARE_APPLICATION_ID=sq_prod_xxxxx
railway variables set VITE_SQUARE_LOCATION_ID=L12345678
railway variables set SQUARE_ACCESS_TOKEN=sq_0_xxxxx
railway up
```

---

## Step 3: Test Payment Integration

### Test Card Details (Square Sandbox)

If you want to keep test mode:
- **Card Number:** 4111 1111 1111 1111
- **Expiry:** Any future date
- **CVC:** Any 3 digits
- **Postal Code:** 12345

### Test Payment Flow

1. Go to your deployed app: `https://proposalforge-production-0b37.up.railway.app/`
2. Browse a property
3. Click "Book Now"
4. Enter test card details
5. Click "Pay"
6. Should see **"Payment successful"** ✅

### Real Payment Testing

To test with **real production credentials**:
1. Use a real card or test card (same as above)
2. In production mode, Square will charge real money
3. Transaction appears in your Square Dashboard

---

## Environment Variables Reference

### Frontend Variables (Visible in Browser)

```
VITE_SQUARE_APPLICATION_ID = Your Square app ID
VITE_SQUARE_LOCATION_ID = Your Square location ID
```

**These are safe to expose** - they're public frontend keys.

### Backend Variables (Secret - Never Exposed)

```
SQUARE_ACCESS_TOKEN = Your Square access token
SQUARE_LOCATION_ID = Your Square location ID
```

**These are private** - only used on server, never shown to users.

---

## Payment Flow

When a customer makes a booking:

```
1. Customer selects dates on property page
2. Clicks "Proceed to Payment"
3. Payment page loads with Square payment form
4. Customer enters card details
5. Form securely tokenizes the card with Square
6. Card data never touches your server ✅
7. Booking confirmed
8. Payment appears in Square Dashboard
```

---

## Checking Payments in Square Dashboard

After payments are processed:

1. Go to **https://dashboard.squareup.com**
2. Click **Transactions** in the left sidebar
3. View all payments received
4. See refunds, fees, and earnings

---

## What Happens When Deployed

### Before (Dev/Testing)
```
Sandbox credentials active
Test payments show "Payment successful"
No real money charged
```

### After (Production)
```
✅ Real Square credentials active
✅ Real payments processed
✅ Money goes to your Square account
✅ Full booking history in Dashboard
```

---

## Troubleshooting

### Problem: "Payment credentials not configured"

**Cause:** Square credentials not added to environment variables

**Solution:**
1. Double-check credentials are added to Railway Variables
2. Verify exact spelling of variable names
3. Wait 2-3 minutes for deployment to complete
4. Refresh the browser

### Problem: "Invalid Application ID"

**Cause:** Wrong Application ID format or incorrect credentials

**Solution:**
1. Verify you copied the PRODUCTION Application ID (starts with `sq_prod_`)
2. Don't use sandbox credentials on production
3. Re-check in Square Dashboard

### Problem: "Payment declined"

**Cause:** Card declined by Square (could be fraud detection, insufficient funds, etc.)

**Solution:**
1. Customer should try a different card
2. Contact Square support if persistent
3. Check Square Dashboard for decline reason

---

## Security Best Practices

✅ **DO:**
- Store `SQUARE_ACCESS_TOKEN` in environment variables only
- Use production credentials on Railway
- Enable HTTPS (Railway does this automatically)
- Monitor Square Dashboard for unusual activity
- Keep your application ID private

❌ **DON'T:**
- Hardcode credentials in code
- Commit credentials to GitHub
- Share your Access Token publicly
- Use sandbox credentials on production

---

## Cost Breakdown

### Square Pricing

- **Card Payment Fee:** 2.6% + $0.30 per transaction
- **Example:** $100 booking = $2.90 fee

### Your Cost

```
Booking Amount:        $100.00
Square Fee (2.6%):     $2.60
Fixed Fee:             $0.30
Total Fee:             $2.90
Net Revenue:           $97.10
```

---

## FAQ

**Q: Can I switch to test mode later?**  
A: Yes, just update the variables with sandbox credentials. Railway will auto-redeploy.

**Q: What if I need to change locations?**  
A: Update `VITE_SQUARE_LOCATION_ID` and `SQUARE_LOCATION_ID` with new Location ID.

**Q: Do I need to update the app code?**  
A: No! The app is pre-configured for Square. Just add credentials.

**Q: How do I handle refunds?**  
A: Use the Square Dashboard to issue refunds. The app will track refund status automatically.

**Q: Can customers save cards?**  
A: Yes! The Square integration supports saved cards. Customers can save their card for future bookings.

**Q: What if payment fails?**  
A: Customer sees an error and can try again. Booking is not created until payment succeeds.

---

## Production Checklist

Before going live with real bookings:

- [ ] Square account created and verified
- [ ] Production credentials obtained
- [ ] Credentials added to Railway Variables
- [ ] App redeployed on Railway
- [ ] Test payment successful with real/test card
- [ ] Payment appears in Square Dashboard
- [ ] Refund tested (optional but recommended)
- [ ] Custom domain configured (if applicable)
- [ ] Email notifications working
- [ ] Admin dashboard accessible

---

## Support

### Square Support
- **Website:** https://squareup.com/help
- **Developer Docs:** https://developer.squareup.com/docs

### Railway Support
- **Website:** https://railway.app/help
- **Status:** https://www.railwaystatus.com

### Your App Support
- All data is stored in PostgreSQL
- Chat system fully functional
- Admin panel accessible for managing properties
- Email notifications sent for all bookings

---

## Timeline

| Step | Time |
|------|------|
| Get Square credentials | 5 min |
| Add to Railway Variables | 2 min |
| Wait for deployment | 3 min |
| Test payment | 5 min |
| **Total** | **~15 min** |

---

## Summary

Your ProposalForge app is **production-ready for real payments**. Simply:

1. ✅ Get Square credentials (5 minutes)
2. ✅ Add to Railway environment variables (2 minutes)
3. ✅ Test with real/test card (5 minutes)
4. ✅ Go live! 🚀

All payment infrastructure is already built in. You just need to add your credentials.

---

**Status:** ✅ Ready for Production Deployment  
**Payment Provider:** Square  
**Database:** PostgreSQL (Neon)  
**Hosting:** Railway.app  
**Last Updated:** November 24, 2025
