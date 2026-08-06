# DigiLocker & API Setu Integration Setup Guide

## 🎯 Overview

This guide walks you through setting up DigiLocker SSO and Requestor API integration via API Setu Partners portal for lokul.club.

---

## 📋 Prerequisites

### 1. API Setu Account
- ✅ Already registered at https://partners.apisetu.gov.in/
- ✅ Client ID: `app.vercel.lokulclub`

### 2. Required Documents (for approval)
- [ ] Use case document (499 words - already prepared)
- [ ] Company registration/GST certificate
- [ ] Platform architecture diagram (optional)
- [ ] Privacy policy URL
- [ ] Terms of service URL

### 3. Technical Requirements
- [ ] SSL certificate (HTTPS endpoints)
- [ ] Redirect URI for OAuth callback
- [ ] Server-side API endpoint to handle tokens

---

## 🚀 Step-by-Step Setup

### Phase 1: API Setu Partner Portal Registration

#### Step 1: Request API Access
1. **Navigate to**: https://partners.apisetu.gov.in/service/type/consumer
2. **Select Services**:
   - ✅ API Setu (for general identity verification)
   - ✅ DigiLocker Single Sign-On & Requestor API Services
3. **Fill Use Case**: Paste the 499-word use case (see below)
4. **Upload Documents**: Company registration, privacy policy
5. **Accept Terms**: Check all Terms of Use and Privacy Statement
6. **Submit**: Click "Request for Approval"

#### Step 2: Wait for Approval
- **Timeline**: 3-7 business days
- **Notification**: Email to registered account
- **Status**: Check at https://partners.apisetu.gov.in/dashboard

#### Step 3: Obtain Credentials
Once approved, you'll receive:
```
DIGILOCKER_CLIENT_ID=APISETU_XXXXXXXXXXXX
DIGILOCKER_CLIENT_SECRET=secret_XXXXXXXXXXXXXXXXXXXXXXXX
DIGILOCKER_REDIRECT_URI=https://lokul.club/api/auth/digilocker/callback
```

---

### Phase 2: Configure Environment Variables

Add to `.env.local`:

```bash
# === DIGILOCKER / API SETU ===
# DigiLocker OAuth SSO
NEXT_PUBLIC_DIGILOCKER_CLIENT_ID=APISETU_XXXXXXXXXXXX
DIGILOCKER_CLIENT_SECRET=secret_XXXXXXXXXXXXXXXXXXXXXXXX
DIGILOCKER_REDIRECT_URI=https://lokul.club/api/auth/digilocker/callback

# API Setu Base URLs
DIGILOCKER_AUTH_URL=https://apisetu.gov.in/certificate/v3/digilocker/oauth2
DIGILOCKER_API_URL=https://apisetu.gov.in/certificate/v3/digilocker

# Requestor API endpoints
DIGILOCKER_REQUESTOR_API_URL=https://apisetu.gov.in/certificate/v3/digilocker/requestor

# Environment (sandbox for testing, production for live)
DIGILOCKER_ENV=sandbox
```

**For Local Development** (use DigiLocker sandbox):
```bash
DIGILOCKER_ENV=sandbox
DIGILOCKER_REDIRECT_URI=http://localhost:3000/api/auth/digilocker/callback
```

---

### Phase 3: Implementation

#### Architecture Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     DigiLocker OAuth Flow                    │
└─────────────────────────────────────────────────────────────┘

1. User clicks "Login with DigiLocker"
   ↓
2. Redirect to DigiLocker Auth URL with client_id
   ↓
3. User authenticates on DigiLocker portal
   ↓
4. DigiLocker redirects to /api/auth/digilocker/callback?code=XXX
   ↓
5. Exchange code for access_token + user info
   ↓
6. Create/update user in Supabase with DigiLocker ID
   ↓
