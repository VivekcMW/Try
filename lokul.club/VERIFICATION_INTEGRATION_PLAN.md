# Verification Integrations - Implementation Plan

## 📋 Overview

Implement multiple verification methods to establish trust and security in the Lokul community platform.

---

## 🎯 Verification Types Required

### 1. **Phone Number Verification** (Priority: HIGH)
**Purpose**: Primary identity verification, prevent fake accounts

**Provider Options**:
- ✅ **Twilio** (Recommended)
  - SMS OTP verification
  - Voice call fallback
  - $0.0079 per SMS (India)
  - Reliable delivery
  
- ⚠️ **Firebase Auth Phone** (Alternative)
  - Free quota: 10K verifications/month
  - Google infrastructure
  - Easy integration
  
- ⚠️ **AWS SNS** (Alternative)
  - $0.00447 per SMS (India)
  - Good if already using AWS

**Flow**:
```
User enters phone → Send OTP → User enters OTP → Verify → Mark verified
```

---

### 2. **Email Verification** (Priority: HIGH)
**Purpose**: Account recovery, communication channel

**Provider Options**:
- ✅ **Resend** (Recommended)
  - 3,000 emails/month free
  - Modern API
  - Good deliverability
  
- ⚠️ **SendGrid** (Alternative)
  - 100 emails/day free
  - Enterprise-grade

**Flow**:
```
User enters email → Send verification link → User clicks → Verify → Mark verified
```

---

### 3. **Aadhaar Verification** (Priority: MEDIUM)
**Purpose**: Government ID verification for India

**Provider**:
- ✅ **DigiLocker API** (Official)
  - Aadhaar eKYC
  - Government-backed
  - Requires approval
  
- ⚠️ **Signzy / HyperVerge** (Alternative)
  - Commercial KYC providers
  - Instant verification
  - Higher cost

**Flow**:
```
User provides Aadhaar → Generate OTP → UIDAI verification → Fetch details → Store hash
```

**Compliance**:
- Store only Aadhaar hash (not full number)
- Follow IT Act 2000 requirements
- Secure storage mandates

---

### 4. **Address Verification** (Priority: MEDIUM)
**Purpose**: Confirm neighborhood/society membership

**Methods**:
- **Google Maps Integration** (see separate plan)
- **GPS Location Check** (verify user at address)
- **Document Upload** (utility bill, rent agreement)
- **Society Admin Approval**

**Flow**:
```
User adds address → Verify via Google Maps → Optional: Upload proof → Admin approval → Verified
```

---

### 5. **Social Media Verification** (Priority: LOW)
**Purpose**: Additional trust signal

**Providers**:
- Facebook
- Google
- LinkedIn

**Implementation**: OAuth 2.0

---

### 6. **Bank Account Verification** (Priority: MEDIUM)
**Purpose**: For marketplace sellers, service providers

**Provider**:
- ✅ **Razorpay Fund Account Validation**
  - ₹3 per verification
  - Instant validation
  - Already integrated (Razorpay in app)
  
- ⚠️ **Cashfree** (Alternative)

**Flow**:
```
User enters account details → Penny drop test → Verify → Mark verified
```

---

### 7. **Professional Verification** (Priority: LOW)
**Purpose**: For service providers (plumbers, electricians, etc.)

**Methods**:
- License/certificate upload
- Manual review by admin
- Partner verification (trade associations)

---

## 🏗️ Implementation Steps

### **Phase 1: Core Verifications (Week 1-2)**

#### Step 1: Database Schema
```prisma
// prisma/schema.prisma

model User {
  // ... existing fields
  
  // Verification status
  phoneVerified       Boolean   @default(false)
  phoneVerifiedAt     DateTime?
  emailVerified       Boolean   @default(false)
  emailVerifiedAt     DateTime?
  aadhaarVerified     Boolean   @default(false)
  aadhaarVerifiedAt   DateTime?
  aadhaarHash         String?   @unique // Encrypted hash only
  addressVerified     Boolean   @default(false)
  addressVerifiedAt   DateTime?
  bankVerified        Boolean   @default(false)
  bankVerifiedAt      DateTime?
  
  // Verification attempts (rate limiting)
  phoneOtpAttempts    Int       @default(0)
  phoneOtpLastSentAt  DateTime?
  emailOtpAttempts    Int       @default(0)
  
  verificationDocuments VerificationDocument[]
  verificationLogs      VerificationLog[]
}

model VerificationDocument {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  
  type        String   // 'aadhaar', 'address_proof', 'license', etc.
  documentUrl String
  status      String   @default("pending") // pending, approved, rejected
  
  // Admin review
  reviewedBy  String?
  reviewedAt  DateTime?
  rejectReason String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model VerificationLog {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  
  type        String   // 'phone_otp', 'email_link', 'aadhaar', etc.
  status      String   // 'success', 'failed', 'expired'
  metadata    Json?    // Store additional info
  ipAddress   String?
  userAgent   String?
  
  createdAt   DateTime @default(now())
}
```

