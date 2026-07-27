# Feature Flags Implementation Guide

## Overview

The feature flags system allows you to enable/disable features from the admin panel without code changes. All Phase 2+ features are **disabled by default** and can be toggled on when ready.

## Admin Panel

### Location
Navigate to: **http://localhost:3010/admin/flags**

### Features Organized by Phase

**Phase 1: Core Features (Launch Day)** ✅ Enabled by default
- Feed, Services, Wallet, Classifieds, Events, Lost & Found, Safety Contacts, Shop Directory

**Phase 2: Validation Required** ❌ Disabled by default
- Telemedicine, Insurance, Carpool, Group Buying, Sports Groups, Pet Care, Bill Splitting, Item Borrowing, RWA Management

**Phase 3: Advanced Features** ❌ Disabled by default
- SOS Alerts, Stories, Video Calls, Parking, Kids/Education, Jobs, Real Estate, Amenity Booking, etc.

### How to Toggle

1. Open `/admin/flags` in your browser
2. Find the feature you want to enable/disable
3. Click the toggle switch
4. Feature is immediately enabled/disabled globally
5. Mobile and web apps will fetch updated flags on next app open

---

## Usage in Code

### 1. Server-Side (API Routes, Server Components)

```typescript
import { isFeatureEnabled, FEATURE_FLAGS } from '@/lib/feature-flags';

// In API route
export async function GET() {
  const telemedicineEnabled = await isFeatureEnabled(FEATURE_FLAGS.TELEMEDICINE);
  
  if (!telemedicineEnabled) {
    return Response.json({ error: 'Feature not available' }, { status: 403 });
  }
  
  // ... rest of your code
}

// In Server Component
export default async function TelemedicinePage() {
  const enabled = await isFeatureEnabled('telemedicine');
  
  if (!enabled) {
    return <ComingSoonPage feature="Telemedicine" />;
  }
  
  return <TelemedicineApp />;
}
```

---

### 2. Client-Side (Mobile App, React Components)

#### Fetch enabled features on app startup:

```typescript
// apps/mobile/src/hooks/useFeatureFlags.ts
import { useEffect, useState } from 'react';

export function useFeatureFlags() {
  const [enabledFeatures, setEnabledFeatures] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://api.lokul.club/api/features')
      .then(res => res.json())
      .then(data => {
        setEnabledFeatures(data.enabled);
        setLoading(false);
      })
      .catch(() => {
        // Fail safe: enable only Phase 1 core features
        setEnabledFeatures([
          'feed', 'services', 'wallet', 'classifieds', 
          'events', 'lost_found', 'safety_contacts', 'shop_directory'
        ]);
        setLoading(false);
      });
  }, []);

  const isEnabled = (feature: string) => enabledFeatures.includes(feature);

  return { enabledFeatures, isEnabled, loading };
}
```

#### Use in components:

```typescript
// apps/mobile/src/app/(tabs)/_layout.tsx
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

export default function TabLayout() {
  const { isEnabled } = useFeatureFlags();

  const tabs = [
    { name: 'Feed', href: '/', icon: Home }, // Always visible
    { name: 'Services', href: '/services', icon: Briefcase }, // Always visible
    
    // Conditionally show based on flags
    ...(isEnabled('carpool') ? [{ name: 'Carpool', href: '/carpool', icon: Car }] : []),
    ...(isEnabled('group_buying') ? [{ name: 'Group Buy', href: '/group-buy', icon: Users }] : []),
    
    { name: 'More', href: '/more', icon: Grid }, // Always visible
  ];

  return <Tabs tabs={tabs} />;
}
```

#### Conditional rendering in More tab:

