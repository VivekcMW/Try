# Error & Empty State Design System

## Visual Design Reference

### 🎨 Color Palette

```
ERROR    → #DC2626 (Red 600)    → Destructive actions, critical errors
WARNING  → #F59E0B (Yellow 500) → Caution, rate limits
INFO     → #0284C7 (Blue 600)   → Informational messages
SUCCESS  → #059669 (Green 600)  → Success states
MUTED    → #6B7280 (Gray 500)   → Secondary text
BRAND    → #1D65AF (Blue 600)   → Primary actions
```

---

## 📱 Mobile Empty States (Consistent Pattern)

### Standard Layout Structure
```
┌──────────────────────────────────────────┐
│                                          │
│              [Icon Circle]               │ ← 64×64px icon in colored circle
│                 (Icon)                   │   Background: brand-50, Icon: brand-600
│                                          │
│              Title Text                  │ ← 18px, font-semibold, gray-900
│                                          │
│         Optional description text        │ ← 14px, gray-500, max 2 lines
│       that provides more context         │
│                                          │
│            [Action Button]               │ ← Optional CTA button
│                                          │
└──────────────────────────────────────────┘

Spacing:
- Padding: 48px (spacing[12])
- Icon → Title: 16px (spacing[4])
- Title → Description: 8px (spacing[2])
- Description → Button: 24px (spacing[6])
```

---

## 🌐 Web Error Pages (Full Page)

### Layout Pattern
```
┌──────────────────────────────────────────────────────────┐
│                         Header                           │
├──────────────────────────────────────────────────────────┤
│                                                          │
│                                                          │
│                      [Large Icon]                        │ ← 96×96px
│                                                          │
│                    Error Code / Title                    │ ← 32px, font-bold
│                                                          │
│                  Friendly description                    │ ← 16px, gray-600
│                  explaining what happened                │
│                                                          │
│            [Primary Action]  [Secondary]                 │
│                                                          │
│                                                          │
│                                                          │
└──────────────────────────────────────────────────────────┘
│                         Footer                           │
└──────────────────────────────────────────────────────────┘

Spacing:
- Top padding: 96px
- Icon → Title: 24px
- Title → Description: 12px
- Description → Buttons: 32px
- Max width: 600px, centered
```

---

## 🎭 Specific Page Designs

### 1. 404 Not Found

**Visual Hierarchy:**
```
        🔍
    Page Not Found
    
We couldn't find the page
you're looking for. It may
have been moved or deleted.

  [Go to Home]  [Go Back]
```

**Copy:**
- **Title**: "Page Not Found"
- **Description**: "We couldn't find the page you're looking for. It may have been moved or deleted."
- **Primary Action**: "Go to Home"
- **Secondary Action**: "Go Back"

**Icon**: `Search` or `FileQuestion` (64px, gray-400)

---

### 2. 500 Server Error

**Visual Hierarchy:**
```
        ⚠️
  Something Went Wrong
  
We're experiencing technical
difficulties. Our team has been
notified. Please try again.

  [Try Again]  [Go to Home]
```

**Copy:**
- **Title**: "Something Went Wrong"
- **Description**: "We're experiencing technical difficulties. Our team has been notified and is working to fix the issue."
- **Primary Action**: "Try Again"
- **Secondary Action**: "Go to Home"

**Icon**: `AlertTriangle` or `ServerCrash` (64px, red-500)

---

### 3. Network/Offline Error

**Visual Hierarchy:**
```
        📡
    You're Offline
    
Check your internet connection
and try again. Your changes will
be saved when you're back online.

     [Retry Connection]
```

**Copy:**
- **Title**: "You're Offline"
- **Description**: "Check your internet connection and try again. Your changes will be saved when you're back online."
- **Primary Action**: "Retry Connection"

**Icon**: `WifiOff` (64px, gray-400)

**Additional State**: Show connectivity status icon in header

---

### 4. 401 Unauthorized

**Visual Hierarchy:**
```
        🔒
   Access Denied
   
You need to sign in to access
this page. Create an account or
sign in to continue.

  [Sign In]  [Create Account]
```

**Copy:**
- **Title**: "Access Denied"
- **Description**: "You need to sign in to access this page. Create an account or sign in to continue."
- **Primary Action**: "Sign In"
- **Secondary Action**: "Create Account"

**Icon**: `Lock` (64px, blue-500)

---

### 5. 403 Forbidden

**Visual Hierarchy:**
```
        🚫
  Permission Denied
  
You don't have permission to
view this page. Contact your
community admin for access.

       [Go Back]
```

**Copy:**
- **Title**: "Permission Denied"
- **Description**: "You don't have permission to view this page. Contact your community admin for access."
- **Primary Action**: "Go Back"

**Icon**: `ShieldX` (64px, red-500)

---

### 6. Empty Feed

**Visual Hierarchy:**
```
        📰
    Your Feed is Empty
    
Welcome to Lokul! Follow
communities and neighbors to
see updates here.

      [Explore]
```

**Copy:**
- **Title**: "Your Feed is Empty"
- **Description**: "Welcome to Lokul! Follow communities and neighbors to see updates here."
- **Primary Action**: "Explore Communities"

**Icon**: `Newspaper` (48px, brand-600)

---

### 7. No Search Results

**Visual Hierarchy:**
```
        🔍
   No Results Found
   
Try different keywords or
adjust your filters to find
what you're looking for.

    [Clear Filters]
```

