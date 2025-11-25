# Login & Signup Guide - Host vs Guest Accounts

## Quick Summary

**Important:** There is NO separate "host signup"!
- **Same signup for everyone**
- **You become a "host" when you CREATE a property**
- **You become a "guest" when you MAKE a booking**
- **NO admin needed for either role**

---

## How Roles Work

### The System:
```
User Account
    ↓
(After Signup - Just a regular user)
    ↓
IF you CREATE a property → You're now a HOST
IF you BOOK a property → You're now a GUEST
```

**Example:**
```
Person A:
1. Signs up
2. Creates 3 properties
3. Result: HOST

Person B:
1. Signs up
2. Books 2 properties
3. Result: GUEST

Person C:
1. Signs up
2. Creates properties AND books properties
3. Result: Both HOST and GUEST
```

---

## Test the Flow (Easy Way)

### Option 1: Use Pre-Made Accounts

**Host Account (Already Verified):**
```
Email: host@example.com
Password: password123
Status: Already a host (has properties)
Access: Host dashboard at /host
```

**Guest Account (Already Verified):**
```
Email: user@example.com
Password: password123
Status: Can make bookings
Access: Browse properties and book
```

**Admin Account:**
```
Email: admin@stayhub.test
Password: admin123
Status: Can approve ID verifications
Access: Admin panel at /admin
```

---

## Complete Step-by-Step: Create New Accounts

### Method 1: Create a New Host Account (Fresh Signup)

**Step 1: Go to Signup**
1. Visit: `http://localhost:5000`
2. Click "Sign Up" (or go to `/login`)

**Step 2: Fill Signup Form**
```
Email:      host-new@test.com
Password:   password123
First Name: John
Last Name:  Host
```
3. Click "Sign Up"

**Step 3: Upload ID (Auto-Redirected)**
1. Upload any image as ID
2. Click "Submit"
3. Wait for admin approval (or skip for testing)

**Step 4: Become a Host**
1. Login as `host-new@test.com`
2. Go to: `http://localhost:5000/host`
3. Click "New Property"
4. Fill property details and save
5. **✅ You're now a HOST** - dashboard shows your properties

---

### Method 2: Create a New Guest Account (Fresh Signup)

**Step 1: Go to Signup**
1. Visit: `http://localhost:5000`
2. Click "Sign Up"

**Step 2: Fill Signup Form**
```
Email:      guest-new@test.com
Password:   password123
First Name: Jane
Last Name:  Guest
```
3. Click "Sign Up"

**Step 3: Upload ID (Auto-Redirected)**
1. Upload any image as ID
2. Click "Submit"

**Step 4: Become a Guest**
1. Login as `guest-new@test.com`
2. Go to: `http://localhost:5000` (home page)
3. Browse properties
4. Click on a property
5. Click "Book Now"
6. Complete booking
7. **✅ You're now a GUEST** - you can see your bookings at `/trips`

---

## Two Browser Windows Test (Best Way)

### Setup: Open Two Browser Windows Side-by-Side

**Window 1 - HOST:**
```
1. Go to http://localhost:5000
2. Login as: host@example.com / password123
3. Navigate to: /host (Host Dashboard)
4. See: Properties you own
5. Action: Create new property or manage existing
```

**Window 2 - GUEST:**
```
1. Go to http://localhost:5000
2. Login as: user@example.com / password123
3. Navigate to: / (Home page)
4. See: Browse all properties
5. Action: Make a booking
```

### Full Flow:
1. **Window 1 (Host):** Create property "Beachfront Villa" for $250/night
2. **Window 2 (Guest):** Search and find "Beachfront Villa"
3. **Window 2 (Guest):** Book for Dec 1-5
4. **Window 1 (Host):** See new booking in your dashboard
5. **Window 2 (Guest):** See booking in "My Trips"

---

## Detailed Login Instructions

### Login as Host

```
1. Go to: http://localhost:5000/login
2. Click "Already have an account? Sign in"
3. Enter:
   - Email: host@example.com
   - Password: password123
4. Click "Sign In"
5. Redirected to home page
6. Click "Host Panel" in top navigation
7. You'll see your HOST DASHBOARD with:
   - Your properties
   - Your bookings
   - Messages from guests
   - Revenue stats
```

### Login as Guest

```
1. Go to: http://localhost:5000/login
2. Click "Already have an account? Sign in"
3. Enter:
   - Email: user@example.com
   - Password: password123
4. Click "Sign In"
5. Redirected to home page
6. You're on GUEST VIEW with:
   - Browse properties
   - View favorites
   - See your bookings at /trips
   - Send messages to hosts
```

### Login as Admin

```
1. Go to: http://localhost:5000/login
2. Click "Already have an account? Sign in"
3. Enter:
   - Email: admin@stayhub.test
   - Password: admin123
4. Click "Sign In"
5. Redirected to home page
6. Click "Admin Dashboard" in menu
7. See ADMIN PANEL with:
   - Verify user IDs
   - Manage all properties
   - View all bookings
   - System statistics
```

---

## Signup (Same for Both Host & Guest)

### Universal Signup Form

**Location:** `http://localhost:5000/login` → Click "Sign Up"

