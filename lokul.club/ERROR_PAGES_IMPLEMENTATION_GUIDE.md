# Error Pages & Empty States - Implementation Guide

## ✅ Completed Implementation

All error pages and empty state components have been successfully created!

---

## 📱 Web Error Pages

### 1. **404 Not Found** - `/not-found`
- **File**: `src/app/not-found.tsx`
- **Features**: 
  - Automatic 404 handling for invalid routes
  - Navigation to home or back
  - Friendly search icon

### 2. **500 Server Error** - `error.tsx`
- **File**: `src/app/error.tsx`
- **Features**:
  - Catches unhandled errors in app pages
  - Try again & go home buttons
  - Error reporting to API in production
  - Shows error details in development

### 3. **Global Error Handler** - `global-error.tsx`
- **File**: `src/app/global-error.tsx`
- **Features**:
  - Last resort error boundary
  - Catches errors in root layout
  - Reload page functionality

### 4. **401 Unauthorized** - `/unauthorized`
- **File**: `src/app/unauthorized/page.tsx`
- **Features**:
  - Dynamic return URL support
  - Sign in & create account buttons
  - Go back functionality
  - Usage: `router.push('/unauthorized?returnUrl=/protected/page')`

### 5. **403 Forbidden** - `/forbidden`
- **File**: `src/app/forbidden/page.tsx`
- **Features**:
  - Permission denied message
  - Go back & home navigation
  - Contact admin suggestion

### 6. **Network Error Component**
- **File**: `src/components/NetworkError.tsx`
- **Features**:
  - Real-time online/offline detection
  - Connection status indicator
  - Retry functionality
  - Auto-disables retry when offline

---

## 📱 Mobile Components

### 1. **EmptyState Component**
- **File**: `apps/mobile/src/components/ui/EmptyState.tsx`
- **Props**:
  - `icon`: Lucide icon component
  - `iconColor`: Custom icon color
  - `iconBgColor`: Background color for icon circle
  - `title`: Main heading
  - `description`: Optional subtext
  - `actionLabel`: Primary button text
  - `onAction`: Primary button handler
  - `secondaryActionLabel`: Secondary button text
  - `onSecondaryAction`: Secondary button handler
  - `disabled`: Disable primary action

### 2. **NetworkError Component**
- **File**: `apps/mobile/src/components/NetworkError.tsx`
- **Props**:
  - `message`: Custom error message
  - `onRetry`: Retry callback
  - `inline`: Show inline vs full screen
- **Features**:
  - Uses `@react-native-community/netinfo`
  - Real-time connection monitoring
  - Auto-detects online/offline status

---

## 🌐 Web Components

### **Enhanced EmptyState Component**
- **File**: `src/components/ui/EmptyState.tsx`
- **Props**:
  - `icon`: Icon element
  - `iconSize`: Icon size in pixels (default: 48)
  - `iconBgColor`: Background color class
  - `iconColor`: Icon color class
  - `title`: Main heading
  - `description`: Optional description
  - `action`: Custom action node (overrides buttons)
  - `primaryAction`: Primary button config `{ label, href?, onClick? }`
  - `secondaryAction`: Secondary button config
  - `className`: Additional CSS classes
  - `minHeight`: Minimum height in pixels

---

## 📖 Usage Examples

### Web - EmptyState with Navigation

```tsx
import { EmptyState } from '@/components/ui/EmptyState';
import { ShoppingBag } from 'lucide-react';

<EmptyState
  icon={<ShoppingBag size={48} />}
  iconBgColor="bg-blue-50"
  iconColor="text-blue-600"
  title="No Orders Yet"
  description="Browse trusted local services and make your first order to see it here."
  primaryAction={{
    label: "Browse Services",
    href: "/web/marketplace"
  }}
  secondaryAction={{
    label: "View History",
    onClick: () => router.push('/web/orders/history'),
    variant: 'ghost'
  }}
/>
```

### Web - Network Error with Retry

```tsx
import { NetworkError } from '@/components/NetworkError';

<NetworkError
  message="Failed to load posts. Please try again."
  onRetry={() => refetch()}
/>
```

### Mobile - EmptyState

```tsx
import { EmptyState } from '@/components/ui';
import { MessageSquare } from 'lucide-react-native';
import { colors } from '@lokul/ui-tokens';

<EmptyState
  icon={MessageSquare}
  iconColor={colors.primary[600]}
  iconBgColor={colors.primary[50]}
  title="No Messages Yet"
  description="Start conversations with your neighbors to build a stronger community."
  actionLabel="Start Chat"
  onAction={() => router.push('/(chats)/new')}
/>
```

