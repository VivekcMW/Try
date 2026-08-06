# ✅ Supabase Migration Testing Checklist

Run through these tests to verify the migration is complete and working.

---

## 🔧 Pre-Test Setup

- [ ] Dev server is running: http://localhost:3000
  ```bash
  # If not running:
  cd /Users/vivekanandchoudhari/try/lokul.club
  npm run dev
  ```

- [ ] Test users exist in Supabase
  - Visit: https://supabase.com/dashboard/project/ewjvjabcoedsyxjnener/auth/users
  - Verify: admin@lokul.club, merchant@test.com, user@test.com

---

## 1️⃣ Admin Dashboard Tests

### Basic Login
- [ ] Open http://localhost:3000/admin/login
- [ ] Form shows "Admin Login" with Lokul branding
- [ ] Enter: admin@lokul.club / admin123
- [ ] Click "Sign In"
- [ ] ✅ Redirects to /admin/dashboard
- [ ] ✅ Dashboard page loads (shows stats, charts)

### Navigation
- [ ] Click "Users" in sidebar
- [ ] ✅ Users page loads, shows user table
- [ ] Click "Communities" in sidebar
- [ ] ✅ Communities page loads
- [ ] Click "Events" in sidebar
- [ ] ✅ Events page loads
- [ ] Click "Merchants" in sidebar
- [ ] ✅ Merchants page loads

### Session Persistence
- [ ] Refresh the page (Cmd+R / Ctrl+R)
- [ ] ✅ Still logged in, page reloads correctly
- [ ] Open new tab: http://localhost:3000/admin/dashboard
- [ ] ✅ Loads directly without login prompt

### Logout
- [ ] Click avatar/dropdown in top-right
- [ ] Click "Logout"
- [ ] ✅ Redirects to /admin/login
- [ ] Try opening: http://localhost:3000/admin/dashboard
- [ ] ✅ Redirects to /admin/login (protected route)

---

## 2️⃣ Merchant Web App Tests

### Basic Login (Email)
- [ ] Open http://localhost:3000/merchant/login
- [ ] ✅ See "Email" and "Phone" tabs at top
- [ ] Click "Email" tab
- [ ] Enter: merchant@test.com / test123
- [ ] Click "Sign In"
- [ ] ✅ Redirects to merchant dashboard
- [ ] ✅ Dashboard loads with merchant data

### Phone Tab (Visual Check)
- [ ] Click "Phone" tab
- [ ] ✅ Shows phone number input
- [ ] ✅ Shows "(Twilio required)" message
- [ ] ⚠️ Don't test OTP (Twilio not configured)
- [ ] Switch back to "Email" tab
- [ ] ✅ Shows email/password form

### Logout
- [ ] Find logout button (top-right or menu)
- [ ] Click logout
- [ ] ✅ Redirects to /merchant/login

---

## 3️⃣ Mobile App Tests (Optional)

### Start Mobile App
- [ ] Open terminal
  ```bash
  cd /Users/vivekanandchoudhari/try/lokul.club/apps/mobile
  npm start
  ```
- [ ] ✅ Expo dev server starts
- [ ] Press `i` for iOS simulator or `a` for Android
- [ ] Or scan QR code with Expo Go app

### Email Login Fallback
- [ ] App shows phone number entry screen
- [ ] ✅ See link: "Use email login (Dev mode)"
- [ ] Tap the link
- [ ] ✅ Navigates to email login screen
- [ ] Enter: user@test.com / test123
- [ ] Tap "Sign In"
- [ ] ✅ Navigates to home screen (app tabs)

### Phone OTP (Visual Check Only)
- [ ] Go back to phone screen
- [ ] ✅ Shows phone input
- [ ] ⚠️ Don't test OTP (Twilio not configured)

---

## 4️⃣ Error Checks

### Invalid Credentials
- [ ] Admin login with: admin@lokul.club / wrongpassword
- [ ] ✅ Shows error: "Invalid credentials" or similar
- [ ] ✅ Stays on login page

### Non-Existent User
- [ ] Admin login with: fake@test.com / password123
- [ ] ✅ Shows error: "Invalid credentials"

### Empty Fields
- [ ] Try submitting login form with empty email/password
- [ ] ✅ Shows validation errors or disabled submit button

---