7. Set session cookie and redirect to dashboard
```

#### Files to Create

**1. DigiLocker Client Library** (`src/lib/digilocker/client.ts`)
- OAuth URL builder
- Token exchange
- User info fetch
- Document request API

**2. OAuth Callback API** (`src/app/api/auth/digilocker/callback/route.ts`)
- Handle OAuth redirect
- Exchange code for token
- Sync with Supabase auth

**3. Requestor API Route** (`src/app/api/digilocker/request-document/route.ts`)
- Request specific documents with consent
- Fetch issued documents
- Store in S3/Supabase Storage

**4. Login Button Component** (`src/components/auth/DigiLockerButton.tsx`)
- DigiLocker branded button
- Handle OAuth initiation

**5. Merchant Onboarding Integration** (`src/app/merchant/onboarding/`)
- Request GST certificate
- Request trade license
- Request address proof

---

### Phase 4: Database Schema Updates

Add DigiLocker fields to User table:

```prisma
model User {
  id                  String    @id @default(uuid())
  email               String?   @unique
  phone               String?   @unique
  
  // DigiLocker Integration
  digilockerId        String?   @unique @map("digilocker_id")
  diglockerVerified   Boolean   @default(false) @map("digilocker_verified")
  diglockerName       String?   @map("digilocker_name")
  diglockerDob        DateTime? @map("digilocker_dob")
  diglockerGender     String?   @map("digilocker_gender")
  
  // ... existing fields
}

// Store requested documents
model DigiLockerDocument {
  id              String    @id @default(uuid())
  userId          String    @map("user_id")
  user            User      @relation(fields: [userId], references: [id])
  
  docType         String    @map("doc_type")       // "GST", "PAN", "ADDRESS_PROOF", etc.
  docUri          String    @map("doc_uri")        // DigiLocker URI
  docName         String    @map("doc_name")
  
  requestedAt     DateTime  @default(now()) @map("requested_at")
  fetchedAt       DateTime? @map("fetched_at")
  verifiedAt      DateTime? @map("verified_at")
  
  storageUrl      String?   @map("storage_url")   // S3/Supabase Storage URL
  metadata        Json?                            // Additional document metadata
  
  @@map("digilocker_documents")
}
```

Run migration:
```bash
npx prisma migrate dev --name add_digilocker_fields
npx prisma generate
```

---

## 🧪 Testing

### Sandbox Testing

API Setu provides sandbox environment with test credentials:

1. **Test DigiLocker User**:
   - Mobile: Use test numbers provided by API Setu
   - OTP: Usually `123456` in sandbox

2. **Test Documents**: Sandbox returns mock documents

3. **Endpoint**:
   ```
   https://apisetu.gov.in/certificate/v3/digilocker/sandbox/oauth2/authorize
   ```

### Production Checklist

- [ ] Privacy policy published at https://lokul.club/privacy
- [ ] Terms of service at https://lokul.club/terms
- [ ] HTTPS enabled on production domain
- [ ] Webhook endpoint for document updates (if needed)
- [ ] Error handling and user consent flows
- [ ] Audit logs for compliance

---

## 📚 API Setu Documentation Links

- **Partner Portal**: https://partners.apisetu.gov.in/
- **DigiLocker API Docs**: https://apisetu.gov.in/public/marketplace/api/digilocker
- **Integration Guide**: https://apisetu.gov.in/docs/digilocker-integration
- **Support**: support@apisetu.gov.in

---

## 🔐 Security Best Practices

1. **Never expose** `DIGILOCKER_CLIENT_SECRET` to browser
2. **Validate** OAuth state parameter to prevent CSRF
3. **Verify** token signatures from DigiLocker
4. **Encrypt** stored documents in database
5. **Log** all document access with user consent timestamps
6. **Auto-delete** documents after verification (GDPR compliance)

---

## 📞 Support

- **API Setu Support**: support@apisetu.gov.in
- **DigiLocker Helpdesk**: 011-24301047
- **Technical Issues**: https://partners.apisetu.gov.in/support

---

## 🎯 Next Steps

1. ✅ Submit application on API Setu Partners portal
2. ⏳ Wait for approval (3-7 days)
3. 📧 Receive credentials via email
4. 🔧 Implement OAuth flow in codebase
5. 🧪 Test with sandbox environment
6. 🚀 Deploy to production
7. ✅ Enable DigiLocker login for users

---

**Status**: ⏳ Awaiting API Setu approval

**Last Updated**: 2026-08-06