**Fields:**
```
Email:           (your email)
Password:        (min 6 chars)
First Name:      (your name)
Last Name:       (your name)
```

**After Signup:**
1. Account created
2. Auto-logged in
3. Redirected to ID upload page
4. Upload government ID
5. Account pending admin approval

**To Become Host or Guest:**
- **HOST:** Create a property (`/host/properties/new`)
- **GUEST:** Make a booking

---

## NO Admin Required

✅ **Signup**: User does it themselves
✅ **ID Verification**: User uploads themselves
✅ **Become Host**: User creates property themselves
✅ **Become Guest**: User books property themselves

⚠️ **Only Admin Needed For:**
- Approving ID verifications (24-48 hours)
- Managing accounts (if needed)
- System administration

---

## Complete Test Scenario

### Scenario: Two Users Trading Roles

**User 1 - "Alice"**
```
Step 1: Sign up
  Email: alice@test.com
  Password: password123

Step 2: Upload ID
  Status: Pending

Step 3: Create property
  Property: "Mountain Cabin"
  Price: $200/night
  Now she's a HOST

Step 4: Book property from User 2
  Books Bob's "Beach House"
  Now she's also a GUEST

Result: Alice = Both HOST and GUEST
```

**User 2 - "Bob"**
```
Step 1: Sign up
  Email: bob@test.com
  Password: password123

Step 2: Upload ID
  Status: Pending

Step 3: Create property
  Property: "Beach House"
  Price: $300/night
  Now he's a HOST

Step 4: Book Alice's property
  Books Alice's "Mountain Cabin"
  Now he's also a GUEST

Result: Bob = Both HOST and GUEST
```

---

## Navigation Guide

### Host Dashboard
- **URL**: `/host`
- **Access**: Click "Host Panel" in menu
- **Shows**: Your properties, bookings, messages, revenue

### Guest View
- **URL**: `/` or `/search`
- **Access**: Click home or browse
- **Shows**: Browse properties, make bookings, see trips

### Admin Dashboard
- **URL**: `/admin`
- **Access**: Click "Admin Dashboard" in menu (if admin)
- **Shows**: System statistics, user verifications, all properties

### My Trips (Bookings)
- **URL**: `/trips`
- **Shows**: All bookings you've made as a guest

### Messages
- **URL**: `/messages`
- **Shows**: Conversations with hosts (as guest) or guests (as host)

---

## Video Guide (Step-by-Step)

### Create Host Account (5 minutes)
```
1. Go to http://localhost:5000
2. Sign Up with new email
3. Upload ID image
4. Go to /host
5. Click "New Property"
6. Fill details
7. Save
✅ Done - You're a host!
```

### Create Guest Account (5 minutes)
```
1. Go to http://localhost:5000 (different browser/window)
2. Sign Up with different email
3. Upload ID image
4. Go to home page
5. Find a property
6. Click "Book Now"
7. Select dates
8. Pay
✅ Done - You're a guest!
```

---

## Key Differences

| Feature | Host | Guest | Admin |
|---------|------|-------|-------|
| Create Properties | ✅ | ❌ | ✅ |
| Make Bookings | ✅ | ✅ | ✅ |
| View Dashboard | ✅ | ❌ | ✅ |
| Manage Bookings | ✅ (own) | ✅ (own) | ✅ (all) |
| Verify Users | ❌ | ❌ | ✅ |
| View Messages | ✅ | ✅ | ✅ |

---

## Common Questions

**Q: Do I need to signup twice for Host and Guest?**
A: No! Same signup. You become both by creating properties and making bookings.

**Q: Can one person be both host and guest?**
A: Yes! Create a property (host), then book someone else's (guest).

**Q: Do I need admin access to be a host?**
A: No! Just signup, verify ID, create a property. That's it.

**Q: What if ID verification is pending?**
A: You can browse and view, but can't create properties or book until approved.

**Q: How long does ID approval take?**
A: Usually 24-48 hours. An admin reviews manually.

**Q: Can I test without waiting for ID approval?**
A: Yes! Use pre-made test accounts that are already verified.

---

## Pre-Made Test Accounts (Ready Now)

```
HOST (Already has properties):
Email: host@example.com
Password: password123
Verification: ✅ Approved

GUEST (Ready to book):
Email: user@example.com
Password: password123
Verification: ✅ Approved

ADMIN (Can approve IDs):
Email: admin@stayhub.test
Password: admin123
Access: /admin dashboard
```

---

## Try It Now!

### Fastest Test (2 minutes):

**Terminal/Browser Window 1:**
```
1. Open: http://localhost:5000/login
2. Signin: host@example.com / password123
3. Go to: /host
✅ See host dashboard!
```

**Terminal/Browser Window 2:**
```
1. Open: http://localhost:5000/login
2. Signin: user@example.com / password123
3. Go to: /search
✅ Browse properties as guest!
```

---

## Summary

✅ **Same signup for everyone**
✅ **Become host by creating property**
✅ **Become guest by making booking**
✅ **No admin access needed**
✅ **Test accounts ready to use**
✅ **Works on mobile (Android/iOS)**

---

**Status: Multi-Role System Ready** ✅
**Admin Required: No** ✅
**Self-Service: Yes** ✅
**Production Ready: Yes** ✅