### Mobile - Network Error

```tsx
import { NetworkError } from '@/components/NetworkError';

<NetworkError
  message="Failed to load your feed."
  onRetry={() => refetchFeed()}
  inline={true}
/>
```

---

## 🔄 Redirecting to Error Pages

### 401 Unauthorized (Login Required)

```tsx
// Protect a route
if (!user) {
  router.push(`/unauthorized?returnUrl=${encodeURIComponent(pathname)}`);
}
```

### 403 Forbidden (No Permission)

```tsx
// Check permissions
if (!hasPermission) {
  router.push('/forbidden');
}
```

### Network Error Handling

```tsx
try {
  const res = await fetch('/api/data');
  if (!res.ok) throw new Error('Failed to fetch');
  // handle success
} catch (error) {
  // Show NetworkError component
  setShowNetworkError(true);
}
```

---

## 🎨 Customization Examples

### Custom Icon Colors

```tsx
// Success state
<EmptyState
  icon={<CheckCircle2 size={48} />}
  iconBgColor="bg-green-50"
  iconColor="text-green-600"
  title="All Done!"
/>

// Warning state
<EmptyState
  icon={<AlertTriangle size={48} />}
  iconBgColor="bg-yellow-50"
  iconColor="text-yellow-600"
  title="Action Required"
/>
```

### Multiple Actions

```tsx
<EmptyState
  icon={<Users size={48} />}
  title="No Team Members"
  description="Invite your team to collaborate."
  primaryAction={{
    label: "Invite Team",
    onClick: () => openInviteModal()
  }}
  secondaryAction={{
    label: "Import Contacts",
    onClick: () => openImportModal()
  }}
/>
```

### Inline vs Full Screen

```tsx
// Inline (within a section)
<NetworkError 
  inline={true}
  message="Failed to load section"
  onRetry={refetch}
/>

// Full screen (covers entire view)
<NetworkError 
  message="No internet connection"
  onRetry={refetch}
/>
```

---

## 🔧 Integration Checklist

### For Developers:

- [ ] Import EmptyState component in screens with lists
- [ ] Replace inline empty states with EmptyState component
- [ ] Add NetworkError for API failure scenarios
- [ ] Test error pages by navigating to `/unauthorized`, `/forbidden`
- [ ] Test 404 by navigating to invalid URL
- [ ] Test 500 by throwing an error in a component
- [ ] Verify network error detection on airplane mode
- [ ] Check navigation flows from error pages

### Mobile Specific:

- [ ] Install `@react-native-community/netinfo` if not already installed
- [ ] Update all screens using inline empty state logic
- [ ] Test NetworkError in offline mode
- [ ] Verify EmptyState styling on different screen sizes

### Web Specific:

- [ ] Test error pages in development and production modes
- [ ] Verify error reporting endpoint `/api/errors/report`
- [ ] Check 404 page for all invalid routes
- [ ] Test unauthorized flow with protected routes
- [ ] Verify return URL functionality on `/unauthorized`

---

## 📊 Component Decision Tree

**When to use what:**

```
Is it an error state?
├─ Yes
│  ├─ Network/API failure? → NetworkError component
│  ├─ Page not found? → 404 page (automatic)
│  ├─ Server error? → 500 page (automatic)
│  ├─ Not logged in? → Redirect to /unauthorized
│  └─ No permission? → Redirect to /forbidden
│
└─ No (empty/no data)
   └─ EmptyState component
```

---

## 🎯 Next Steps

1. **Replace Inline Empty States**: 
   - Search codebase for `.length === 0` checks
   - Replace with EmptyState component
   - ~60+ locations to update in mobile app

2. **Add Error Reporting**:
   - Create `/api/errors/report` endpoint
   - Integrate Sentry or similar service
   - Test error reporting in production

3. **Create Error Boundary Wrapper**:
   - Wrap mobile app with ErrorBoundary
   - Add to `apps/mobile/src/app/_layout.tsx`

4. **Testing**:
   - Write tests for error pages
   - Test navigation flows
   - Test offline scenarios

---

## 📞 Support

All components are fully documented with TypeScript types and JSDoc comments. Check the source files for detailed prop descriptions and usage examples.

**Files to reference:**
- Web: `src/components/ui/EmptyState.tsx`, `src/components/NetworkError.tsx`
- Mobile: `apps/mobile/src/components/ui/EmptyState.tsx`, `apps/mobile/src/components/NetworkError.tsx`
- Error Pages: `src/app/not-found.tsx`, `error.tsx`, `global-error.tsx`, etc.