## 5️⃣ Middleware Checks

### Protected Routes
- [ ] Logout from admin
- [ ] Try opening: http://localhost:3000/admin/dashboard
- [ ] ✅ Redirects to /admin/login
- [ ] Try opening: http://localhost:3000/admin/users
- [ ] ✅ Redirects to /admin/login

### Login Page Redirect
- [ ] Login as admin
- [ ] Go to: http://localhost:3000/admin/login
- [ ] ✅ Redirects to /admin/dashboard (already logged in)

---

## 6️⃣ Browser DevTools Checks

### Console Errors
- [ ] Open browser DevTools (F12)
- [ ] Check Console tab during login
- [ ] ✅ No red errors (warnings OK)

### Network Tab
- [ ] Open Network tab
- [ ] Login as admin
- [ ] ✅ See POST to Supabase auth endpoint
- [ ] ✅ Status 200 (successful)
- [ ] ✅ Response contains session data

### Cookies
- [ ] Open Application/Storage tab
- [ ] Check Cookies for localhost:3000
- [ ] After login: ✅ See Supabase cookies (sb-*)
- [ ] After logout: ✅ Cookies removed

---

## 7️⃣ TypeScript Compilation

- [ ] Run TypeScript check
  ```bash
  cd /Users/vivekanandchoudhari/try/lokul.club
  npx tsc --noEmit
  ```
- [ ] ✅ No errors related to auth (other errors OK)

---

## 8️⃣ Build Check (Optional)

- [ ] Try production build
  ```bash
  npm run build
  ```
- [ ] ✅ Build completes successfully
- [ ] ⚠️ Can stop build after it starts (Ctrl+C)

---

## 🎯 Expected Results

### ✅ All Tests Pass
If all checkboxes above are checked:
- Migration is **100% complete**
- Supabase auth is **fully functional**
- All platforms are **working correctly**

### ❌ If Any Test Fails

#### Login doesn't work
1. Check Supabase dashboard → Users exist
2. Check .env.local has correct keys
3. Restart dev server: `npm run dev`

#### Middleware redirect doesn't work
1. Check src/middleware.ts exists
2. Restart dev server
3. Clear browser cookies (DevTools → Application → Clear site data)

#### Mobile app can't connect
1. Check apps/mobile/.env has correct keys
2. Restart Expo: `npm start --clear`
3. Check app.config.js loads env vars

#### TypeScript errors
1. Check imports in affected files
2. Run: `npm install` (reinstall dependencies)
3. Restart VS Code TypeScript server

---

## 📊 Test Results Summary

Date: ___________________

| Test Category | Status | Notes |
|---|---|---|
| Admin Login | ⬜ Pass ⬜ Fail | |
| Admin Navigation | ⬜ Pass ⬜ Fail | |
| Admin Logout | ⬜ Pass ⬜ Fail | |
| Merchant Email Login | ⬜ Pass ⬜ Fail | |
| Merchant Logout | ⬜ Pass ⬜ Fail | |
| Mobile Email Login | ⬜ Pass ⬜ Fail | |
| Middleware Protection | ⬜ Pass ⬜ Fail | |
| Error Handling | ⬜ Pass ⬜ Fail | |
| TypeScript Check | ⬜ Pass ⬜ Fail | |

---

## 🚀 After All Tests Pass

1. **Clean up backup files**
   ```bash
   cd /Users/vivekanandchoudhari/try/lokul.club
   find src/app/admin -name "*.backup" -delete
   find src/app/api/admin -name "*.backup" -delete
   echo "✅ Backup files removed"
   ```

2. **Commit changes to git**
   ```bash
   git add .
   git commit -m "Migrate from NextAuth to Supabase - 82 files updated"
   ```

3. **Optional: Remove NextAuth**
   ```bash
   npm uninstall next-auth
   rm src/lib/auth.ts
   ```

4. **When ready for Twilio**
   - See: TWILIO_SETUP_GUIDE.md
   - Configure in Supabase dashboard
   - Test phone OTP

---

**🎉 Happy Testing!**

Questions? Check:
- MIGRATION_SUCCESS.md - Quick summary
- MIGRATION_COMPLETE_REFERENCE.md - Full technical reference
- AUTH_TESTING_GUIDE.md - Detailed testing scenarios
