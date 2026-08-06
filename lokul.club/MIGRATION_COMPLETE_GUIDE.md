# Supabase Migration - Complete Guide

## ✅ What We've Done

All three platforms have been migrated to Supabase authentication:

### 1. **Mobile App** ✅
- Phone OTP authentication via Supabase
- Updated screens: `(onboarding)/phone.tsx` and `(onboarding)/otp.tsx`
- Now uses: `sendPhoneOTP()` and `verifyPhoneOTP()` from `lib/supabase.ts`

### 2. **Merchant App** ✅  
- Phone OTP authentication via Supabase
- Updated: `merchant/login/page.tsx`
- Now uses: Supabase Auth directly with `signInWithOtp()` and `verifyOtp()`

### 3. **Admin Dashboard** ✅
- Email/password authentication via Supabase
- Updated: `admin/login/page.tsx`
- Now uses: `useEmailAuth()` hook with Supabase

### 4. **Client Utilities** ✅
Created comprehensive Supabase clients:
- `src/lib/supabase/server.ts` - Server-side admin client
- `src/lib/supabase/client.ts` - Browser client  
- `apps/mobile/lib/supabase.ts` - React Native client
- `src/hooks/useSupabaseAuth.ts` - React hooks for auth

---

## 🚀 Next Steps - YOU Need to Do These

### Step 1: Create Supabase Project

1. Go to https://supabase.com and create account
2. Click **"New project"**
3. Fill in:
   - **Name**: `lokul-club-production`
   - **Database Password**: Generate strong password (SAVE IT!)
   - **Region**: **ap-south-1** (Mumbai, India)
   - **Plan**: Free tier (upgrade later)
4. Wait 2 minutes for project to provision

### Step 2: Get Your Credentials

Once project is ready:

1. Go to **Settings → API**
2. Copy these 3 values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Go to **Settings → Database**
4. Copy **Connection pooling** string (pgBouncer enabled):

```env
DATABASE_URL=postgresql://postgres.xxx:password@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

5. Copy **Direct connection** string (for migrations):

```env
DIRECT_URL=postgresql://postgres.xxx:password@aws-0-ap-south-1.pooler.supabase.com:5432/postgres
```

### Step 3: Update Environment Variables

#### For Next.js (lokul.club/.env.local):
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database (Supabase PostgreSQL)
DATABASE_URL=your-pooled-connection-string
DIRECT_URL=your-direct-connection-string
```

#### For Mobile App (apps/mobile/.env):
Create this file:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_API_URL=http://localhost:3000
```

### Step 4: Configure Phone Authentication (SMS OTP)

1. In Supabase dashboard, go to **Authentication → Providers**
2. Enable **Phone** provider
3. Choose **Twilio**:
   - Go to Twilio Console: https://console.twilio.com
   - Get **Account SID**, **Auth Token**, and **Phone Number**
   - Paste in Supabase:
     - Twilio Account SID
     - Twilio Auth Token
     - Twilio Phone Number

4. Set **SMS OTP expiry**: 10 minutes
5. Enable **Confirm phone** requirement

### Step 5: Migrate Your Database

Run these commands from `lokul.club/` directory:

```bash
# Generate Prisma client
npx prisma generate

# Push your schema to Supabase
npx prisma db push

# Or run migrations (if you have migration files)
npx prisma migrate deploy
```

### Step 6: Create Admin User in Supabase

You need to create your admin user in Supabase:

**Option A: Via Supabase Dashboard (Easiest)**

1. Go to **Authentication → Users**
2. Click **"Add user"**
3. Choose **"Create new user"**
4. Fill in:
   - **Email**: `admin@lokul.club`
   - **Password**: `admin123` (or your preferred password)
   - **Auto confirm user**: ✅ Enabled
   - **Email confirmed**: ✅ Enabled
5. Click **"Create user"**

**Option B: Via SQL**

Go to **SQL Editor** in Supabase and run:

```sql
-- Create admin user
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
)
VALUES (
  gen_random_uuid(),
  'admin@lokul.club',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"],"role":"admin"}'::jsonb,
  '{"role":"admin"}'::jsonb,
  false,
  'authenticated'
);
```

### Step 7: Set Up Row Level Security (RLS)

In Supabase **SQL Editor**, run these policies:

```sql
-- Enable RLS on User table
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own data"
  ON "User"
  FOR SELECT
  USING (auth.uid()::text = id);

-- Users can update their own data  
CREATE POLICY "Users can update own data"
  ON "User"
  FOR UPDATE
  USING (auth.uid()::text = id);

-- Service role can do anything (for API routes)
CREATE POLICY "Service role has full access"
  ON "User"
  FOR ALL
  USING (auth.role() = 'service_role');

-- Enable RLS on Merchant table
ALTER TABLE "Merchant" ENABLE ROW LEVEL SECURITY;

-- Merchants can read their own data
CREATE POLICY "Merchants can view own data"
  ON "Merchant"
  FOR SELECT
  USING (auth.uid()::text = "userId");

-- Service role has full access
CREATE POLICY "Service role merchant access"
  ON "Merchant"
  FOR ALL
  USING (auth.role() = 'service_role');
```

### Step 8: Test Authentication

#### Test Mobile App:
```bash
cd lokul.club/apps/mobile
npm run ios  # or npm run android

# Try logging in with a phone number
# Enter any 6-digit OTP (dev mode accepts any code)
```

#### Test Merchant App:
```bash
cd lokul.club
npm run dev

