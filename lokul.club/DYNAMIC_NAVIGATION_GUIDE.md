# Dynamic Navigation Flow - Error Pages & Empty States

## 🚀 Implementation Complete!

All error pages and empty states are now **fully dynamic** with easy navigation built-in. Users can seamlessly move between pages without dead ends.

---

## 📍 Navigation Map

```
┌─────────────────────────────────────────────────────────────┐
│                        ANY PAGE                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ├─► Invalid URL
                            │   └─► 404 Not Found
                            │       ├─► [Go to Home] → /web/feed
                            │       └─► [Go Back] → Previous page
                            │
                            ├─► Server Error
                            │   └─► 500 Error Page
                            │       ├─► [Try Again] → Retry request
                            │       └─► [Go to Home] → /web/feed
                            │
                            ├─► Not Logged In
                            │   └─► 401 Unauthorized (/unauthorized)
                            │       ├─► [Sign In] → /login?returnUrl=...
                            │       ├─► [Create Account] → /signup?returnUrl=...
                            │       └─► [Go Back] → Previous page
                            │
                            ├─► No Permission
                            │   └─► 403 Forbidden (/forbidden)
                            │       ├─► [Go Back] → Previous page
                            │       └─► [Go to Home] → /web/feed
                            │
                            ├─► Network Error
                            │   └─► NetworkError Component
                            │       ├─► [Retry Connection] → Retry request
                            │       └─► Shows online/offline status
                            │
                            └─► Empty List
                                └─► EmptyState Component
                                    ├─► [Primary Action] → Contextual action
                                    └─► [Secondary Action] → Alternative action
```

---

## 🎯 Dynamic Features

### 1. **Smart Return URLs**

The `/unauthorized` page preserves where the user was trying to go:

```typescript
// User tries to access /web/admin/users
// Redirected to: /unauthorized?returnUrl=/web/admin/users

// After login, automatically returned to /web/admin/users
```

**Implementation:**
```typescript
// Redirect to unauthorized
router.push(`/unauthorized?returnUrl=${encodeURIComponent('/web/admin/users')}`);

// In unauthorized page, it automatically:
// - Extracts returnUrl from query params
// - Passes it to login: /login?returnUrl=/web/admin/users
// - After login, redirects back to original page
```

### 2. **Intelligent Navigation Buttons**

Every error page has context-aware navigation:

| Page | Primary Action | Secondary Action | Tertiary Action |
|------|---------------|------------------|-----------------|
| 404 Not Found | Go to Home | Go Back | - |
| 500 Error | Try Again | Go to Home | - |
| Global Error | Reload Page | Go to Homepage | - |
| 401 Unauthorized | Sign In | Create Account | Go Back |
| 403 Forbidden | Go Back | Go to Home | - |
| Network Error | Retry Connection | - | - |

### 3. **Real-time Network Status**

The `NetworkError` component automatically:
- Detects online/offline status
- Shows connection indicator (🟢 Online / 🔴 Offline)
- Disables retry button when offline
- Re-enables when connection restored

**Mobile Implementation:**
```typescript
// Uses @react-native-community/netinfo
// Automatically subscribes to network changes
// Shows status: "Internet Connected" or "No Internet Connection"
```

### 4. **Context-Aware Empty States**

Empty states guide users to the next action:

```typescript
// Empty orders
<EmptyState
  title="No Orders Yet"
  primaryAction={{ 
    label: "Browse Services",
    href: "/web/marketplace"  // Direct link
  }}
/>

// Empty search results
<EmptyState
  title="No Results Found"
  primaryAction={{ 
    label: "Clear Filters",
    onClick: clearFilters  // Execute function
  }}
  secondaryAction={{
    label: "View All",
    href: "/web/marketplace"
  }}
/>
```

---

## 📱 Platform-Specific Navigation

### Web Navigation
Uses Next.js routing for smooth transitions:
- `<Link href="/path">` for page navigation
- `router.push('/path')` for programmatic navigation
- `router.back()` for going back
- `window.location.href` for full page reload (auth redirects)

### Mobile Navigation
Uses Expo Router for native feel:
- `router.push('/(tabs)/explore')` for tab navigation
- `router.replace('/path')` for replacing current screen
- `router.back()` for going back
- Deep linking support for notification navigation

---

## 🔄 Navigation Flows

### Flow 1: Protected Route Access
```
User visits /web/admin/users (not logged in)
    ↓
Redirect to /unauthorized?returnUrl=/web/admin/users
    ↓
User clicks [Sign In]
    ↓
Redirect to /login?returnUrl=/web/admin/users
    ↓
User logs in successfully
    ↓
Automatically redirect to /web/admin/users ✅
```