#### Step 2: Environment Variables
```env
# Twilio (Phone Verification)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_VERIFY_SERVICE_SID=your_verify_service_sid
TWILIO_RECOVERY_CODE=XF546QFWKTRVCX2GGYXVNDJV

# Resend (Email Verification)
RESEND_API_KEY=re_xxxxxxxxxxxx

# DigiLocker (Aadhaar - if approved)
DIGILOCKER_CLIENT_ID=your_client_id
DIGILOCKER_CLIENT_SECRET=your_client_secret

# Razorpay (Bank Verification)
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxx

# Security
VERIFICATION_TOKEN_SECRET=random_64_char_string
```

#### Step 3: Install Dependencies
```bash
npm install twilio
npm install resend
npm install @razorpay/razorpay
npm install bcryptjs  # For hashing Aadhaar
```

---

### **Phase 2: Phone Verification (Week 1)**

#### API Routes

**1. Send OTP**
```typescript
// src/app/api/verify/phone/send/route.ts

import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function POST(req: NextRequest) {
  try {
    const { phone, userId } = await req.json();
    
    // Validate phone format (+91xxxxxxxxxx)
    if (!/^\+91[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }
    
    // Rate limiting check
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { phoneOtpAttempts: true, phoneOtpLastSentAt: true }
    });
    
    if (user) {
      const now = new Date();
      const lastSent = user.phoneOtpLastSentAt;
      
      // Max 3 attempts per hour
      if (user.phoneOtpAttempts >= 3 && lastSent) {
        const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        if (lastSent > hourAgo) {
          return NextResponse.json(
            { error: 'Too many attempts. Try again later.' },
            { status: 429 }
          );
        }
      }
    }
    
    // Send OTP via Twilio Verify
    const verification = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
      .verifications
      .create({ to: phone, channel: 'sms' });
    
    // Update attempt counter
    await prisma.user.update({
      where: { id: userId },
      data: {
        phoneOtpAttempts: { increment: 1 },
        phoneOtpLastSentAt: new Date()
      }
    });
    
    // Log
    await prisma.verificationLog.create({
      data: {
        userId,
        type: 'phone_otp_sent',
        status: verification.status,
        metadata: { phone, sid: verification.sid }
      }
    });
    
    return NextResponse.json({ 
      success: true,
      status: verification.status 
    });
    
  } catch (error) {
    console.error('Phone OTP send error:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
```

**2. Verify OTP**
```typescript
// src/app/api/verify/phone/verify/route.ts

export async function POST(req: NextRequest) {
  try {
    const { phone, code, userId } = await req.json();
    
    // Verify OTP with Twilio
    const verification_check = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
      .verificationChecks
      .create({ to: phone, code });
    
    if (verification_check.status === 'approved') {
      // Mark user as verified
      await prisma.user.update({
        where: { id: userId },
        data: {
          phone,
          phoneVerified: true,
          phoneVerifiedAt: new Date(),
          phoneOtpAttempts: 0 // Reset counter
        }
      });
      
      // Log success
      await prisma.verificationLog.create({
        data: {
          userId,
          type: 'phone_verified',
          status: 'success',
          metadata: { phone }
        }
      });
      
      return NextResponse.json({ 
        success: true,
        verified: true 
      });
    }
    
    return NextResponse.json({ 
      success: false,
      error: 'Invalid OTP' 
    }, { status: 400 });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}
```

---

### **Phase 3: Email Verification (Week 1)**

```typescript
// src/app/api/verify/email/send/route.ts

import { Resend } from 'resend';
import { sign } from 'jsonwebtoken';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { email, userId, userName } = await req.json();
  
  // Generate verification token (expires in 24h)
  const token = sign(
    { userId, email, type: 'email_verify' },
    process.env.VERIFICATION_TOKEN_SECRET!,
    { expiresIn: '24h' }
  );
  
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify/email?token=${token}`;
  
  // Send email
  const { data, error } = await resend.emails.send({
    from: 'Lokul <verify@lokul.club>',
    to: email,
    subject: 'Verify your email address',
    html: `
      <h2>Hi ${userName},</h2>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verifyUrl}">Verify Email</a>
      <p>This link expires in 24 hours.</p>
    `
  });
  
  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
  
  return NextResponse.json({ success: true });
}
```

---

### **Phase 4: Bank Account Verification (Week 2)**

```typescript
// src/app/api/verify/bank/route.ts

import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!
});