# Open http://localhost:3000/merchant/login
# Try logging in with a phone number
```

#### Test Admin:
```bash
# Open http://localhost:3000/admin/login
# Login with:
# Email: admin@lokul.club
# Password: admin123
```

---

## 🔄 Migration Status

| Component | Status | What Changed |
|---|---|---|
| **Dependencies** | ✅ Done | Installed `@supabase/supabase-js`, `@supabase/ssr` |
| **Mobile Auth** | ✅ Done | Phone OTP via Supabase |
| **Merchant Auth** | ✅ Done | Phone OTP via Supabase |
| **Admin Auth** | ✅ Done | Email/password via Supabase |
| **Client Utilities** | ✅ Done | Created server/client/mobile clients |
| **React Hooks** | ✅ Done | Created useSupabaseAuth hooks |
| **Database** | ⏳ Pending | Need to run `prisma db push` |
| **RLS Policies** | ⏳ Pending | Need to set up in Supabase |
| **API Routes** | ⏳ Pending | Need to update middleware |

---

## 🛠️ What Still Needs Migration

### API Routes Authentication

Many API routes currently use custom auth. They need to be updated to use Supabase:

**Mobile API Routes** (`src/app/api/mobile/*`):
- Currently check session from custom OTP
- Need to check: `Authorization: Bearer <supabase-token>` header

**Merchant API Routes** (`src/app/api/merchant/*`):
- Currently use custom JWT from cookies
- Need to check: Supabase session

**Example Update**:

**Before** (`src/app/api/mobile/posts/route.ts`):
```typescript
// Old custom auth check
const session = await getCustomSession(req);
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

**After**:
```typescript
import { getSupabaseSession } from '@/lib/supabase/server';

// New Supabase auth check
const user = await getSupabaseSession(req);
if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### Middleware

Update `src/middleware.ts` to use Supabase:

```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Create Supabase client with cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
      },
    }
  );

  // Check session
  const { data: { user } } = await supabase.auth.getUser();

  // Protect merchant routes
  if (request.nextUrl.pathname.startsWith('/merchant')) {
    if (!user && !request.nextUrl.pathname.startsWith('/merchant/login')) {
      return NextResponse.redirect(new URL('/merchant/login', request.url));
    }
  }

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user && !request.nextUrl.pathname.startsWith('/admin/login')) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/merchant/:path*', '/admin/:path*'],
};
```

---

## 🧪 Testing Checklist

### Mobile App Testing:
- [ ] Phone number entry (Indian format +91)
- [ ] OTP send (check SMS received)
- [ ] OTP verification (enter code)
- [ ] Session persistence (close/reopen app)
- [ ] Logout functionality
- [ ] Error handling (wrong OTP, expired OTP)

### Merchant App Testing:
- [ ] Phone number entry
- [ ] OTP send  
- [ ] OTP verification
- [ ] Redirect to dashboard after login
- [ ] Protected routes redirect to login
- [ ] Logout clears session

### Admin Testing:
- [ ] Email/password login
- [ ] Redirect to dashboard after login
- [ ] Protected routes work
- [ ] Logout functionality
- [ ] Remember me (session persistence)
- [ ] Wrong password error

### API Routes Testing:
- [ ] Mobile APIs require Bearer token
- [ ] Merchant APIs check Supabase session
- [ ] Unauthorized requests get 401
- [ ] Authorized requests work

---

## 🐛 Troubleshooting

### "Invalid API key" error
- Check `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart dev server: `npm run dev`

### "User already exists" error
- Phone number already registered in Supabase
- Go to **Authentication → Users** and delete test user

### SMS not sending
- Check Twilio configuration in Supabase dashboard
- Verify Twilio account has credits
- Check Twilio phone number is SMS-enabled
- Try sending test SMS from Twilio console

### Database migration fails
- Check `DATABASE_URL` is correct
- Use `DIRECT_URL` for migrations (not pooled connection)
- Run: `npx prisma db push --skip-generate`

### Admin login not working
- Make sure you created admin user in Supabase (Step 6)
- Check user has `email_confirmed_at` set
- Try resetting password in Supabase dashboard

### Mobile app not getting environment variables
- Make sure `.env` file exists in `apps/mobile/`
- Restart Expo dev server
- Clear Metro bundler cache: `npx expo start -c`

---

## 📚 Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase Phone Auth](https://supabase.com/docs/guides/auth/phone-login)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Prisma + Supabase](https://www.prisma.io/docs/guides/database/supabase)
- [Twilio SMS](https://www.twilio.com/docs/sms)

---

## 🎉 Success Criteria

Your migration is complete when:

✅ Mobile app can login with phone OTP  
✅ Merchant app can login with phone OTP  
✅ Admin can login with email/password  
✅ All sessions persist across page reloads  
✅ Protected routes redirect to login  
✅ API routes check Supabase auth  
✅ Database connected to Supabase PostgreSQL  
✅ RLS policies protect user data  

---

## 💡 Pro Tips

1. **Start with Free Tier** - Supports 50K MAU, upgrade when needed
2. **Test in Development First** - Use different Supabase project for prod
3. **Keep Old Auth for 1 Week** - Run both systems in parallel
4. **Monitor SMS Costs** - Each OTP costs ~₹0.50, budget accordingly
5. **Set Up Alerts** - Configure Supabase to alert on auth failures
6. **Backup Database** - Export before migration: `npx prisma db pull`

---

## 🆘 Need Help?

If you get stuck:
1. Check Supabase logs: **Settings → Logs**
2. Check browser console for errors
3. Check Expo logs for mobile errors
4. Verify environment variables are loaded
5. Try creating new test user in Supabase

---

**Next Command to Run:**

```bash
# 1. Make sure you've created .env.local with Supabase credentials
# 2. Then migrate your database:
npx prisma db push

# 3. Start dev server:
npm run dev

# 4. Test admin login:
# Open http://localhost:3000/admin/login
# Email: admin@lokul.club
# Password: admin123
```

🚀 **You're all set!** Follow the steps above and you'll have Supabase authentication running in ~30 minutes.
