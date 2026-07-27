# Verification + Google Maps Integration - Quick Start Guide

## 🎯 Executive Summary

This guide combines **Verification Integrations** and **Google Maps Location Search** to create a seamless, trusted user onboarding experience.

---

## 📋 Combined Implementation Order

### **Phase 1: Foundation** (Week 1)
1. ✅ **Database Schema Updates**
   - Add verification fields to User model
   - Add address fields (lat, lng, placeId, etc.)
   - Create VerificationLog and VerificationDocument models
   - Run migrations

2. ✅ **Google Cloud Setup**
   - Create project
   - Enable APIs (Places, Geocoding, Maps JS)
   - Create 3 API keys with restrictions
   - Set billing alerts

3. ✅ **Environment Configuration**
   - Add all API keys to .env files
   - Configure mobile app.json
   - Install dependencies (Twilio, Resend, Google Maps packages)

---

### **Phase 2: Google Maps Integration** (Week 1)
*Priority: HIGH - Enables accurate address capture*

#### Day 1-2: Web Implementation
- [ ] Create `useGoogleMaps` hook
- [ ] Build `AddressAutocomplete` component
- [ ] Add to onboarding flow
- [ ] Create `/api/user/address` endpoint
- [ ] Test autocomplete + address saving

#### Day 3-4: Mobile Implementation
- [ ] Install `react-native-google-places-autocomplete`
- [ ] Build mobile `AddressAutocomplete` component
- [ ] Add to onboarding screen `/(onboarding)/address.tsx`
- [ ] Add "Use Current Location" button with reverse geocoding
- [ ] Test on real iPhone device

**Why First?**
- Captures accurate location data needed for neighborhood verification
- Provides better UX than manual address entry
- Sets up lat/lng for proximity features

---

### **Phase 3: Phone Verification** (Week 2)
*Priority: HIGH - Primary identity check*

#### Day 1: Setup
- [ ] Sign up for Twilio account
- [ ] Get Verify Service SID
- [ ] Add credentials to .env

#### Day 2-3: Implementation
- [ ] Create `/api/verify/phone/send` endpoint
- [ ] Create `/api/verify/phone/verify` endpoint
- [ ] Build web verification UI
- [ ] Build mobile verification screen `/(settings)/verify-phone.tsx`
- [ ] Add rate limiting (3 attempts/hour)
- [ ] Add verification logs

#### Day 4: Testing
- [ ] Test OTP sending
- [ ] Test verification flow
- [ ] Test rate limiting
- [ ] Monitor Twilio usage

---

### **Phase 4: Email Verification** (Week 2)
*Priority: HIGH - Account recovery*

#### Day 1: Setup
- [ ] Sign up for Resend
- [ ] Add API key to .env
- [ ] Configure domain (verify@lokul.club)

#### Day 2: Implementation
- [ ] Create `/api/verify/email/send` endpoint
- [ ] Create email verification page `/verify/email`
- [ ] Build mobile email verification
- [ ] Add token generation/validation
- [ ] Test email delivery

---

### **Phase 5: Address Verification** (Week 3)
*Combines Google Maps + Manual Verification*

#### Methods:
1. **Automatic GPS Verification**
   - User allows location access
   - Check if GPS coordinates match saved address (within 100m radius)
   - Auto-verify if match

2. **Document Upload**
   - Utility bill, rent agreement, etc.
   - Upload to secure storage
   - Admin manual review

3. **Society Admin Approval**
   - Society admin confirms resident
   - Best for gated communities

#### Implementation:
- [ ] GPS verification endpoint
- [ ] Document upload component
- [ ] Admin review dashboard
- [ ] Notification system for approvals

---

### **Phase 6: Additional Verifications** (Week 4)

#### Bank Account (For Sellers)
- [ ] Integrate Razorpay Fund Account Validation
- [ ] Penny drop test implementation
- [ ] UI for bank details entry
- [ ] Save encrypted bank details

