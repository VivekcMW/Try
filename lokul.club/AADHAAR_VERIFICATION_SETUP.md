# Aadhaar Verification Setup Guide

## 🎯 Overview

Complete Aadhaar OTP-based eKYC verification system for service provider verification (maids, tutors, electricians, etc.).

---

## 📦 What's Built

### 1. **Provider Abstraction Layer**
Supports multiple providers with a single interface:
- ✅ **Surepass** (Quick start - https://surepass.io/)
- ✅ **API Setu** (Government gateway - https://apisetu.gov.in/)
- 🔜 Karza, IDfy (Enterprise providers)

### 2. **API Routes**
- **POST `/api/aadhaar/send-otp`** - Send OTP to Aadhaar-linked mobile
- **POST `/api/aadhaar/verify-otp`** - Verify OTP and fetch eKYC data

### 3. **React Component**
- **`<AadhaarVerification />`** - Complete UI flow
  - Aadhaar input (formatted: 1234 5678 9012)
  - OTP verification
  - Success screen with verified data

### 4. **Database Schema**
Added to User model:
```prisma
aadhaarVerified  Boolean
aadhaarName      String
aadhaarDob       DateTime
aadhaarGender    String
aadhaarAddress   String (JSON)
```

---

## 🚀 Setup Instructions

### Option A: Surepass (Recommended for Quick Start)

#### Step 1: Sign Up
1. **Go to**: https://surepass.io/signup
2. **Fill form**: Email, company name
3. **Verify email**
4. **Get API key** from dashboard

#### Step 2: Add to .env.local
```bash
AADHAAR_PROVIDER=surepass
SUREPASS_API_KEY=your_api_key_here
SUREPASS_ENV=sandbox  # Use 'production' when ready
```

#### Step 3: Test
- **Sandbox**: Free testing with dummy Aadhaar numbers
- **Docs**: https://docs.surepass.io/

---

### Option B: API Setu (Government Gateway)

#### Step 1: Apply for Access
1. **Go to**: https://apisetu.gov.in/public/marketplace
2. **Search**: "Aadhaar eKYC" or "UIDAI"
3. **Click Subscribe** and fill use case:

```
Lokul.club requires Aadhaar OTP verification for domestic helpers, tutors, and service providers. Users enter Aadhaar number, verify via OTP, and we fetch name, photo, and address to create verified professional profiles ensuring community safety and trust.
```

4. **Wait for approval** (3-7 days)

#### Step 2: Add Credentials
```bash
AADHAAR_PROVIDER=api-setu
APISETU_AADHAAR_CLIENT_ID=xxx
APISETU_AADHAAR_CLIENT_SECRET=xxx
APISETU_AADHAAR_ENV=sandbox
```

---

## 📋 Database Migration

Run migration to add Aadhaar fields:

```bash
cd lokul.club
npx prisma migrate dev --name add_aadhaar_verification
npx prisma generate
```

---

## 🧪 Usage Examples

### 1. Service Provider Onboarding

Add to your service provider registration page:

```tsx
import AadhaarVerification from '@/components/verification/AadhaarVerification'

export default function ServiceProviderOnboarding() {
  const handleVerified = (data: any) => {
    console.log('Verified!', data)
    // Enable service provider profile
    // Show "Aadhaar Verified ✓" badge
  }

  return (
    <div>
      <h1>Complete Your Profile</h1>
      
      <AadhaarVerification
        onSuccess={handleVerified}
        onError={(err) => console.error(err)}
      />
    </div>
  )
}
```

### 2. Verification Badge

Show badge for verified users:

```tsx
import { CheckCircle2 } from 'lucide-react'

export function UserCard({ user }: { user: any }) {
  return (
    <div>
      <h3>{user.name}</h3>
      
      {user.aadhaarVerified && (
        <span className="flex items-center gap-1 text-green-600 text-sm">
          <CheckCircle2 className="w-4 h-4" />
          Aadhaar Verified
        </span>
      )}
    </div>
  )
}
```

### 3. Direct API Usage

If you need custom UI:

```typescript
// Send OTP
const response = await fetch('/api/aadhaar/send-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    aadhaarNumber: '123456789012',
  }),
})

const { transactionId } = await response.json()

// Verify OTP
const verifyResponse = await fetch('/api/aadhaar/verify-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    aadhaarNumber: '123456789012',
    otp: '123456',
    transactionId,
  }),
})

const { verified, data } = await verifyResponse.json()

if (verified) {
  console.log('Name:', data.name)
  console.log('DOB:', data.dob)
  console.log('Address:', data.address)
}
```

---

## 📊 Use Cases

### Where to Implement

1. **Domestic Helpers** (Maids, Cooks, Drivers)
   - Mandatory verification before profile activation
   - Shows "Aadhaar Verified ✓" badge

2. **Service Providers** (Electricians, Plumbers, Carpenters)
   - Verify during onboarding
   - Increases booking trust

3. **Tutors & Teachers**
   - Required for education services
   - Parents see verified badge

4. **Healthcare Providers**
   - Nurses, caregivers, therapists
   - Critical for safety

---

## 🔒 Security & Privacy

### Data Storage
- ✅ **Aadhaar number**: Stored masked (XXXX XXXX 1234)
- ✅ **Name, DOB, Address**: Encrypted in database
- ✅ **Photo**: Optional, stored securely
- ✅ **Verification status**: Boolean flag

### Compliance
- ✅ **UIDAI Guidelines**: OTP-based verification only
- ✅ **Data Protection**: Minimal data retention
- ✅ **User Consent**: Explicit consent required
- ✅ **Audit Logs**: All verifications logged

---

## 💰 Pricing

### Surepass
- **Sandbox**: Free testing
- **Production**: ₹3-5 per verification
- **Volume discounts**: Available

### API Setu
- **Government subsidized**: Lower costs
- **Pricing**: Check with API Setu

---

## 📚 API Documentation

### Provider Docs
- **Surepass**: https://docs.surepass.io/
- **API Setu**: https://apisetu.gov.in/docs/
- **UIDAI**: https://uidai.gov.in/

### Code Reference
- **Client Library**: `src/lib/aadhaar/`
- **API Routes**: `src/app/api/aadhaar/`
- **Component**: `src/components/verification/AadhaarVerification.tsx`

---

## ✅ Testing

### Sandbox Testing

**Surepass Test Aadhaar**:
- Number: Provided in Surepass dashboard
- OTP: Usually `123456` or provided by Surepass

**API Setu Test Data**:
- Available after approval
- Check documentation for test Aadhaar numbers

### Production Checklist

- [ ] Provider credentials configured
- [ ] Database migration run
- [ ] Component integrated in onboarding
- [ ] Verification badge displayed
- [ ] Error handling tested
- [ ] Privacy policy updated
- [ ] Terms mention Aadhaar usage

---

## 🎯 Next Steps

1. **Choose Provider**:
   - Quick start → **Surepass** (signup now)
   - Government gateway → **API Setu** (apply and wait)

2. **Get Credentials**:
   - Add to `.env.local`
   - Restart dev server

3. **Integrate Component**:
   - Add `<AadhaarVerification />` to service provider onboarding
   - Test with sandbox data

4. **Go Live**:
   - Switch to production mode
   - Update privacy policy
   - Launch!

---

## 🆘 Support

- **Surepass**: support@surepass.io
- **API Setu**: support@apisetu.gov.in
- **UIDAI**: https://uidai.gov.in/contact-support

---

**Status**: ✅ Code Ready | ⏳ Awaiting Provider Credentials

**Quick Start**: Sign up at https://surepass.io/ and get your API key!

**Last Updated**: 2026-08-06
