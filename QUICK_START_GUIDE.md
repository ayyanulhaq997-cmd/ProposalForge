# Quick Start Guide - Login & Test Everything

## 30 Second Quick Start

### Option A: Test With Pre-Made Accounts (Easiest)

**Window 1 - Login as HOST:**
```
1. Visit: http://localhost:5000/login
2. Email: host@example.com
3. Password: password123
4. Click Login
5. Click "Host Panel" → See your properties
```

**Window 2 - Login as GUEST:**
```
1. Visit: http://localhost:5000
2. Search for properties
3. Click "Book Now" to make a booking
```

---

## Accounts Ready to Use

| Role | Email | Password |
|------|-------|----------|
| Host | host@example.com | password123 |
| Guest | user@example.com | password123 |
| Admin | admin@stayhub.test | admin123 |

All pre-verified and ready to go!

---

## Step-by-Step: Test Everything

### 1. Login as HOST
1. Go to `http://localhost:5000/login`
2. Enter: `host@example.com` / `password123`
3. Click "Sign In"
4. Click "Host Panel"
5. **See your properties!**

### 2. Login as GUEST
1. Go to `http://localhost:5000/login`
2. Enter: `user@example.com` / `password123`
3. Click "Sign In"
4. Go to home page
5. **Browse and book properties!**

### 3. Login as ADMIN
1. Go to `http://localhost:5000/login`
2. Enter: `admin@stayhub.test` / `admin123`
3. Click "Sign In"
4. Click "Admin Dashboard"
5. **See system stats and verify IDs!**

---

## Create New Accounts (Testing)

### New Host Account

```
1. Go to http://localhost:5000
2. Click "Sign Up"
3. Fill form:
   - Email: newhosт@test.com
   - Password: password123
   - First Name: Your Name
   - Last Name: Last Name
4. Click "Sign Up"
5. Upload ID image
6. Go to /host → Create property
✅ You're a host!
```

### New Guest Account

```
1. Go to http://localhost:5000 (different window)
2. Click "Sign Up"
3. Fill form:
   - Email: newguest@test.com
   - Password: password123
   - First Name: Your Name
   - Last Name: Last Name
4. Click "Sign Up"
5. Upload ID image
6. Browse properties → Click "Book Now"
✅ You're a guest!
```

---

## Key Features to Test

### As HOST:
- ✅ View your properties
- ✅ Create new property
- ✅ Update pricing
- ✅ Block dates on calendar
- ✅ See bookings
- ✅ Chat with guests

### As GUEST:
- ✅ Browse properties
- ✅ View property details
- ✅ Make bookings
- ✅ View your trips
- ✅ Message hosts
- ✅ Add to favorites

### As ADMIN:
- ✅ Verify user IDs
- ✅ View dashboard stats
- ✅ Manage settings
- ✅ See all bookings

---

## Test Two-User Chat

### Setup (2 Browser Windows):

**Window 1:**
```
1. Login as: host@example.com
2. Go to: /host
3. Wait for messages
```

**Window 2:**
```
1. Login as: user@example.com
2. Go to: /messages
3. Send message: "Hi, interested in your property!"
```

**Window 1:**
```
✅ See message appear instantly!
✅ Type response
✅ Window 2 sees it instantly!
```

---

## Test Dark Mode

**Android/iOS:**
1. Settings → Display → Dark theme → ON
2. App automatically switches to dark colors
3. Go back to Light mode
4. App switches back

**Browser:**
1. Press F12 (Dev Tools)
2. Ctrl+Shift+P
3. Type: "emulate CSS media"
4. Select: "prefers-color-scheme: dark"
5. App switches to dark instantly

---

## Troubleshooting

**"Can't login"**
- Make sure caps lock is off
- Try username again: `host@example.com` (lowercase)
- Password: `password123`

**"ID verification stuck on pending"**
- Admin needs to approve (use admin account)
- Or use pre-made test accounts that are already approved

**"Can't see host dashboard"**
- Make sure you're logged in as host
- Go to `/host`
- Click "Host Panel" in menu

**"Can't make bookings"**
- Make sure you're logged in as guest
- Go to `/` (home)
- Find a property
- Click "Book Now"

---

## Done? Try This:

1. ✅ Login as both host and guest
2. ✅ Host creates property
3. ✅ Guest books it
4. ✅ Chat in real-time
5. ✅ Test dark mode
6. ✅ Test on mobile

**Everything working?** You're ready to deploy! 🚀

---

**Guides Available:**
- `LOGIN_SIGNUP_ROLES_GUIDE.md` - Complete role explanation
- `REAL_TIME_CHAT_TESTING.md` - Chat system testing
- `OS_DARK_MODE_GUIDE.md` - Dark mode on mobile
- `PROPERTY_MANAGEMENT_GUIDE.md` - Create/update/delete properties
- `SIGNUP_ID_VERIFICATION_GUIDE.md` - User verification process
