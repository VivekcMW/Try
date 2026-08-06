# 📱 WhatsApp & Email OTP Setup Guide

**Stop paying for Twilio SMS!** Use **FREE WhatsApp Business API** or **FREE Email OTP** instead.

---

## 💰 **Cost Comparison**

| Service | Free Tier | Paid Rate | Best For |
|---|---|---|---|
| **WhatsApp Cloud API** ⭐ | 1,000/month FREE | ₹0.40/message | High engagement, personal touch |
| **Resend Email** | 3,000/month FREE | ₹0.01/email | Unlimited free tier, instant setup |
| **Twilio SMS** ❌ | None | ₹0.60/SMS | (Don't use this anymore!) |

**Savings**: ₹600/month + 1,000 free WhatsApp messages!

---

## ✅ **Option 1: WhatsApp Business Cloud API** (Recommended)

### Why WhatsApp?
- ✅ **1,000 FREE** conversations/month (forever)
- ✅ 98% delivery rate (vs 95% for SMS)
- ✅ Higher engagement (people prefer WhatsApp in India)
- ✅ Template messages with branding
- ✅ Official Meta API - won't get banned

### Setup Steps (10 minutes)

#### **Step 1: Create Meta Business Account**

1. Go to: https://business.facebook.com/
2. Click **Create Account**
3. Fill in business details:
   - Business name: "Lokul.club"
   - Your name
   - Business email
4. Verify your email

#### **Step 2: Create WhatsApp App**

1. Go to: https://developers.facebook.com/apps/
2. Click **Create App**
3. Select **Business** type
4. Fill in:
   - App Name: "Lokul.club OTP"
   - Business account: Select your business
5. Click **Create App**

#### **Step 3: Add WhatsApp Product**

1. In your app dashboard, click **Add Product**
2. Find **WhatsApp** → Click **Set Up**
3. Select your business account
4. You'll see the **API Setup** page

#### **Step 4: Get Test Phone Number & Access Token**

Meta gives you a **FREE test number** instantly!

1. On the API Setup page, you'll see:
   - **Temporary Access Token**: Copy this (valid for 24 hours)
   - **Phone Number ID**: Copy this
   - **Test Number**: e.g., +1 555-025-3483

2. **Add yourself as a test recipient**:
   - Click **To** dropdown
   - Enter your WhatsApp number (with country code)
   - Click **Send** to verify

#### **Step 5: Get Permanent Access Token**

1. In left sidebar → **Tools** → **Access Tokens**
2. Click **Create New System User**
   - Name: "Lokul.club OTP Service"
   - Role: **Admin**
3. Click **Generate New Token**
   - Permissions: Select **whatsapp_business_messaging**
   - Token expiration: **Never**
4. Copy the token (you won't see it again!)

#### **Step 6: Create OTP Message Template**

WhatsApp requires **pre-approved templates** for business messages.

1. Go to **WhatsApp Manager**: https://business.facebook.com/wa/manage/message-templates/
2. Click **Create Template**
3. Fill in:

```
Template Name: otp_verification
Category: Authentication (OTP)
Language: English + हिन्दी (Hindi)

Header: None

Body:
Your Lokul.club verification code is: {{1}}

Valid for 5 minutes. Do not share this code.

आपका Lokul.club सत्यापन कोड है: {{1}}

Footer: None

Buttons: None
```

4. Click **Submit**
5. **Approval time**: 5-10 minutes (usually instant)

#### **Step 7: Add to `.env.local`**

```bash
# WhatsApp Business Cloud API
META_WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
META_WHATSAPP_ACCESS_TOKEN=your_permanent_access_token
OTP_PROVIDER_PRIORITY=whatsapp,email,sms
```

#### **Step 8: Test It!**

```bash
# Start dev server
npm run dev

# Send test OTP
curl -X POST http://localhost:3000/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210"}'
```

**Check your WhatsApp!** 🎉

---

### 🚀 **Production Setup** (When Ready to Scale)

#### **Step 1: Business Verification** (2-3 days)

1. Go to **Business Settings** → **Security Center** → **Start Verification**
2. Upload:
   - Business registration certificate
   - Business email domain verification
   - Phone number verification
3. Wait for approval (2-3 business days)

#### **Step 2: Get Your Own Phone Number**

1. Go to **WhatsApp Manager** → **Phone Numbers**
2. Click **Add Phone Number**
3. Options:
   - **Own number**: Migrate existing business number
   - **New number**: Purchase from Meta (₹500-1000/month)
4. Verify ownership (they'll call/SMS)

#### **Step 3: Request Higher Limits**

- Start: 250 conversations/day
- After 7 days: 1,000/day
- After 30 days: Unlimited (based on quality score)

---

## ✅ **Option 2: Email OTP via Resend** (Easiest & FREE)

### Why Email?
- ✅ **3,000 FREE** emails/month (forever)
- ✅ **Zero setup** - works in 2 minutes
- ✅ No approval needed
- ✅ Professional templates
- ✅ 100% deliverability

### Setup Steps (2 minutes)

#### **Step 1: Sign Up**

1. Go to: https://resend.com/signup
2. Sign up with GitHub or email
3. Confirm your email

#### **Step 2: Get API Key**

1. Go to: https://resend.com/api-keys
2. Click **Create API Key**
   - Name: "Lokul.club OTP"
   - Permission: **Full access**
3. Copy the key (starts with `re_...`)

#### **Step 3: Add to `.env.local`**

```bash
# Email OTP (FREE: 3,000/month)
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=Lokul.club <onboarding@resend.dev>
OTP_PROVIDER_PRIORITY=email,whatsapp,sms
```

**That's it!** 🚀 Email OTP works instantly.

#### **Step 4: Verify Your Domain** (Optional, for branding)

1. Go to **Domains** → **Add Domain**
2. Add: `lokul.club`
3. Add DNS records (TXT, MX, DKIM)
4. Wait 5-10 minutes for verification
5. Change `RESEND_FROM_EMAIL` to: `Lokul.club <otp@lokul.club>`

---

## 🎯 **Multi-Provider Strategy** (Best Practice)

Use **both WhatsApp AND Email** for maximum reliability!

### Priority Order Configuration

```bash
# Try WhatsApp first, fall back to Email if fails
OTP_PROVIDER_PRIORITY=whatsapp,email

# Or Email first, WhatsApp fallback
OTP_PROVIDER_PRIORITY=email,whatsapp
```

### Auto-Fallback Logic

Our `OTPService` automatically:
1. ✅ Tries primary provider (e.g., WhatsApp)
2. ❌ If fails → Switches to Email automatically
3. ✅ Sends OTP via fallback
4. 📊 Logs which provider worked

---

## 📦 **Installation**

```bash
# Install Resend package
npm install resend

# Run database migration
npx prisma migrate dev --name add_multi_provider_otp

# Regenerate Prisma client
npx prisma generate
```

---

## 💻 **Usage Examples**

### **Send OTP**

```typescript
import { otpService } from '@/lib/otp/otp-service';

// WhatsApp OTP
const result = await otpService.sendOTP(
  '+919876543210', // phone
  undefined,       // email (optional)
  { provider: 'whatsapp' }
);

// Email OTP
const result = await otpService.sendOTP(
  undefined,              // phone (optional)
  'user@example.com',     // email
  { provider: 'email' }
);

// Auto-select provider (based on OTP_PROVIDER_PRIORITY)
const result = await otpService.sendOTP(
  '+919876543210',
  'user@example.com',
  { provider: 'auto', fallback: true }
);

// Response
{
  success: true,
  transactionId: "otp_1733567890_a3f8...",
  provider: "whatsapp"
}
```

### **Verify OTP**

```typescript
import { otpService } from '@/lib/otp/otp-service';

const result = await otpService.verifyOTP(
  'otp_1733567890_a3f8...', // transactionId
  '123456',                 // code
  '+919876543210'           // phone (optional)
);

// Response
{
  success: true,
  userId: "user_abc123"
}
```

### **API Route Example**

```typescript
// src/app/api/otp/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { otpService } from '@/lib/otp/otp-service';

export async function POST(req: NextRequest) {
  const { phone, email } = await req.json();

  const result = await otpService.sendOTP(phone, email, {
    provider: 'auto',
    fallback: true,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    transactionId: result.transactionId,
    provider: result.provider,
  });
}
```

---

## 🔒 **Security Best Practices**

### Rate Limiting

```typescript
// Check for pending OTP before sending new one
const hasPending = await otpService.hasPendingOTP(phone, email);
if (hasPending) {
  return { error: 'Please wait 60 seconds before requesting new OTP' };
}
```

### Attempt Limits

- Max 3 verification attempts per OTP
- After 3 failed attempts, OTP expires
- User must request new OTP

### Expiry

- Default: 5 minutes
- Configurable via `expiryMinutes` option
- Expired OTPs automatically rejected

---

## 🚫 **What NOT to Do**

### ❌ **Option 3: WhatsApp Automation Libraries** (NOT RECOMMENDED)

Libraries like `whatsapp-web.js` and `baileys`:
- ❌ **Against WhatsApp Terms of Service**
- ❌ Account gets **permanently banned**
- ❌ Unreliable (breaks with WhatsApp updates)
- ❌ No business features
- ❌ Can't scale

**DON'T RISK IT!** Use official Meta Cloud API instead.

---

## 📊 **Database Schema**

The `OtpVerification` model supports multiple providers:

```prisma
model OtpVerification {
  id            String    @id @default(cuid())
  phone         String?   // For WhatsApp/SMS
  email         String?   // For Email
  code          String    // 6-digit OTP
  transactionId String    @unique
  provider      String    // "whatsapp" | "email" | "sms"
  expiresAt     DateTime
  used          Boolean   @default(false)
  verifiedAt    DateTime?
  attempts      Int       @default(0)
  userId        String?
  createdAt     DateTime  @default(now())

  user User? @relation(fields: [userId], references: [id])

  @@index([phone])
  @@index([email])
  @@index([transactionId])
  @@index([expiresAt])
  @@index([provider])
}
```

---

## 🎯 **Migration Path**

### From Twilio SMS → WhatsApp/Email

1. ✅ Install Resend: `npm install resend`
2. ✅ Run migration: `npx prisma migrate dev`
3. ✅ Add env vars (see above)
4. ✅ Update login API to use `otpService`
5. ✅ Test with test numbers
6. 🚀 Deploy & save ₹600/month!

---

## 🆘 **Troubleshooting**

### WhatsApp "Template not approved"
- **Solution**: Wait 5-10 minutes, templates auto-approve
- Check status at: https://business.facebook.com/wa/manage/message-templates/

### WhatsApp "Invalid phone number"
- **Solution**: Ensure format is international (e.g., `919876543210` not `+91 98765 43210`)
- Remove spaces, dashes, parentheses

### Email not delivered
- **Solution**: Check spam folder
- Verify `RESEND_FROM_EMAIL` is correct
- Use `onboarding@resend.dev` for testing

### "OTP not configured"
- **Solution**: Check env vars are set
- Restart dev server after updating `.env.local`
- Verify Prisma client regenerated: `npx prisma generate`

---

## 📚 **Resources**

- **WhatsApp Docs**: https://developers.facebook.com/docs/whatsapp/cloud-api
- **Resend Docs**: https://resend.com/docs
- **Code Examples**: See `/src/lib/otp/` and `/src/lib/whatsapp/`
- **API Reference**: `/src/lib/otp/otp-service.ts`

---

## 🎉 **You're Done!**

Your OTP system now:
- ✅ Saves ₹600/month (vs Twilio)
- ✅ Gets 1,000 FREE WhatsApp + 3,000 FREE Email/month
- ✅ Auto-fallback for reliability
- ✅ Professional templates
- ✅ Ready for production scale

**Questions?** Check the code in:
- `/src/lib/whatsapp/meta-cloud-client.ts`
- `/src/lib/otp/email-otp-client.ts`
- `/src/lib/otp/otp-service.ts`

---

**Happy coding!** 🚀
