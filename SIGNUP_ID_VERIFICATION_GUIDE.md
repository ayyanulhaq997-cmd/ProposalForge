# Signup & ID Verification Guide - User Self-Service

## Complete User Signup Flow

Users can signup and upload ID verification **WITHOUT admin access**. It's a self-service process!

---

## Step 1: Access Signup Page

1. Go to: `http://localhost:5000`
2. Click **"Sign Up"** button (or go to `/login`)
3. Click **"Don't have an account? Sign up"** link

---

## Step 2: Fill Signup Form

**Form Fields:**

```
Email:           user@example.com
Password:        mypassword123 (min 6 chars)
First Name:      John
Last Name:       Smith
```

**Click "Sign Up" Button**

---

## Step 3: ID Verification Upload (Automatic)

After signup, you're **automatically redirected** to ID verification page!

### What You'll See:

```
"ID Verification Required"
"Please upload a valid government-issued ID"

Options:
- Passport
- Driver's License  
- National ID Card
```

**Upload Your ID:**
1. Click "Choose File"
2. Select image of ID (JPG/PNG)
3. Click "Submit for Verification"

### Accepted ID Types:
✅ Passport
✅ Driver's License
✅ National ID Card
✅ Any government-issued ID

---

## Step 4: Wait for Admin Approval

**Status Page: `/verify`**

After upload, you'll see:
```
"Verification Status: Pending"
"Your ID is being reviewed by our team"
"This typically takes 24-48 hours"
```

**Options:**
- Check status anytime
- See submission details
- View current status

---

## Step 5: Access After Approval

**When Admin Approves:**

✅ Email notification sent
✅ Status changes to "Approved"
✅ Full access to features:
   - Create properties (as host)
   - Make bookings (as guest)
   - Send messages
   - View dashboard

---

## Complete User Journey

```
1. User clicks "Sign Up"
   ↓
2. Fill email, password, name
   ↓
3. Click "Sign Up" button
   ↓
4. Automatically redirected to ID upload
   ↓
5. Upload government ID
   ↓
6. See "Pending" status
   ↓
7. Wait for admin approval (24-48 hours)
   ↓
8. Get email: "ID Verified!"
   ↓
9. Full access granted
   ↓
10. Can use all features
```

---

## Test Accounts (Pre-Verified)

If you want to test without waiting for verification:

```
Host Account (Already Verified):
Email: host@example.com
Password: password123

Guest Account (Already Verified):
Email: user@example.com
Password: password123

Admin Account:
Email: admin@stayhub.test
Password: admin123
```

---

## What Happens at Each Stage

### Stage 1: Signup
- User creates account with email/password
- Account created in database
- User logged in automatically

### Stage 2: Redirect to Verification
- If user NOT verified yet → redirect to `/verify-required`
- ID verification form shown
- User uploads document

### Stage 3: Pending Review
- ID stored in database
- Status = "pending"
- Admin can see in dashboard
- User sees "Pending" status

### Stage 4: Admin Reviews (In Admin Panel)
- Admin goes to `/admin`
- Clicks "Verify Users" or similar
- Reviews uploaded IDs
- Clicks "Approve" or "Reject"

### Stage 5: User Notification
- If approved → user gets full access
- If rejected → user can re-upload
- Email notification sent

---

## Checking Verification Status

**As User:**

1. After uploading ID, go to `/verify`
2. You'll see:
   ```
   Status: Pending (or Approved/Rejected)
   Submitted: 2024-11-25 at 10:30 AM
   Document: Showing
   Message: "We're reviewing your ID..."
   ```

3. Check email for approval notification

---

## User Restrictions (Before Approval)

**Before ID is Approved, users CANNOT:**
- ❌ Create properties (host feature)
- ❌ Make bookings (guest feature)
- ❌ Send messages
- ❌ Access host dashboard
- ❌ View bookings

**They CAN still:**
- ✅ Login
- ✅ Browse properties
- ✅ View property details
- ✅ Check their verification status

---

## API Endpoints (For Reference)

### Signup
```
POST /api/auth/signup
Body: {
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Smith"
}
Response: 201 - User created, logged in
```

### Upload ID
```
POST /api/id-verification
Authorization: Required
Body: multipart/form-data
  - file: (ID image)
Response: 201 - Verification submitted
```

### Check Status
```
GET /api/id-verification/status
Authorization: Required
Response: {
  "status": "pending",
  "submittedAt": "2024-11-25T10:30:00Z"
}
```

---

## Troubleshooting

### "ID verification page not showing"
- Make sure you just signed up
- Try going to `/verify-required` directly
- Check you're logged in

### "File upload fails"
- Use JPG or PNG format
- File must be under 10MB
- Make sure it's a clear photo of ID

### "Still shows pending after approval"
- Refresh the page (Ctrl+R)
- Log out and log back in
- Browser cache might be old

### "Can't make bookings"
- Check verification status first
- If still "Pending", wait for approval
- Try logging out and back in

---

## Admin Verification Panel

**Admins can approve/reject at:** `/admin`

Path:
1. Login as admin: `admin@stayhub.test`
2. Go to `/admin`
3. Click "Users" or "Verify Users"
4. See list of pending IDs
5. Click "Approve" or "Reject"
6. User gets notification

---

## Security Features

✅ **Users upload directly** - No need for admin help
✅ **Secure file upload** - Files scanned
✅ **Review process** - Admin verifies authenticity
✅ **Data protection** - ID data encrypted
✅ **Clear status** - Users always know where they stand

---

## Timeline

```
User Action → Immediate
Upload ID → Instant confirmation
Admin Review → 24-48 hours typically
Approval Email → Automatic
Feature Access → Immediate after approval
```

---

## What to Tell New Users

**Simple explanation:**

"Welcome! To use our platform:
1. Sign up with your email
2. Upload a photo of your government ID
3. We'll review it in 24-48 hours
4. Once approved, you'll get an email
5. Then you can book properties and host!"

---

## Key Points

✅ **Self-service**: Users do signup + ID upload themselves
✅ **No admin needed**: Happens automatically
✅ **Clear status**: Users always know verification status
✅ **Safe**: Admins review before granting access
✅ **Mobile-ready**: Works on Android/iOS
✅ **Fast**: Usually approved within 24 hours

---

## Test the Signup Flow

1. Go to `http://localhost:5000`
2. Click "Sign Up"
3. Enter:
   - Email: testuser@example.com
   - Password: password123
   - First Name: Test
   - Last Name: User
4. Click "Sign Up"
5. **Automatically redirected to ID upload**
6. Upload any image
7. See "Pending" status
8. Done! (Admin approves later)

---

**Status: User Signup with ID Verification Ready** ✅
**Self-Service: Yes** ✅
**No Admin Access Needed: Yes** ✅
**Mobile-Ready: Yes** ✅