```typescript
// apps/mobile/src/app/(tabs)/more.tsx
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

export default function MoreTab() {
  const { isEnabled } = useFeatureFlags();

  return (
    <ScrollView>
      {/* Always visible */}
      <MenuItem title="Classifieds" href="/classifieds" />
      <MenuItem title="Events" href="/events" />
      <MenuItem title="Lost & Found" href="/lost-found" />
      
      {/* Conditionally visible */}
      {isEnabled('telemedicine') && (
        <MenuItem title="Telemedicine" href="/telemedicine" icon={Heart} />
      )}
      
      {isEnabled('insurance') && (
        <MenuItem title="Insurance" href="/insurance" icon={Shield} />
      )}
      
      {isEnabled('sports_groups') && (
        <MenuItem title="Sports Groups" href="/sports" icon={Trophy} />
      )}
      
      {isEnabled('pet_care') && (
        <MenuItem title="Pet Care" href="/pet-care" icon={PawPrint} />
      )}
    </ScrollView>
  );
}
```

---

### 3. Web App (Next.js App Router)

#### Hide routes conditionally:

```typescript
// src/app/(main)/telemedicine/page.tsx
import { isFeatureEnabled } from '@/lib/feature-flags';
import { redirect } from 'next/navigation';

export default async function TelemedicinePage() {
  const enabled = await isFeatureEnabled('telemedicine');
  
  if (!enabled) {
    redirect('/coming-soon?feature=telemedicine');
  }

  return <TelemedicineApp />;
}
```

#### Navigation menu:

```typescript
// src/components/layout/Sidebar.tsx
import { getEnabledFeatures } from '@/lib/feature-flags';

export default async function Sidebar() {
  const enabledFeatures = await getEnabledFeatures();
  const isEnabled = (feature: string) => enabledFeatures.includes(feature);

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Services', href: '/services', icon: Briefcase },
    
    // Conditional items
    ...(isEnabled('telemedicine') 
      ? [{ label: 'Telemedicine', href: '/telemedicine', icon: Heart }] 
      : []
    ),
    ...(isEnabled('carpool') 
      ? [{ label: 'Carpool', href: '/carpool', icon: Car }] 
      : []
    ),
  ];

  return <Nav items={navItems} />;
}
```

---

## API Endpoint

### GET /api/features

Returns currently enabled features.

**Response:**
```json
{
  "enabled": [
    "feed",
    "services",
    "wallet",
    "classifieds",
    "events",
    "lost_found",
    "safety_contacts",
    "shop_directory"
  ],
  "metadata": {
    "feed": {
      "name": "Home Feed",
      "description": "Neighborhood activity feed with posts, reactions, comments",
      "phase": 1,
      "category": "Core"
    },
    "telemedicine": {
      "name": "Telemedicine",
      "description": "Doctor consultations (needs verification, legal compliance)",
      "phase": 2,
      "category": "Health"
    }
    // ... more metadata
  },
  "timestamp": "2026-07-27T13:30:00.000Z"
}
```

**Cache:** 60 seconds

**Fallback:** If database fails, returns only Phase 1 core features (fail-safe)

---

## Initial Setup

### 1. Run Database Seed

```bash
cd /Users/vivekanandchoudhari/try/lokul.club
npx tsx prisma/seed.ts
```

This creates all feature flags in the database with Phase 1 enabled, Phase 2-3 disabled.

### 2. Verify in Admin Panel

1. Start dev server: `npm run dev`
2. Login to admin: http://localhost:3010/admin/login
   - Email: `admin@lokul.club`
   - Password: `admin123`
3. Navigate to: http://localhost:3010/admin/flags
4. Verify you see all 28 features organized by phase

### 3. Test Toggling

1. Find "Telemedicine" in Phase 2
2. Toggle it ON
3. Verify the switch turns green and shows "Enabled"
4. Test the API: `curl http://localhost:3010/api/features`
5. Verify "telemedicine" appears in the `enabled` array

---

## When to Enable Features

### Phase 2 Features (Enable After Validation)

Only enable these when:
1. ✅ You have 10+ users explicitly asking for it
2. ✅ You have supply ready (doctors for telemedicine, etc.)
3. ✅ Legal/compliance requirements met
4. ✅ Core features work smoothly

