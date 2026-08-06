# Supabase Migration Plan for Lokul.club

## Why Supabase?

✅ **Phone OTP built-in** (perfect for Indian market)  
✅ **PostgreSQL database** (you're already using Postgres!)  
✅ **Free tier: 50,000 MAU** (enough for initial growth)  
✅ **Realtime subscriptions** (great for chat, feed updates)  
✅ **Row-level security** (better than manual auth checks)  
✅ **Storage included** (for images, files)  
✅ **Works great in India** (Twilio + MessageBird integration)

---

## Current State vs Supabase

| Feature | Current | With Supabase |
|---|---|---|---|
| Admin Auth | NextAuth (email/password) | Keep NextAuth OR Supabase |
| Mobile Auth | Custom OTP + JWT | Supabase Auth (phone OTP) |
| Merchant Auth | Custom OTP + JWT | Supabase Auth (phone OTP) |
| Database | Prisma + PostgreSQL | Supabase PostgreSQL |
| Realtime | Manual polling | Supabase Realtime |
| File Storage | Local/S3 | Supabase Storage |
| Security | Manual checks | Row-level security (RLS) |

---

## Implementation Plan

### Phase 1: Setup Supabase (Week 1)

```bash
# 1. Create Supabase project
# Visit: https://supabase.com/dashboard
# Create new project
# Region: ap-south-1 (Mumbai)

# 2. Install dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs

# 3. Environment variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

### Phase 2: Mobile Auth Migration (Week 2)

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Mobile app: apps/mobile/lib/supabase.ts
import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
)
```

**Send OTP:**
```typescript
// Replace: src/app/api/mobile/otp/send
export async function sendOTP(phone: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    phone: phone,
    options: {
      channel: 'sms', // or 'whatsapp'
    }
  })
  
  if (error) throw error
  return { success: true }
}
```

**Verify OTP:**
```typescript
// Replace: src/app/api/mobile/otp/verify
export async function verifyOTP(phone: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  })
  
  if (error) throw error
  return { session: data.session, user: data.user }
}
```

**Mobile App Login:**
```typescript
// apps/mobile/screens/LoginScreen.tsx
import { supabase } from '@/lib/supabase'

async function handleSendOTP() {
  const { error } = await supabase.auth.signInWithOtp({
    phone: `+91${phone}`,
  })
  
  if (error) {
    Alert.alert('Error', error.message)
  } else {
    setStep('verify')
  }
}

async function handleVerifyOTP() {
  const { data, error } = await supabase.auth.verifyOtp({
    phone: `+91${phone}`,
    token: otp,
    type: 'sms',
  })
  
  if (error) {
    Alert.alert('Error', 'Invalid OTP')
  } else {
    // Auto-navigates to home, session stored
  }
}
```

### Phase 3: Merchant Auth Migration (Week 3)

Same as mobile - merchant app uses same Supabase auth

```typescript
// src/app/merchant/login/page.tsx
// Replace custom OTP with Supabase
```

### Phase 4: Database Migration (Week 4)

**Option A: Keep Prisma + PostgreSQL (Recommended)**
- Point Prisma to Supabase PostgreSQL
- Get connection string from Supabase dashboard
- No schema changes needed
- Best of both worlds

```typescript
// .env
DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"
```

**Option B: Full Supabase Client**
- Replace Prisma queries with Supabase client
- More work, but gets RLS benefits

### Phase 5: Realtime Features (Week 5)

```typescript
// Add realtime chat
const channel = supabase
  .channel('chat-room')
  .on('postgres_changes', 
    { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'messages' 
    }, 
    (payload) => {
      setMessages(prev => [...prev, payload.new])
    }
  )
  .subscribe()

// Cleanup
return () => { supabase.removeChannel(channel) }
```

---

## Row-Level Security (RLS)

Instead of checking auth in API routes, use RLS:

```sql
-- Users can only see their own data
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Merchants can only update their orders
CREATE POLICY "Merchants update own orders"
  ON orders FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM merchants WHERE id = orders.merchant_id
    )
  );
```

---

## Cost Breakdown

### Free Tier (0-50,000 MAU):
- ✅ Database: 500 MB
- ✅ Storage: 1 GB
- ✅ Bandwidth: 2 GB
- ✅ Realtime: Unlimited connections
- **SMS costs:** ₹0.50-1 per OTP (via Twilio)

### Pro Tier ($25/mo):
- 100,000 MAU
- 8 GB database
- 100 GB storage
- 200 GB bandwidth
- Priority support

### SMS Cost Optimization:
1. **Use WhatsApp OTP** (cheaper: ₹0.20/msg)
2. **Rate limiting** (1 OTP per 60s)
3. **OTP expiry** (5 min → reduce resends)
4. **Truecaller integration** (free verification for registered users)

**Estimated monthly SMS cost for 10,000 users:**
- 10,000 users × 2 OTPs/month × ₹0.50 = **₹10,000/month**
- With WhatsApp: ₹4,000/month
- With Truecaller: ₹2,000/month

---

## Admin Portal Options

### Option 1: Keep NextAuth (Recommended)
- Admin uses email/password (current)
- Mobile/Merchant use Supabase phone OTP
- Two separate auth systems (simple)

### Option 2: Migrate Admin to Supabase
- Admin also uses Supabase (email + password)
- Single auth system
- Better if you add more admins later

### Option 3: Use WorkOS for Admin
- Supabase for users/merchants
- WorkOS for admin team (when you scale)
- Best for enterprise

---

## Migration Checklist

### Pre-Migration
- [ ] Create Supabase project (Mumbai region)
- [ ] Set up Twilio/MessageBird for SMS
- [ ] Configure environment variables
- [ ] Test OTP delivery in India

### Week 1: Mobile App
- [ ] Install Supabase SDK in mobile app
- [ ] Replace OTP send/verify with Supabase
- [ ] Test login flow on iOS/Android
- [ ] Deploy to TestFlight/Internal Testing

### Week 2: Merchant App
- [ ] Update merchant login with Supabase
- [ ] Test merchant authentication
- [ ] Update merchant API auth checks
- [ ] Deploy to staging

### Week 3: Database
- [ ] Point Prisma to Supabase PostgreSQL
- [ ] Test all queries
- [ ] Set up RLS policies
- [ ] Monitor performance

### Week 4: Cleanup
- [ ] Remove old OTP tables
- [ ] Remove custom JWT code
- [ ] Update API middleware
- [ ] Clean up unused code

### Week 5: Realtime
- [ ] Add realtime chat
- [ ] Add live feed updates
- [ ] Test notifications
- [ ] Monitor usage

---

## Code Changes Summary

### Files to Update:
1. `src/lib/supabase.ts` (new)
2. `apps/mobile/lib/supabase.ts` (new)
3. `src/app/api/mobile/otp/send/route.ts` (replace)
4. `src/app/api/mobile/otp/verify/route.ts` (replace)
5. `src/app/api/merchant/auth/login/route.ts` (replace)
6. `apps/mobile/screens/LoginScreen.tsx` (update)
7. `.env` (add Supabase keys)

### Files to Delete:
1. `src/lib/merchant-auth.ts` (replaced by Supabase)
2. Custom OTP tables in Prisma schema
3. JWT signing code

---

## Rollback Plan

If migration fails:
1. Keep old auth code in separate branch
2. Feature flag for Supabase auth
3. Gradual migration (new users → Supabase, old users → old system)
4. Database backup before migration

---

## Testing Plan

### Unit Tests:
- [ ] OTP send success
- [ ] OTP verify success/failure
- [ ] Session creation
- [ ] Session validation

### Integration Tests:
- [ ] Full login flow
- [ ] Logout
- [ ] Session expiry
- [ ] API auth checks

### E2E Tests:
- [ ] Mobile app login (iOS/Android)
- [ ] Merchant web login
- [ ] Protected route access
- [ ] Realtime updates

---

## Success Metrics

After migration, you should see:
- ✅ 99%+ OTP delivery rate
- ✅ < 2s OTP delivery time
- ✅ Zero manual JWT bugs
- ✅ Better security (RLS)
- ✅ Easier to add features
- ✅ Lower maintenance

---

## Support & Resources

- [Supabase Docs](https://supabase.com/docs)
- [Phone Auth Guide](https://supabase.com/docs/guides/auth/phone-login)
- [React Native Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)
- [Next.js Integration](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)

---

**Estimated Timeline:** 4-5 weeks  
**Estimated Cost:** $25/mo + SMS costs  
**Recommended Start:** Now (before 1.0 launch)  
