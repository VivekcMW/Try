# Error Pages & Empty States Audit

## Current State Analysis

### ✅ EXISTING Components

#### 1. **ErrorBoundary** (Mobile)
- **Location**: `apps/mobile/src/components/ErrorBoundary.tsx`
- **Purpose**: Catches React render errors globally
- **Features**:
  - Shows fallback UI with "Something went wrong" message
  - Retry button
  - Error reporting to API in production
  - Shows error details in dev mode
- **Status**: ✅ Complete & well-implemented

#### 2. **EmptyState** (Web)
- **Location**: `src/components/ui/EmptyState.tsx`
- **Features**:
  - Icon support
  - Title & description
  - Optional action button
  - Centered layout
- **Status**: ✅ Complete but only for web

---

## ❌ MISSING Error Pages

### Web App (Next.js)

#### 1. **404 Not Found Page**
- **Expected**: `src/app/not-found.tsx`
- **Status**: ❌ MISSING
- **Use Cases**:
  - Invalid URLs
  - Deleted posts/listings
  - Non-existent user profiles

#### 2. **500 Error Page**
- **Expected**: `src/app/error.tsx`
- **Status**: ❌ MISSING
- **Use Cases**:
  - Server errors
  - Database failures
  - API timeouts

#### 3. **Global Error Boundary** (Web)
- **Expected**: `src/app/global-error.tsx`
- **Status**: ❌ MISSING
- **Use Cases**:
  - Catches errors in root layout
  - Last resort error handler

#### 4. **Offline/Network Error Page**
- **Expected**: Custom component
- **Status**: ❌ MISSING (has OfflineBanner on mobile only)
- **Use Cases**:
  - No internet connection
  - Failed API calls

---

### Mobile App

#### 1. **EmptyState Component** (Mobile)
- **Expected**: `apps/mobile/src/components/ui/EmptyState.tsx`
- **Status**: ❌ MISSING (using inline implementations)
- **Use Cases**:
  - Empty feed
  - No notifications
  - No orders
  - No search results

---

## 📊 Empty State Locations Found (Without Dedicated Component)

### Mobile App - Inline Implementations

| Screen | Location | Empty State Message |
|--------|----------|---------------------|
| **Orders Dashboard** | `(marketplace)/orders-dashboard.tsx` | "No orders yet" |
| **Order Dashboard Section** | `components/profile/OrderDashboardSection.tsx` | Custom empty state |
| **Feed** | `(tabs)/index.tsx` | Likely missing proper empty state |
| **Chats** | `(tabs)/chats.tsx` | "No conversations yet" |
| **Notifications** | `(notifications)/index.tsx` | "All caught up!" |
| **Notification Digest** | `(notifications)/digest.tsx` | Empty state present |
| **Amenity Bookings** | `(amenity)/index.tsx` | "No bookings yet" |
| **Bills/Reminders** | `(bills)/reminders.tsx` | Empty state present |
| **Borrow/Lend** | `(borrow)/index.tsx` | Multiple empty states |
| **Business Dashboard** | `(business)/dashboard.tsx` | "No appointments yet" |
| **Business Nearby** | `(business)/nearby.tsx` | "No businesses found" |
| **Classifieds** | Multiple screens | Various empty states |
| **Delivery Orders** | `(delivery)/index.tsx` | "No orders yet" |
| **Delivery Search** | `(delivery)/search.tsx` | "Start typing to search" |
| **Carpool** | `(discover)/carpool.tsx` | "No trips available" |
| **Vouch Network** | `(discover)/vouch.tsx` | Custom graph empty state |
| **Domestic Help** | `(domestic-help)/verify.tsx` | "All helpers verified" |
| **Groups Chat** | `(groups)/home/[id].tsx` | "No messages yet" |
| **Insurance Claims** | `(insurance)/claims.tsx` | Multiple empty states |
| **Jobs Listings** | `(jobs)/index.tsx` | "No jobs found" |
| **Marketplace Listings** | `(marketplace)/my-listings.tsx` | Empty state check |
| **Marketplace Orders** | `(marketplace)/orders.tsx` | "No orders yet" |
| **Parking History** | `(parking)/history.tsx` | "No history" |
| **Parking Vehicles** | `(parking)/index.tsx` | "No vehicles registered" |
| **Peer Orders** | Multiple peer screens | "No orders yet" |
| **Pet Sitters** | `(pets)/category/[id].tsx` | "No providers yet" |
| **Lost Pets** | `(pets)/lost.tsx` | "No lost pets" |
| **My Pets** | `(pets)/my-pets.tsx` | "No pets added" |
| **Real Estate** | `(realestate)/index.tsx` | "No properties listed" |
| **Safety Contacts** | `(safety)/contacts.tsx` | "No contacts added" |
| **Safety Incident** | `(safety)/incident/[id].tsx` | "No responders yet" |
| **Skills Offers** | `(skills)/index.tsx` | "No offers available" |
| **Sports Leagues** | Multiple screens | Various empty states |
| **Telemedicine** | Multiple screens | "No appointments" / "No records" |
| **Wallet Ledger** | `(wallet)/ledger.tsx` | "No transactions" |

---

## 🎨 Recommended Error Page Designs

### 1. **404 Not Found**
```
┌─────────────────────────┐
│   🔍 Lost in Space      │
│                         │
│   Page Not Found        │
│   The page you're       │
│   looking for doesn't   │
│   exist or has been     │
│   moved.                │
│                         │
│   [Go to Home]          │
└─────────────────────────┘
```

