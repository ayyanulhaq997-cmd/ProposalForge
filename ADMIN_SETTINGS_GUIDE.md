# Admin Account Settings - Complete Guide

## How Admin Can Change Email and Password

### Accessing Admin Settings

1. **Login as Admin**
   - Email: `admin@stayhub.test`
   - Password: `admin123`

2. **Go to Admin Panel**
   - Visit: `http://localhost:5000/admin/settings`
   - Or click Settings in the admin dashboard

### Changing Email Address

**Step-by-Step:**
1. On the Admin Settings page, scroll to "Change Email Address" section
2. Enter your new email in the "New Email Address" field
3. Click "Update Email" button
4. Success message confirms: "Email updated successfully"
5. Your admin account email is now changed

**Important:**
- Email must be unique (no other account can use it)
- You'll use the new email to log in next time

### Changing Password

**Step-by-Step:**
1. On the Admin Settings page, scroll to "Change Password" section
2. Enter your **Current Password** (required for security)
3. Enter your **New Password** (minimum 6 characters)
4. **Confirm New Password** - must match exactly
5. Click "Update Password" button
6. Success message: "Password updated successfully. Please log in again."
7. You'll be logged out and must log in with the new password

**Important:**
- You MUST enter current password correctly
- New password must be at least 6 characters
- Passwords must match or you'll get an error
- After changing, you must log in again

### API Endpoints (For Reference)

**Change Email:**
```bash
PATCH /api/admin/settings/email
Authorization: Required (Admin only)
Body: { "email": "newemail@example.com" }
```

**Change Password:**
```bash
PATCH /api/admin/settings/password
Authorization: Required (Admin only)
Body: { 
  "currentPassword": "admin123",
  "newPassword": "newpassword456"
}
```

### Current Account Information

When you visit the Admin Settings page, you'll see:
- ✅ Current Admin Email
- ✅ Admin Role (displays as "admin")
- ✅ Both change forms ready to use

### Security Features

✅ Current password required to change password
✅ Email uniqueness validation
✅ Password hashing with bcrypt
✅ Admin-only endpoints (requires authentication)
✅ Audit logging of all changes

### Test It Now

1. **Login**: admin@stayhub.test / admin123
2. **Visit**: /admin/settings
3. **Try changing email** to: newemail@test.com
4. **Try changing password** - enter current + new
5. **Verify** - log out and log in with new credentials

### Troubleshooting

**"Email already in use" error**
- Another account has that email
- Choose a different email address

**"Current password is incorrect" error**
- You entered the wrong current password
- Try again with the correct password

**"Passwords do not match" error**
- The new password and confirm fields don't match
- Make sure they're exactly the same

**"Password must be at least 6 characters" error**
- Your new password is too short
- Use at least 6 characters

---

**Admin Settings Endpoint**: `/admin/settings`
**Default Admin Email**: `admin@stayhub.test`
**Default Admin Password**: `admin123`
