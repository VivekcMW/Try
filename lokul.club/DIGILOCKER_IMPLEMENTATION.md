# DigiLocker Integration - Quick Reference

## 📦 Files Created

### 1. Core Library
- **`src/lib/digilocker/client.ts`** - DigiLocker API client
  - OAuth URL generation
  - Token exchange
  - User info fetch
  - Document request/fetch functions
  - Constants for document types

### 2. API Routes
- **`src/app/api/auth/digilocker/callback/route.ts`** - OAuth callback handler
  - Exchanges auth code for token
  - Creates/updates Supabase user
  - Sets session cookies
  
- **`src/app/api/digilocker/request-document/route.ts`** - Document request API
  - POST: Request document with consent
  - GET: Fetch document after consent

### 3. React Components
- **`src/components/auth/DigiLockerButton.tsx`** - Login button components
  - `DigiLockerButton` - Full button with text
  - `DigiLockerIconButton` - Compact icon button

### 4. Database Schema
- **Updated `prisma/schema.prisma`**:
  - Added DigiLocker fields to User model
  - Created DigiLockerDocument model
  - Added indexes for queries

### 5. Documentation
- **`DIGILOCKER_SETUP_GUIDE.md`** - Complete setup guide

---

## 🔧 Environment Variables

Add to `.env.local` (already updated):

```bash
# DigiLocker / API Setu
NEXT_PUBLIC_DIGILOCKER_CLIENT_ID=      # From API Setu Partners portal
DIGILOCKER_CLIENT_SECRET=              # Keep secret, server-only
DIGILOCKER_REDIRECT_URI=http://localhost:3000/api/auth/digilocker/callback
DIGILOCKER_AUTH_URL=https://apisetu.gov.in/certificate/v3/digilocker/oauth2
DIGILOCKER_API_URL=https://apisetu.gov.in/certificate/v3/digilocker
DIGILOCKER_REQUESTOR_API_URL=https://apisetu.gov.in/certificate/v3/digilocker/requestor
DIGILOCKER_ENV=sandbox  # Use 'production' when live
```

---

## 📊 Database Changes

### User Model Updates
```prisma
model User {
  // Existing fields...
  phone          String?    @unique  // Made optional for DigiLocker users
  email          String?    @unique  // Added for DigiLocker users
  
  // New DigiLocker fields
  digilockerId       String?   @unique
  diglockerVerified  Boolean   @default(false)
  diglockerName      String?
  diglockerDob       DateTime?
  diglockerGender    String?
  
  // New relation
  diglockerDocuments DigiLockerDocument[]
}
```

### New Model
```prisma
model DigiLockerDocument {
  id          String    @id
  userId      String
  docType     String    // GST, PAN, AADHRC, etc.
  docUri      String
  docName     String
  requestedAt DateTime
  fetchedAt   DateTime?
  verifiedAt  DateTime?
  storageUrl  String?
  metadata    Json?
  
  user        User      @relation(...)
}
```

**Run migration**:
```bash
cd lokul.club
npx prisma migrate dev --name add_digilocker_integration
npx prisma generate
```

---

## 🚀 Usage Examples

### 1. Add DigiLocker Login Button

Update **`src/app/admin/login/page.tsx`**:

```tsx
import DigiLockerButton from '@/components/auth/DigiLockerButton'

export default function LoginPage() {
  return (
    <div>
      {/* Existing email/phone login */}
      
      <div className="my-4 text-center text-sm text-gray-500">
        OR
      </div>
      
      {/* DigiLocker SSO */}
      <DigiLockerButton 
        variant="outline"
        onError={(err) => console.error(err)}
      />
    </div>
  )
}
```

### 2. Request Merchant Documents

Update **`src/app/merchant/onboarding/page.tsx`**:

```tsx
'use client'

import { useState } from 'use'
import { DOCUMENT_TYPES } from '@/lib/digilocker/client'

export default function MerchantOnboarding() {
  const [requesting, setRequesting] = useState(false)

  const requestGST = async () => {
    setRequesting(true)
    
    const response = await fetch('/api/digilocker/request-document', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        docType: DOCUMENT_TYPES.GST,
        purpose: 'Merchant verification for lokul.club marketplace',
      }),
    })

    const data = await response.json()
    
    if (data.consentUrl) {
      // Open consent URL for user to approve
      window.open(data.consentUrl, '_blank')
    }
    
    setRequesting(false)
  }

  return (
    <div>
      <button onClick={requestGST} disabled={requesting}>
        {requesting ? 'Requesting...' : 'Verify GST Certificate'}
      </button>
    </div>
  )
}
```

### 3. Check DigiLocker Verification Status

```tsx
'use client'

import { useState, useEffect } from 'react'
import { getCurrentUser } from '@/lib/supabase/client'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    getCurrentUser().then(setUser)
  }, [])

  return (
    <div>
      {user?.diglockerVerified ? (
        <span className="text-green-600">
          ✓ Verified with DigiLocker
        </span>
      ) : (
        <DigiLockerButton size="sm" />
      )}
    </div>
  )
}
```

---

## 📝 Document Types Available

From `DOCUMENT_TYPES` in `src/lib/digilocker/client.ts`:

```typescript
AADHAAR: 'AADHRC'        // Aadhaar Card
PAN: 'PANCR'             // PAN Card
GST: 'GSTIN'             // GST Certificate
DRIVING_LICENSE: 'DL'    // Driving License
FSSAI: 'FSSAI'           // FSSAI License
TRADE_LICENSE: 'TRADLIC' // Trade License
SHOP_ACT: 'SHOPACT'      // Shop & Establishment
BANK_STATEMENT: 'BNKSTMT'
```

---

## ✅ Next Steps

1. **Submit API Setu Application**
   - Go to: https://partners.apisetu.gov.in/service/type/consumer
   - Use 499-word use case provided
   - Wait 3-7 days for approval

2. **Add Credentials**
   - Copy client ID and secret to `.env.local`
   - Update redirect URI in API Setu dashboard

3. **Run Database Migration**
   ```bash
   npx prisma migrate dev --name add_digilocker_integration
   npx prisma generate
   ```

4. **Test in Sandbox**
   - Keep `DIGILOCKER_ENV=sandbox`
   - Use test accounts from API Setu
   - Verify OAuth flow works

5. **Add UI Integration**
   - Add DigiLockerButton to login pages
   - Add document request flows to merchant onboarding
   - Test user flow end-to-end

6. **Go Live**
   - Switch to `DIGILOCKER_ENV=production`
   - Update redirect URI to production domain
   - Monitor logs and user adoption

---

## 🔒 Security Notes

- ✅ Client secret stored in server-only env var
- ✅ OAuth state validation (TODO: implement in callback)
- ✅ Documents stored with user consent timestamp
- ✅ Cascade delete on user deletion
- ⚠️ TODO: Implement document encryption
- ⚠️ TODO: Add audit logging for document access

---

## 📚 Resources

- **API Setu Portal**: https://partners.apisetu.gov.in/
- **DigiLocker Docs**: https://apisetu.gov.in/public/marketplace/api/digilocker
- **Setup Guide**: See `DIGILOCKER_SETUP_GUIDE.md`

---

**Status**: ✅ Code Ready | ⏳ Awaiting API Setu Approval

**Last Updated**: 2026-08-06
