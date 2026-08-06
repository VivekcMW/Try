# 🚀 Quick Start - Next Steps

Your Supabase project is created! Here's what to do next:

---

## ✅ Step 1: Get Your API Keys (2 minutes)

1. Open this link: **https://supabase.com/dashboard/project/ewjvjabcoedsyxjnener/settings/api**

2. You'll see two important keys:

   **anon public** - This is your public key (safe for client-side)
   ```
   Looks like: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBh...
   ```

   **service_role** - This is your secret key (NEVER expose to client)
   ```
   Looks like: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBh...
   ```

3. Copy BOTH keys

---

## ✅ Step 2: Update Your .env Files (1 minute)

### In `lokul.club/.env.local`:

Replace these two lines:
```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=REPLACE_WITH_ANON_KEY_FROM_DASHBOARD
SUPABASE_SERVICE_ROLE_KEY=REPLACE_WITH_SERVICE_ROLE_KEY_FROM_DASHBOARD
```

With your actual keys:
```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBh...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBh...
```

### In `apps/mobile/.env`:

Replace this line:
```env
EXPO_PUBLIC_SUPABASE_ANON_KEY=REPLACE_WITH_ANON_KEY_FROM_DASHBOARD
```

With your actual anon key:
```env
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBh...
```

---

## ✅ Step 3: Get Connection Pooling String (1 minute)

1. Open: **https://supabase.com/dashboard/project/ewjvjabcoedsyxjnener/settings/database**

2. Scroll to **Connection pooling** section

3. Mode: **Transaction**

4. Copy the connection string (it includes pgBouncer)
   ```
   Looks like: postgresql://postgres.ewjvjabcoedsyxjnener:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

5. In `lokul.club/.env.local`, update the `DATABASE_URL` line:
   ```env
   DATABASE_URL=postgresql://postgres.ewjvjabcoedsyxjnener:Stayconnected@112@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

---

## ✅ Step 4: Configure Phone Authentication (5 minutes)

### Option A: Use Twilio (Recommended for India)

1. Go to **https://supabase.com/dashboard/project/ewjvjabcoedsyxjnener/auth/providers**

2. Click **Phone** tab

3. Enable **Phone login**

4. Select **Twilio** as provider

5. Get Twilio credentials:
   - Go to: **https://console.twilio.com**
   - Get **Account SID**
   - Get **Auth Token**
   - Get **Twilio Phone Number** (must be SMS-enabled)

6. Paste into Supabase:
   - Twilio Account SID
   - Twilio Auth Token
   - Twilio Phone Number (format: +1234567890)

7. Click **Save**

### Option B: Use Twilio Verify (Better for production)

1. In Twilio Console → Verify → Services
2. Create a new Verify Service
3. Copy the Service SID
4. In Supabase, choose **Twilio Verify** and paste Service SID

---

## ✅ Step 5: Migrate Your Database (1 minute)

Run these commands:

```bash
cd lokul.club

# Generate Prisma client
npx prisma generate

# Push your schema to Supabase
npx prisma db push
```

If you see any errors, try:
```bash
# Skip generate if it fails
npx prisma db push --skip-generate
```

---

## ✅ Step 6: Create Admin User in Supabase (2 minutes)

### Option A: Via Dashboard (Easiest)

1. Go to: **https://supabase.com/dashboard/project/ewjvjabcoedsyxjnener/auth/users**

2. Click **"Add user"** → **"Create new user"**

3. Fill in:
   - **Email**: `admin@lokul.club`
   - **Password**: `admin123` (or your preferred password)
   - **Auto Confirm User**: ✅ **Enabled**
   - **Email Confirmed**: ✅ **Enabled**

4. Click **"Create user"**

### Option B: Via SQL

1. Go to: **https://supabase.com/dashboard/project/ewjvjabcoedsyxjnener/sql/new**

2. Paste this SQL:

```sql
-- Create admin user
INSERT INTO auth.users (
  id,
  instance_id,
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
  '00000000-0000-0000-0000-000000000000',
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

3. Click **Run**

---

## ✅ Step 7: Test Everything! 🎉

### Test Admin Login:

```bash
cd lokul.club
npm run dev

# Open browser: http://localhost:3000/admin/login
# Email: admin@lokul.club
# Password: admin123
```

### Test Merchant Login:

```bash
# Open browser: http://localhost:3000/merchant/login
# Enter phone number: +91 9876543210
# Enter OTP when you receive SMS
```

### Test Mobile App:

```bash
cd lokul.club/apps/mobile
npm run ios  # or npm run android

# Try phone login
# Enter +91 9876543210
# Enter OTP from SMS
```

---

## 🐛 Troubleshooting

### "Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY"
- Make sure you copied the anon key from Supabase dashboard
- Restart dev server: `npm run dev`

### "Invalid API key"
- Check the keys are correct (should start with eyJhbG...)
- No extra spaces or quotes
- Restart dev server

### "User already registered"
- Phone number already exists in Supabase
- Go to Auth → Users and delete the test user
- Try again

### SMS not sending
- Check Twilio is configured correctly
- Verify Twilio account has credits
- Check phone number is SMS-enabled
- Try sending test SMS from Twilio console

### Database migration fails
- Check DATABASE_URL in .env.local
- Make sure password is correct: `Stayconnected@112`
- Try using DIRECT_URL instead

---

## 📋 Checklist

Before testing, make sure:

- [ ] Got anon key and service_role key from Supabase
- [ ] Updated `.env.local` with both keys
- [ ] Updated `apps/mobile/.env` with anon key
- [ ] Got connection pooling string
- [ ] Updated `DATABASE_URL` in `.env.local`
- [ ] Configured Twilio in Supabase
- [ ] Ran `npx prisma db push`
- [ ] Created admin user in Supabase
- [ ] Restarted dev server

---

## 🎯 Quick Commands

```bash
# Get API keys
# Open: https://supabase.com/dashboard/project/ewjvjabcoedsyxjnener/settings/api

# Configure phone auth
# Open: https://supabase.com/dashboard/project/ewjvjabcoedsyxjnener/auth/providers

# Create admin user
# Open: https://supabase.com/dashboard/project/ewjvjabcoedsyxjnener/auth/users

# Migrate database
cd lokul.club
npx prisma generate
npx prisma db push

# Test admin
npm run dev
# Open: http://localhost:3000/admin/login

# Test merchant
# Open: http://localhost:3000/merchant/login

# Test mobile
cd apps/mobile
npm run ios
```

---

## 🆘 Need Help?

**Check Supabase logs:**
https://supabase.com/dashboard/project/ewjvjabcoedsyxjnener/logs/explorer

**Check API Health:**
http://localhost:3000/api/health

**Still stuck?** Check:
1. Browser console for errors
2. Terminal for server errors
3. Supabase dashboard logs
4. Make sure all env vars are set

---

**Next step:** Get your API keys from the dashboard! 🚀