#### Aadhaar (Optional - Requires Govt Approval)
- [ ] DigiLocker API integration
- [ ] Aadhaar OTP flow
- [ ] Store only hashed Aadhaar
- [ ] Compliance checks

---

## 🎨 Onboarding Flow Design

```
┌─────────────────────────────────────────────────────────────┐
│                    STEP 1: Basic Info                       │
│  • Name, Phone, Email                                       │
│  • Profile photo (optional)                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              STEP 2: Phone Verification                     │
│  • Send OTP to entered phone                                │
│  • User enters 6-digit code                                 │
│  • ✅ Phone verified                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│            STEP 3: Address with Google Maps                 │
│  ┌─────────────────────────────────────────────┐            │
│  │ 🔍 Search for your address...              │            │
│  │                                             │            │
│  │ • 123 MG Road, Pune, Maharashtra           │            │
│  │ • Flat 501, ABC Society, Pune              │            │
│  │ • Baner Residency, Pune                    │            │
│  └─────────────────────────────────────────────┘            │
│                                                             │
│  OR  [📍 Use Current Location]                             │
│                                                             │
│  Selected: 123 MG Road, Baner, Pune - 411045               │
│  Coordinates: 18.5596, 73.7785                             │
│                                                             │
│  Apartment/Flat Number: ____________                        │
│  Landmark (optional):    ____________                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              STEP 4: Email Verification                     │
│  • Send verification link                                   │
│  • "Check your email to verify"                            │
│  • ✅ Email verified (can complete later)                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   STEP 5: Trust Score                       │
│                                                             │
│       Your Trust Score: 50/100                             │
│                                                             │
│   ✅ Phone Verified        (+20 points)                    │
│   ✅ Email Verified        (+10 points)                    │
│   ✅ Address Added         (+20 points)                    │
│   ⏳ Address Verification  (pending)                       │
│   ⏳ Bank Verification     (+20 points)                    │
│   ⏳ Aadhaar Verification  (+30 points)                    │
│                                                             │
│   [Complete More Verifications] [Skip for Now]             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                 Welcome to Lokul! 🎉                        │
│  • Discover your neighborhood                              │
│  • Connect with neighbors                                  │
│  • Access local services                                   │
│                                                             │
│             [Start Exploring]                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 User Trust Score System

```typescript
// Calculate trust score
function calculateTrustScore(user: User): number {
  let score = 0;
  
  if (user.phoneVerified) score += 20;        // Essential
  if (user.emailVerified) score += 10;        // Important
  if (user.addressVerified) score += 20;      // Very important
  if (user.bankVerified) score += 20;         // For sellers
  if (user.aadhaarVerified) score += 30;      // Highest trust
  
  return score; // Out of 100
}

// Trust level badges
function getTrustLevel(score: number): string {
  if (score >= 80) return 'Highly Trusted';
  if (score >= 50) return 'Trusted';
  if (score >= 30) return 'Basic';
  return 'New User';
}
```

**Display on Profile**:
```
┌─────────────────────────────┐
│  Rahul Sharma              │
│  ⭐⭐⭐⭐☆ Trusted           │
│  Trust Score: 70/100        │
│                            │
│  ✅ Phone Verified         │
│  ✅ Email Verified         │
│  ✅ Address Verified       │
│  ❌ Bank Not Verified      │
└─────────────────────────────┘
```

---

## 💡 Key Features

### 1. **Smart Address Autocomplete**
- Type 3 characters → Google suggestions appear
- Select → Auto-fills city, state, pin code, coordinates
- Saves placeId for future reference
- "Use Current Location" fallback

### 2. **Multi-Channel OTP**
- SMS (Primary)
- Voice call (Fallback if SMS fails)
- Rate limiting prevents spam

### 3. **Address Verification Methods**
```
Priority 1: GPS Match (Instant, Free)
  ↓ (if fails)
Priority 2: Document Upload (Manual review)
  ↓ (if not available)