**Example:**
```
Week 8: 15 users asked about doctor consultations
  → Found 2 MBBS doctors willing to consult
  → Verified their credentials
  → NOW enable 'telemedicine' flag
```

### Phase 3 Features (Post-Fundraise)

Only enable these after:
1. ✅ You've raised funding (₹50L-₹1Cr)
2. ✅ You have 200+ active users
3. ✅ Phase 1-2 features have strong retention

---

## Feature Flag Best Practices

### ✅ DO:
- Keep Phase 1 features always enabled
- Test feature extensively before enabling
- Enable features gradually (1-2 per week max)
- Disable immediately if bugs found
- Use scope overrides for A/B testing (enable for specific society/city)

### ❌ DON'T:
- Enable all features at once
- Enable features without supply ready
- Keep buggy features enabled
- Disable core features (feed, services, wallet)
- Change flags during peak hours

---

## Scope Overrides (Advanced)

Enable a feature for specific audiences only:

### Global (Default)
```sql
-- Enabled for everyone
UPDATE "FeatureFlag" 
SET enabled = true 
WHERE key = 'carpool' AND scope = 'global';
```

### Society-Specific
```sql
-- Enable carpool ONLY for one society (beta test)
INSERT INTO "FeatureFlag" (key, enabled, scope, scopeValue)
VALUES ('carpool', true, 'society', 'society-id-123');
```

### City-Specific
```sql
-- Enable insurance ONLY in Bengaluru
INSERT INTO "FeatureFlag" (key, enabled, scope, scopeValue)
VALUES ('insurance', true, 'city', 'Bengaluru');
```

### Pincode-Specific
```sql
-- Enable telemedicine ONLY in Hadapsar
INSERT INTO "FeatureFlag" (key, enabled, scope, scopeValue)
VALUES ('telemedicine', true, 'pincode', '411028');
```

**Use Cases:**
- Beta test new features in one society
- Phased rollout by city
- A/B testing
- Compliance (enable insurance only in compliant cities)

---

## Monitoring

### Check Which Features Are Enabled

```bash
# Via API
curl http://localhost:3010/api/features | jq '.enabled'

# Via Database
npx prisma studio
# Navigate to FeatureFlag table
# Filter by: scope = "global" AND enabled = true
```

### Track Feature Adoption

Once a feature is enabled, track usage:
- PostHog events: `feature_viewed`, `feature_used`
- Admin dashboard: Feature usage metrics
- User feedback: Survey after enabling new feature

---

## Troubleshooting

### Feature not showing after enabling

1. **Check flag in database:**
   ```sql
   SELECT * FROM "FeatureFlag" WHERE key = 'telemedicine';
   ```

2. **Clear API cache:**
   - Wait 60 seconds (API cache expires)
   - OR restart dev server

3. **Check mobile app:**
   - Mobile apps fetch flags on startup
   - Force close app and reopen

### All features disabled

**Cause:** Database connection failed

**Solution:** API returns Phase 1 features as fallback (fail-safe)

### Can't toggle flag in admin

**Cause:** Not logged in as admin

**Solution:** Login with role = 'admin' or 'super_admin'

---

## Summary

✅ **28 feature flags** created by seed script  
✅ **Phase 1 (8 features)** enabled by default  
✅ **Phase 2-3 (20 features)** disabled by default  
✅ **Admin panel** at `/admin/flags` to toggle  
✅ **API endpoint** at `/api/features` for mobile/web  
✅ **Fail-safe:** Returns Phase 1 if database fails  

**Next Steps:**
1. Run seed: `npx tsx prisma/seed.ts`
2. Open admin: http://localhost:3010/admin/flags
3. Verify Phase 1 features are enabled
4. Verify Phase 2-3 features are disabled
5. Implement feature checks in your mobile/web code
6. Launch with focused feature set!

🚀 **You can now hide/show features without code deployments!**
