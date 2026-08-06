# Supabase Setup Guide for Lokul.club

## 🚀 Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** → **"New project"**
3. Fill in:
   - **Name:** `lokul-club-production`
   - **Database Password:** Generate a strong password (save it!)
   - **Region:** `ap-south-1` (Mumbai, India - closest to your users)
   - **Pricing:** Start with **Free** tier

4. Click **"Create new project"** (takes ~2 minutes)

---

## 🔑 Step 2: Get Your Credentials

Once your project is created:

1. Go to **Settings** → **API** in the left sidebar
2. Copy these values:

```env
# Project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# anon/public key (safe to use in client-side code)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# service_role key (NEVER expose to client, server-only)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Go to **Settings** → **Database** and copy:

```env
# Connection string (for Prisma)
DATABASE_URL=postgresql://postgres.your-project:password@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1

# Direct connection (for migrations)
DIRECT_URL=postgresql://postgres.your-project:password@aws-0-ap-south-1.pooler.supabase.com:5432/postgres
```

---

## 📝 Step 3: Update .env.local

Add these to your `.env.local` file:

```env
# === SUPABASE ===
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# === DATABASE (Supabase PostgreSQL) ===
DATABASE_URL=your-pooled-connection-string
DIRECT_URL=your-direct-connection-string
```

---

## 📱 Step 4: Configure Phone Auth (SMS OTP)

1. Go to **Authentication** → **Providers** in Supabase dashboard
2. Enable **Phone** provider
3. Choose **Twilio** (recommended for India):
   - Go to [Twilio Console](https://www.twilio.com/console)
   - Copy your **Account SID** and **Auth Token**
   - Get a **Twilio Phone Number** (with SMS capability)
   - In Supabase, paste:
     - Twilio Account SID
     - Twilio Auth Token  
     - Twilio Message Service SID (or Phone Number)

4. Configure **SMS Template** (optional):
   ```
   Your Lokul verification code is: {{ .Token }}
   ```

5. Set **SMS OTP expiry:** 10 minutes
6. Enable **Confirm phone** requirement

---

## 🔐 Step 5: Configure Email Auth (Admin)

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure **SMTP** (optional, or use Supabase's default):
   - If using custom SMTP (like Resend):
     ```
     Host: smtp.resend.com
     Port: 587
     User: resend
     Password: your-resend-api-key
     From: noreply@lokul.club
     ```

---

## 🗄️ Step 6: Migrate Your Database

Run Prisma migrations against Supabase:

```bash
# Generate Prisma client
npx prisma generate

# Push schema to Supabase
npx prisma db push

# Or run migrations
npx prisma migrate deploy
```

---

## 🛡️ Step 7: Set Up Row Level Security (RLS)

In Supabase SQL Editor, run these policies:

### For Users table:
```sql
-- Enable RLS
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
```

### For Merchant table:
```sql
-- Enable RLS
ALTER TABLE "Merchant" ENABLE ROW LEVEL SECURITY;

-- Merchants can read their own data
CREATE POLICY "Merchants can view own data"
  ON "Merchant"
  FOR SELECT
  USING (auth.uid()::text = "userId");

-- Merchants can update their own data
CREATE POLICY "Merchants can update own data"
  ON "Merchant"
  FOR UPDATE
  USING (auth.uid()::text = "userId");
```

### For MerchantOrder table:
```sql
-- Enable RLS
ALTER TABLE "MerchantOrder" ENABLE ROW LEVEL SECURITY;

-- Merchants can only see their own orders
CREATE POLICY "Merchants can view own orders"
  ON "MerchantOrder"
  FOR SELECT
  USING (
    "merchantId" IN (
      SELECT id FROM "Merchant" WHERE "userId" = auth.uid()::text
    )
  );
```

---

## 🔄 Step 8: Test Your Setup

### Test Database Connection:
```bash
# Test Prisma connection
npx prisma db pull
```

### Test Supabase Auth:
```bash
# Start your dev server
npm run dev

# Visit http://localhost:3000
# Try logging in
```

---

## 🎉 You're Done!

Your Supabase setup is complete. The code has been updated to use:
- ✅ Supabase Auth for phone OTP (mobile + merchant)
- ✅ Supabase Auth for email/password (admin)
- ✅ Supabase PostgreSQL (via Prisma)
- ✅ Supabase Storage (for file uploads)
- ✅ Supabase Realtime (for chat/feed)

---

## 🆘 Troubleshooting

### Issue: "Invalid API key"
- Check your `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart your dev server after updating `.env.local`

### Issue: "Phone number already registered"
- Go to **Authentication** → **Users** in Supabase dashboard
- Delete the test user and try again

### Issue: "SMS not sending"
- Check Twilio configuration in Supabase dashboard
- Verify Twilio account has credits
- Check Twilio phone number is SMS-enabled

### Issue: Prisma migration fails
- Check `DATABASE_URL` in `.env.local`
- Make sure database password is correct
- Try using `DIRECT_URL` for migrations

---

## 💰 Costs

**Free Tier:**
- 50,000 monthly active users
- 500MB database storage
- 1GB file storage
- Unlimited API requests
- 2GB bandwidth

**Cost for 10K active users:**
- Supabase: $0 (within free tier)
- Twilio SMS: ~₹10,000/month (10K OTPs @ ₹1 each)

**When to upgrade to Pro ($25/mo):**
- More than 50K MAU
- Need more than 8GB database storage
- Want daily backups
- Need priority support

---

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase RLS Docs](https://supabase.com/docs/guides/auth/row-level-security)
- [Prisma + Supabase](https://www.prisma.io/docs/guides/database/supabase)