Priority 3: Society Admin Approval
```

### 4. **Progressive Verification**
- Users can start using app with basic verification (phone + address)
- Unlock features as they verify more:
  - Basic: Browse, view posts
  - Trusted (50+): Comment, like, create posts
  - Highly Trusted (80+): Marketplace selling, group buying organizer

---

## 📊 Implementation Metrics

### Week 1: Google Maps + Phone
- 🎯 **Goal**: 100% users add accurate address
- 📈 **Metric**: Address autocomplete usage rate
- ✅ **Success**: <5% manual address entry

### Week 2: Email + Address Verification
- 🎯 **Goal**: 80% email verification
- 📈 **Metric**: Email open rate, click rate
- ✅ **Success**: <24h verification time

### Week 3-4: Advanced Verifications
- 🎯 **Goal**: 30% achieve "Trusted" status (50+ score)
- 📈 **Metric**: Average trust score
- ✅ **Success**: Reduce fake accounts by 90%

---

## 🔒 Security & Compliance

### Data Protection
- ✅ Encrypt Aadhaar (store only hash)
- ✅ HTTPS for all API calls
- ✅ Rate limiting on all verification endpoints
- ✅ IP tracking for abuse detection
- ✅ Audit logs for all verification attempts

### GDPR/Privacy
- ✅ Clear consent for location access
- ✅ Option to delete verification data
- ✅ Privacy policy disclosure
- ✅ Data retention limits (delete expired OTPs)

### Indian Compliance
- ✅ IT Act 2000 for Aadhaar storage
- ✅ RBI guidelines for payment data
- ✅ TRAI DND registry check for SMS

---

## 💰 Total Cost Estimate

| Service | Free Tier | Paid (1000 users/month) |
|---------|-----------|------------------------|
| Twilio SMS | - | ₹600 (100 OTPs) |
| Resend Email | 3,000 emails | Free |
| Google Maps | $200 credit | Free* |
| Razorpay Bank Verify | - | ₹3,000 (100 verifications) |
| **Total** | **$200** | **₹3,600/month** |

*With session token optimization, 1400 addresses/month free

---

## 🚀 Quick Start Commands

```bash
# 1. Install all dependencies
npm install twilio resend @googlemaps/js-api-loader @react-google-maps/api bcryptjs

# Mobile
cd apps/mobile
npm install react-native-google-places-autocomplete react-native-maps

# 2. Update database schema
npx prisma migrate dev --name add_verification_and_address_fields

# 3. Set up environment variables
cp .env.example .env
# Add all API keys

# 4. Test Google Maps
# Visit: /web/settings/address

# 5. Test Phone Verification
# Visit: /verify/phone

# 6. Build and deploy
npm run build
```

---

## 📚 Documentation References

- [Verification Integration Plan](./VERIFICATION_INTEGRATION_PLAN.md) - Full verification guide
- [Google Maps Integration Plan](./GOOGLE_MAPS_INTEGRATION_PLAN.md) - Maps implementation
- [API Documentation](./API_DOCS.md) - All endpoints
- [Database Schema](./prisma/schema.prisma) - Data models

---

## ✅ Final Checklist

### Before Launch
- [ ] All API keys configured with restrictions
- [ ] Rate limiting tested and working
- [ ] Email templates reviewed
- [ ] SMS templates comply with TRAI guidelines
- [ ] Privacy policy updated
- [ ] Terms of service updated
- [ ] Billing alerts set in Google Cloud Console
- [ ] Monitoring dashboard set up
- [ ] Error tracking (Sentry) configured
- [ ] Load testing completed
- [ ] Security audit passed

### Post Launch Monitoring
- [ ] Track daily verification success rates
- [ ] Monitor API costs (stay under $200 Google credit)
- [ ] Check OTP delivery rates (>95%)
- [ ] Review verification logs for abuse patterns
- [ ] Measure average trust score growth
- [ ] Track feature unlock rates

---

**Ready to implement?** Start with Phase 1 (Database + Google Cloud Setup), then Phase 2 (Google Maps), then proceed sequentially. Each phase builds on the previous one.