**Copy:**
- **Title**: "No Results Found"
- **Description**: "Try different keywords or adjust your filters to find what you're looking for."
- **Primary Action**: "Clear Filters"

**Icon**: `SearchX` (48px, gray-400)

---

### 8. Empty Orders

**Visual Hierarchy:**
```
        🛒
    No Orders Yet
    
Browse trusted local services
and make your first order to
see it here.

   [Browse Services]
```

**Copy:**
- **Title**: "No Orders Yet"
- **Description**: "Browse trusted local services and make your first order to see it here."
- **Primary Action**: "Browse Services"

**Icon**: `ShoppingBag` (48px, brand-600)

---

### 9. No Notifications

**Visual Hierarchy:**
```
        🔔
   All Caught Up!
   
You have no new notifications.
We'll notify you when something
important happens.
```

**Copy:**
- **Title**: "All Caught Up!"
- **Description**: "You have no new notifications. We'll notify you when something important happens."

**Icon**: `BellOff` (48px, green-500)

---

### 10. Empty Chat

**Visual Hierarchy:**
```
        💬
    No Messages Yet
    
Start conversations with your
neighbors to build a stronger
community.

    [Start Chat]
```

**Copy:**
- **Title**: "No Messages Yet"
- **Description**: "Start conversations with your neighbors to build a stronger community."
- **Primary Action**: "Start Chat"

**Icon**: `MessageSquare` (48px, brand-600)

---

## 🎯 Component Props API

### Web EmptyState
```typescript
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}
```

### Mobile EmptyState
```typescript
interface EmptyStateProps {
  icon: LucideIcon;
  iconColor?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}
```

---

## 📊 Usage Examples

### Web (Next.js)
```tsx
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchX } from 'lucide-react';

<EmptyState
  icon={<SearchX size={48} />}
  title="No Results Found"
  description="Try different keywords or adjust your filters."
  action={{
    label: "Clear Filters",
    onClick: () => clearFilters()
  }}
/>
```

### Mobile (React Native)
```tsx
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchX } from 'lucide-react-native';

<EmptyState
  icon={SearchX}
  iconColor={colors.gray[400]}
  title="No Results Found"
  description="Try different keywords or adjust your filters."
  actionLabel="Clear Filters"
  onAction={clearFilters}
/>
```

---

## 🎨 Animation Guidelines

### Entry Animation
- Fade in: 300ms ease-out
- Slide up: 20px with 400ms spring
- Stagger icon → title → description → button by 100ms each

### Icon Animation
- Pulse on mount (scale 1 → 1.05 → 1)
- Duration: 600ms
- Ease: ease-in-out

### Button Hover (Web)
- Scale: 1.02
- Shadow: elevation-md
- Duration: 200ms

---

## ✨ Accessibility Requirements

### ARIA Labels
```tsx
<EmptyState
  role="status"
  aria-label="No content available"
  aria-live="polite"
>
  ...
</EmptyState>
```

### Focus Management
- First interactive element (button) should receive focus
- Tab order: Primary Action → Secondary Action
- Keyboard shortcuts: Enter triggers primary action

### Screen Reader Announcements
- Announce empty state when mounted
- Clear, descriptive title and description
- Action buttons have descriptive labels

---

## 📱 Responsive Behavior

### Mobile (< 768px)
- Icon: 48px
- Title: 18px
- Description: 14px
- Single column buttons (full width)
- Padding: 24px

### Tablet (768px - 1024px)
- Icon: 56px
- Title: 20px
- Description: 14px
- Buttons: side-by-side if 2 actions

### Desktop (> 1024px)
- Icon: 64px
- Title: 24px
- Description: 16px
- Max width: 600px centered
- Buttons: side-by-side

---

## 🔧 Implementation Checklist

### For Each Error/Empty State:

- [ ] Choose appropriate icon
- [ ] Write clear, friendly copy
- [ ] Define primary action (if needed)
- [ ] Define secondary action (if needed)
- [ ] Set correct icon color
- [ ] Test with screen reader
- [ ] Test keyboard navigation
- [ ] Test on mobile, tablet, desktop
- [ ] Verify animation timing
- [ ] Check color contrast (WCAG AA)
- [ ] Add tracking/analytics event

---

## 🎯 Tone & Voice Guidelines

### DO:
✅ Use friendly, conversational language
✅ Explain what happened clearly
✅ Offer a next step or solution
✅ Be concise (1-2 sentences max)
✅ Use active voice
✅ Be reassuring and positive

### DON'T:
❌ Use technical jargon
❌ Blame the user
❌ Use "error" or "failed" in user-facing text
❌ Be vague ("Something happened")
❌ Write long paragraphs
❌ Use ALL CAPS or excessive punctuation!!!

### Examples:

**Bad**: "ERROR: Request failed with status code 404"
**Good**: "We couldn't find this page"

**Bad**: "No data available in the database table"
**Good**: "No orders yet. Start shopping to see orders here!"

**Bad**: "Network connection timeout exception occurred"
**Good**: "Check your internet connection and try again"

---

## 🎨 Brand Personality in Empty States

Lokul's voice should be:
1. **Helpful** - Always suggest next steps
2. **Warm** - Use friendly, neighborly language
3. **Clear** - No confusion about what happened
4. **Empowering** - Make users feel in control

Example tone variations:

**Formal** (Admin/Business):
"No appointments scheduled"

**Friendly** (Community/Social):
"Your feed is quiet today! 🌟"

**Encouraging** (Onboarding):
"Let's get started! Add your first listing."
