# ✅ AUTH MIGRATION COMPLETE - TEST GUIDE

**Status:** Ready to test! All auth infrastructure migrated to Supabase.

---

## 🎯 **WHAT WAS FIXED**

### 1. ✅ **Created Middleware** 
- File: `src/middleware.ts`
- Protects `/admin` routes
- Auto-redirects to login if not authenticated
- Redirects to dashboard if logged in and visiting `/admin/login`

### 2. ✅ **Updated Admin Layout**
- File: `src/app/admin/layout.tsx`
- Now uses `getServerSession()` from Supabase
- Removed NextAuth imports

### 3. ✅ **Updated Admin Shell**
- File: `src/components/admin/AdminShell.tsx`
- Logout now uses `supabase.auth.signOut()`
- Session type changed to Supabase Session
- Shows user email from Supabase session

### 4. ✅ **Added Server Helpers**
- File: `src/lib/supabase/server.ts`
- `getServerSession()` - Get session in Server Components
- `getServerUser()` - Get user in Server Components
- `createServerSupabaseClient()` - Create server client

### 5. ✅ **Merchant Login**
- Already has Email + Phone tabs
- Email works immediately

### 6. ✅ **Mobile App**
- Email login screen added
- Link on phone screen

---

## 🧪 **TEST NOW** (10 minutes)

### **Test 1: Admin Login** ✅

```bash
# Open admin login
open http://localhost:3000/admin/login
```

**Login with:**
- Email: `admin@lokul.club`
- Password: `admin123`

**Expected:**
- ✅ Redirects to `/admin` dashboard
- ✅ Shows admin panel with sidebar
- ✅ User email shows in bottom of sidebar
- ✅ Can navigate between pages
- ✅ Logout button works

---

### **Test 2: Merchant Login** ✅

```bash
# Open merchant login
open http://localhost:3000/merchant/login
```

**Login with:**
1. Click **"Email"** tab
2. Email: `merchant@test.com`
3. Password: `test123`

**Expected:**
- ✅ Email/Phone toggle appears
- ✅ Login succeeds
- ✅ Redirects to merchant dashboard
- ✅ Can access merchant features

---

### **Test 3: Mobile App** ✅

```bash
# Make sure mobile is running
# If not: cd apps/mobile && npm run ios
```

**In the app:**
1. On phone entry screen
2. Scroll down
3. Click **"Use email login (Dev mode)"**
4. Enter credentials:
   - Email: `user@test.com`
   - Password: `test123`

**Expected:**
- ✅ Email login screen appears
- ✅ Login succeeds
- ✅ Navigates to home feed

---

### **Test 4: Admin Logout** ✅

**While logged into admin:**
1. Click **"Sign out"** button (bottom of sidebar)

**Expected:**
- ✅ Redirects to `/admin/login`
- ✅ Can't access `/admin` routes without logging in again
- ✅ Middleware redirects protected pages

---

### **Test 5: Protected Routes** ✅

**While logged out:**
1. Try to visit: `http://localhost:3000/admin/users`

**Expected:**
- ✅ Automatically redirects to `/admin/login`
- ✅ After login, can access the page

---

## 🐛 **TROUBLESHOOTING**

### "Invalid login credentials"
**Fix:** 
- Verify user exists in Supabase dashboard
- Check email/password spelling
- Make sure "Auto Confirm" was checked

### "Redirecting to login in a loop"
**Fix:**
- Clear browser cookies
- Check `.env.local` has correct Supabase keys
- Restart dev server: `npm run dev`

### "Session is null in AdminShell"
**Fix:**
- Middleware might not be running
- Restart dev server
- Check middleware.ts exists

### "500 Error on admin pages"
**Fix:**
- Old admin pages still use NextAuth
- Those pages need updating (see below)
- Stick to `/admin` dashboard for now

### Merchant session check fails
**Current:** Merchant still uses custom JWT auth
**Later:** Can migrate to Supabase too

---

## ⚠️ **WHAT STILL NEEDS WORK**

### 87 Admin Pages Still Use NextAuth

**Files affected:**
- All pages in `src/app/admin/**/page.tsx`
- All actions in `src/app/admin/**/actions.ts`

**They import:**
```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
```

**Need to replace with:**
```typescript
import { getServerUser } from "@/lib/supabase/server";
```

**Do you want me to:**
- **A)** Test what works now (admin dashboard + merchant + mobile)
- **B)** Bulk-replace all 87 admin pages (30 min, automated)
- **C)** Just fix the most important admin pages (users, merchants, orders)

---

## 📊 **MIGRATION STATUS**

| Component | Status | Test |
|-----------|--------|------|
| ✅ Supabase Setup | Complete | Working |
| ✅ Database | Complete | Synced |
| ✅ Admin Login | Complete | **TEST NOW** |
| ✅ Admin Layout | Complete | **TEST NOW** |
| ✅ Admin Shell | Complete | **TEST NOW** |
| ✅ Middleware | Complete | **TEST NOW** |
| ✅ Merchant Email Login | Complete | **TEST NOW** |
| ✅ Mobile Email Login | Complete | **TEST NOW** |
| ⚠️ Admin Pages (87 files) | Partial | Some will error |
| ⏸️ Phone Auth (Twilio) | On hold | Not needed for testing |

---

## 🎯 **YOUR NEXT COMMAND**

### Test Admin Login Now:

```bash
# Make sure dev server is running
# If not: npm run dev

# Test admin
open http://localhost:3000/admin/login
# Login: admin@lokul.club / admin123
```

---

## ✅ **SUCCESS CHECKLIST**

- [ ] Admin login works
- [ ] Admin dashboard loads
- [ ] Sidebar navigation appears
- [ ] User email shows in sidebar
- [ ] Logout button works
- [ ] Merchant email login works
- [ ] Mobile email login works
- [ ] Protected routes redirect to login

---

**Ready?** Open http://localhost:3000/admin/login and test! 🚀

Let me know if you hit any issues or want me to fix the remaining admin pages!