### 2. **500 Server Error**
```
┌─────────────────────────┐
│   ⚠️ Server Error       │
│                         │
│   Something Went Wrong  │
│   We're working on      │
│   fixing this. Please   │
│   try again later.      │
│                         │
│   [Try Again] [Home]    │
└─────────────────────────┘
```

### 3. **Network Error**
```
┌─────────────────────────┐
│   📡 No Connection      │
│                         │
│   You're Offline        │
│   Check your internet   │
│   connection and try    │
│   again.                │
│                         │
│   [Retry]               │
└─────────────────────────┘
```

### 4. **Unauthorized (401)**
```
┌─────────────────────────┐
│   🔒 Access Denied      │
│                         │
│   Login Required        │
│   You need to sign in   │
│   to access this page.  │
│                         │
│   [Sign In]             │
└─────────────────────────┘
```

### 5. **Forbidden (403)**
```
┌─────────────────────────┐
│   🚫 Access Denied      │
│                         │
│   No Permission         │
│   You don't have        │
│   permission to view    │
│   this page.            │
│                         │
│   [Go Back]             │
└─────────────────────────┘
```

### 6. **Rate Limit (429)**
```
┌─────────────────────────┐
│   ⏱️ Slow Down          │
│                         │
│   Too Many Requests     │
│   Please wait a moment  │
│   before trying again.  │
│                         │
│   [Go Back]             │
└─────────────────────────┘
```

---

## 🎨 Recommended Empty State Designs

### Generic Empty State Component (Mobile)
```typescript
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  iconColor?: string;
}
```

### Context-Specific Empty States

#### 1. **Empty Feed**
```
┌─────────────────────────┐
│   📰                    │
│   No Posts Yet          │
│   Your feed is empty.   │
│   Follow communities    │
│   to see updates.       │
│   [Explore]             │
└─────────────────────────┘
```

#### 2. **No Search Results**
```
┌─────────────────────────┐
│   🔍                    │
│   No Results Found      │
│   Try different         │
│   keywords or filters.  │
│   [Clear Filters]       │
└─────────────────────────┘
```

#### 3. **Empty Cart/Orders**
```
┌─────────────────────────┐
│   🛒                    │
│   No Orders Yet         │
│   Start shopping to     │
│   see your orders here. │
│   [Browse Services]     │
└─────────────────────────┘
```

#### 4. **No Notifications**
```
┌─────────────────────────┐
│   🔔                    │
│   All Caught Up!        │
│   You have no new       │
│   notifications.        │
└─────────────────────────┘
```

#### 5. **Empty Chat**
```
┌─────────────────────────┐
│   💬                    │
│   No Messages           │
│   Start a conversation  │
│   with your neighbors.  │
│   [Start Chat]          │
└─────────────────────────┘
```

---

## 📝 Implementation Priority

### HIGH Priority (User-facing, common)

1. ✅ **404 Not Found** (Web) - Users hit invalid URLs often
2. ✅ **500 Server Error** (Web) - Critical for production
3. ✅ **EmptyState Component** (Mobile) - Used everywhere
4. ✅ **Network Error Page** (Web & Mobile) - Poor connectivity common in India
5. ✅ **Empty Feed State** (Mobile) - First-time user experience

### MEDIUM Priority

6. ✅ **401 Unauthorized** (Web)
7. ✅ **403 Forbidden** (Web)
8. ✅ **Empty Search Results** (Mobile & Web)
9. ✅ **Empty Cart/Orders** (Mobile)
10. ✅ **Global Error Boundary** (Web)

### LOW Priority (Edge cases)

11. **429 Rate Limit** (Web)
12. **Maintenance Mode** (Web)
13. **Coming Soon** (For disabled features)

---

## 🛠️ Files to Create

### Web App
- `src/app/not-found.tsx` - 404 page
- `src/app/error.tsx` - Error boundary
- `src/app/global-error.tsx` - Global error handler
- `src/components/NetworkError.tsx` - Network error component
- `src/app/unauthorized/page.tsx` - 401 page
- `src/app/forbidden/page.tsx` - 403 page

### Mobile App
- `apps/mobile/src/components/ui/EmptyState.tsx` - Reusable empty state
- `apps/mobile/src/components/NetworkError.tsx` - Network error screen
- Update all screens to use EmptyState component

---

## 📐 Design Tokens to Use

### Colors (from `@lokul/ui-tokens`)
- Error: `colors.red[600]` (#DC2626)
- Warning: `colors.yellow[500]` (#F59E0B)
- Info: `colors.blue[600]` (#0284C7)
- Success: `colors.green[600]` (#059669)
- Muted text: `colors.gray[500]` (#6B7280)

### Icons (from `lucide-react-native`)
- 404: `SearchX`, `Frown`
- 500: `AlertTriangle`, `ServerCrash`
- Network: `WifiOff`, `Signal`
- Empty: `Inbox`, `Package`, `MessageSquare`
- Success: `CheckCircle2`

### Spacing
- Container padding: `spacing[6]` (24px)
- Icon size: 48-64px
- Gap between elements: `spacing[4]` (16px)

---

## 🎯 Next Steps

1. Review this audit
2. Approve design approach
3. Create missing error pages (Web first)
4. Create EmptyState component (Mobile)
5. Refactor all inline empty states to use component
6. Test error scenarios
7. Add error tracking integration (Sentry)