### Flow 2: Network Error Recovery
```
User loading feed → Network fails
    ↓
Show NetworkError component
    ↓
User goes offline (detected automatically)
    ↓
Status changes to "No Internet Connection"
    ↓
Retry button disabled
    ↓
User reconnects (detected automatically)
    ↓
Status changes to "Internet Connected"
    ↓
Retry button enabled
    ↓
User clicks [Retry Connection]
    ↓
Fetch data again → Success ✅
```

### Flow 3: Empty State Navigation
```
User opens Orders page → Empty list
    ↓
Show EmptyState: "No Orders Yet"
    ↓
User clicks [Browse Services]
    ↓
Navigate to /web/marketplace
    ↓
User makes order
    ↓
Navigate back to Orders
    ↓
Order appears in list ✅
```

---

## 🎨 Customization Examples

### Custom Navigation Handlers

```typescript
// Web - Multiple navigation options
<EmptyState
  title="No Team Members"
  primaryAction={{
    label: "Invite Team",
    onClick: () => openInviteModal()  // Open modal
  }}
  secondaryAction={{
    label: "Import from CSV",
    onClick: () => handleFileUpload()  // File upload
  }}
/>

// Mobile - Navigate to different screens
<EmptyState
  title="No Bookings"
  actionLabel="Browse Services"
  onAction={() => router.push('/(marketplace)')}
  secondaryActionLabel="View Calendar"
  onSecondaryAction={() => router.push('/(calendar)')}
/>
```

### Dynamic Return Paths

```typescript
// Save current path before redirecting
const currentPath = window.location.pathname;

// Redirect with context
router.push(`/unauthorized?returnUrl=${encodeURIComponent(currentPath)}`);

// On login success
const returnUrl = searchParams.get('returnUrl') || '/web/feed';
router.push(returnUrl);
```

### Conditional Navigation

```typescript
// Show different actions based on state
<EmptyState
  title="No Results"
  primaryAction={
    hasFilters 
      ? { label: "Clear Filters", onClick: clearFilters }
      : { label: "Browse All", href: "/web/marketplace" }
  }
/>
```

---

## 🧭 Navigation Best Practices

### 1. **Always Provide a Way Back**
✅ Good: Every error page has Go Back or Go Home
❌ Bad: Dead-end error pages with no navigation

### 2. **Preserve User Context**
✅ Good: `/unauthorized?returnUrl=/admin/users`
❌ Bad: Redirect to login, lose original destination

### 3. **Make Actions Obvious**
✅ Good: "Browse Services" (clear what happens)
❌ Bad: "Click Here" (unclear outcome)

### 4. **Handle Network Gracefully**
✅ Good: Auto-detect online/offline, disable when offline
❌ Bad: Allow retry when offline, fail again

### 5. **Provide Alternatives**
✅ Good: Primary + Secondary actions
❌ Bad: Single action or no action

---

## 🔗 Quick Navigation Reference

### Error Page URLs
- **404 Not Found**: Automatic for invalid URLs
- **500 Server Error**: Automatic on unhandled errors
- **401 Unauthorized**: `/unauthorized?returnUrl=...`
- **403 Forbidden**: `/forbidden`

### Programmatic Navigation

```typescript
// Redirect to login with return
router.push(`/unauthorized?returnUrl=${encodeURIComponent(currentPath)}`);

// Redirect to forbidden
router.push('/forbidden');

// Go back
router.back();

// Go home
router.push('/web/feed');

// Reload page
window.location.reload();
```

### Component Navigation

```typescript
// EmptyState with link
<EmptyState
  primaryAction={{ label: "Go", href: "/path" }}
/>

// EmptyState with handler
<EmptyState
  primaryAction={{ label: "Click", onClick: handleClick }}
/>

// NetworkError with retry
<NetworkError onRetry={refetch} />
```

---

## ✅ Implementation Checklist

- [x] 404 Not Found page with navigation
- [x] 500 Error page with retry
- [x] Global Error handler
- [x] 401 Unauthorized with return URL
- [x] 403 Forbidden with go back
- [x] Network Error component (Web)
- [x] Network Error component (Mobile)
- [x] EmptyState component (Web)
- [x] EmptyState component (Mobile)
- [x] Real-time network detection
- [x] Dynamic return URLs
- [x] Context-aware actions
- [x] Multiple navigation options
- [x] TypeScript types
- [x] JSDoc documentation
- [x] Usage examples

---

## 🎯 User Experience Impact

### Before:
- ❌ Dead-end error pages
- ❌ Lost context after errors
- ❌ No retry options
- ❌ Inconsistent empty states
- ❌ Manual navigation needed

### After:
- ✅ Every error has navigation
- ✅ Context preserved (return URLs)
- ✅ Smart retry with network detection
- ✅ Consistent, beautiful empty states
- ✅ One-click navigation anywhere

---

**Users can now navigate seamlessly throughout the entire app, even when errors occur!** 🚀