export async function POST(req: NextRequest) {
  const { accountNumber, ifsc, name, userId } = await req.json();
  
  try {
    // Create fund account for validation
    const fundAccount = await razorpay.fundAccount.create({
      contact_id: contactId, // Pre-created contact
      account_type: 'bank_account',
      bank_account: {
        name,
        ifsc,
        account_number: accountNumber
      }
    });
    
    // Initiate fund account validation (penny drop)
    const validation = await razorpay.fundAccount.fetch(fundAccount.id).validate({
      amount: 100, // ₹1.00
      currency: 'INR',
      notes: {
        userId,
        purpose: 'verification'
      }
    });
    
    // Mark as verified if successful
    if (validation.results.account_status === 'active') {
      await prisma.user.update({
        where: { id: userId },
        data: {
          bankVerified: true,
          bankVerifiedAt: new Date()
        }
      });
    }
    
    return NextResponse.json({ 
      success: true,
      status: validation.results.account_status 
    });
    
  } catch (error) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
```

---

## 📱 Mobile UI Components

### Verification Badge Component

```typescript
// apps/mobile/src/components/VerificationBadge.tsx

import { View, StyleSheet } from 'react-native';
import { CheckCircle2, Shield, Mail, Phone } from 'lucide-react-native';
import { Text } from '@/components/ui';
import { colors } from '@lokul/ui-tokens';

interface VerificationBadgeProps {
  type: 'phone' | 'email' | 'aadhaar' | 'bank' | 'all';
  verified: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function VerificationBadge({ type, verified, size = 'md' }: VerificationBadgeProps) {
  const icons = {
    phone: Phone,
    email: Mail,
    aadhaar: Shield,
    bank: CheckCircle2,
    all: CheckCircle2
  };
  
  const Icon = icons[type];
  const iconSize = size === 'sm' ? 14 : size === 'md' ? 16 : 20;
  
  return (
    <View style={[styles.badge, verified && styles.verified]}>
      <Icon 
        size={iconSize} 
        color={verified ? colors.green[600] : colors.gray[400]} 
      />
      {size !== 'sm' && (
        <Text style={[styles.text, verified && styles.verifiedText]}>
          {verified ? 'Verified' : 'Not Verified'}
        </Text>
      )}
    </View>
  );
}
```

### Phone Verification Screen

```typescript
// apps/mobile/src/app/(settings)/verify-phone.tsx

export default function VerifyPhoneScreen() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  
  const sendOTP = async () => {
    setLoading(true);
    const res = await fetch(`${API_BASE}/api/verify/phone/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: `+91${phone}`, userId })
    });
    
    if (res.ok) {
      setStep('otp');
    }
    setLoading(false);
  };
  
  const verifyOTP = async () => {
    setLoading(true);
    const res = await fetch(`${API_BASE}/api/verify/phone/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: `+91${phone}`, code: otp, userId })
    });
    
    if (res.ok) {
      router.back();
    }
    setLoading(false);
  };
  
  return (
    <Screen>
      {step === 'phone' ? (
        <VStack gap={4}>
          <Text variant="h2">Verify Phone Number</Text>
          <Input
            placeholder="Enter 10-digit mobile number"
            keyboardType="phone-pad"
            maxLength={10}
            value={phone}
            onChangeText={setPhone}
          />
          <Button onPress={sendOTP} disabled={phone.length !== 10 || loading}>
            Send OTP
          </Button>
        </VStack>
      ) : (
        <VStack gap={4}>
          <Text variant="h2">Enter OTP</Text>
          <Text>OTP sent to +91{phone}</Text>
          <Input
            placeholder="Enter 6-digit OTP"
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={setOtp}
          />
          <Button onPress={verifyOTP} disabled={otp.length !== 6 || loading}>
            Verify
          </Button>
          <Button variant="ghost" onPress={() => setStep('phone')}>
            Change Number
          </Button>
        </VStack>
      )}
    </Screen>
  );
}
```

---

## 🔒 Security Considerations

1. **Rate Limiting**: Max 3 OTP attempts per hour per phone
2. **Token Expiry**: Verification links expire in 24h
3. **Aadhaar Storage**: Only store encrypted hash, never full number
4. **Audit Logs**: Log all verification attempts
5. **IP Tracking**: Track verification requests by IP
6. **HTTPS Only**: All verification APIs must use HTTPS
7. **Input Validation**: Validate all phone/email formats
8. **Session Security**: Use secure tokens for verification flows

---

## 📊 Verification Score System

```typescript
// Calculate trust score based on verifications
function calculateTrustScore(user: User): number {
  let score = 0;
  
  if (user.phoneVerified) score += 20;
  if (user.emailVerified) score += 10;
  if (user.aadhaarVerified) score += 30;
  if (user.addressVerified) score += 20;
  if (user.bankVerified) score += 20;
  
  return score; // Out of 100
}
```

---

## 🎯 Success Criteria

- [ ] Phone verification working with Twilio
- [ ] Email verification with Resend
- [ ] Bank account verification with Razorpay
- [ ] Verification badges displayed on profiles
- [ ] Rate limiting preventing abuse
- [ ] Audit logs capturing all attempts
- [ ] Mobile UI for all verification flows
- [ ] Admin dashboard for document review

---

## 💰 Cost Estimates (Monthly)

| Service | Free Tier | Paid (1000 users) |
|---------|-----------|-------------------|
| Twilio SMS | - | ~₹600 |
| Resend Email | 3,000/month | Free |
| Razorpay Bank Verify | - | ₹3,000 |
| **Total** | - | **₹3,600/month** |

---

## 📅 Timeline

- **Week 1**: Phone + Email verification
- **Week 2**: Bank + Address verification
- **Week 3**: Aadhaar + Document upload
- **Week 4**: Admin review dashboard + Testing

**Total**: 4 weeks for complete implementation
