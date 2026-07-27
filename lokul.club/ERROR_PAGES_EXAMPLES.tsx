/**
 * Example Usage: Error Pages & Empty States
 * 
 * This file demonstrates how to use all error pages and empty state components
 * for both Web and Mobile platforms
 */

// ============================================================================
// WEB EXAMPLES
// ============================================================================

import { EmptyState } from '@/components/ui/EmptyState';
import { NetworkError } from '@/components/NetworkError';
import { 
  ShoppingBag, 
  MessageSquare, 
  SearchX, 
  BellOff,
  Users,
  Inbox 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// ----------------------------------------------------------------------------
// 1. Empty Orders List
// ----------------------------------------------------------------------------
export function EmptyOrdersExample() {
  return (
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
    />
  );
}

// ----------------------------------------------------------------------------
// 2. Empty Search Results
// ----------------------------------------------------------------------------
export function EmptySearchExample({ onClearFilters }: { onClearFilters: () => void }) {
  return (
    <EmptyState
      icon={<SearchX size={48} />}
      iconBgColor="bg-gray-50"
      iconColor="text-gray-400"
      title="No Results Found"
      description="Try different keywords or adjust your filters to find what you're looking for."
      primaryAction={{
        label: "Clear Filters",
        onClick: onClearFilters
      }}
      secondaryAction={{
        label: "View All",
        href: "/web/marketplace",
        variant: 'ghost'
      }}
    />
  );
}

// ----------------------------------------------------------------------------
// 3. Network Error with Retry
// ----------------------------------------------------------------------------
export function NetworkErrorExample({ onRetry }: { onRetry: () => void }) {
  return (
    <NetworkError
      message="Failed to load posts. Please check your connection and try again."
      onRetry={onRetry}
    />
  );
}

// ----------------------------------------------------------------------------
// 4. Empty Notifications
// ----------------------------------------------------------------------------
export function EmptyNotificationsExample() {
  return (
    <EmptyState
      icon={<BellOff size={48} />}
      iconBgColor="bg-green-50"
      iconColor="text-green-600"
      title="All Caught Up!"
      description="You have no new notifications. We'll notify you when something important happens."
      minHeight={300}
    />
  );
}

// ----------------------------------------------------------------------------
// 5. Protected Route - Redirect to Unauthorized
// ----------------------------------------------------------------------------
export function ProtectedRouteExample() {
  const router = useRouter();
  const isAuthenticated = false; // Check auth state

  if (!isAuthenticated) {
    // Redirect with return URL
    router.push(`/unauthorized?returnUrl=${encodeURIComponent(window.location.pathname)}`);
    return null;
  }

  return <div>Protected Content</div>;
}

// ----------------------------------------------------------------------------
// 6. Permission Check - Redirect to Forbidden
// ----------------------------------------------------------------------------
export function PermissionCheckExample() {
  const router = useRouter();
  const hasPermission = false; // Check permissions

  if (!hasPermission) {
    router.push('/forbidden');
    return null;
  }

  return <div>Admin Content</div>;
}

// ----------------------------------------------------------------------------
// 7. Empty Messages/Chat
// ----------------------------------------------------------------------------
export function EmptyChatExample() {
  return (
    <EmptyState
      icon={<MessageSquare size={48} />}
      iconBgColor="bg-blue-50"
      iconColor="text-blue-600"
      title="No Messages Yet"
      description="Start conversations with your neighbors to build a stronger community."
      primaryAction={{
        label: "Start Chat",
        href: "/web/chats/new"
      }}
    />
  );
}

// ----------------------------------------------------------------------------
// 8. Empty Team/Group
// ----------------------------------------------------------------------------
export function EmptyTeamExample({ onInvite, onImport }: { 
  onInvite: () => void;
  onImport: () => void;
}) {
  return (
    <EmptyState
      icon={<Users size={48} />}
      iconBgColor="bg-purple-50"
      iconColor="text-purple-600"
      title="No Team Members"
      description="Invite your team members to start collaborating on projects together."
      primaryAction={{
        label: "Invite Team",
        onClick: onInvite
      }}
      secondaryAction={{
        label: "Import Contacts",
        onClick: onImport
      }}
    />
  );
}

// ============================================================================
// MOBILE EXAMPLES (React Native)
// ============================================================================

/*
import { EmptyState } from '@/components/ui';
import { NetworkError } from '@/components/NetworkError';
import { 
  ShoppingBag, 
  MessageSquare, 
  SearchX, 
  BellOff,
  Package,
  Calendar
} from 'lucide-react-native';
import { colors } from '@lokul/ui-tokens';
import { useRouter } from 'expo-router';

// ----------------------------------------------------------------------------
// 1. Empty Orders (Mobile)
// ----------------------------------------------------------------------------
export function MobileEmptyOrdersExample() {
  const router = useRouter();
  
  return (
    <EmptyState
      icon={ShoppingBag}
      iconColor={colors.primary[600]}
      iconBgColor={colors.primary[50]}
      title="No Orders Yet"
      description="Browse trusted local services and make your first order to see it here."
      actionLabel="Browse Services"
      onAction={() => router.push('/(marketplace)')}
    />
  );
}

// ----------------------------------------------------------------------------
// 2. Empty Search Results (Mobile)
// ----------------------------------------------------------------------------
export function MobileEmptySearchExample({ onClearFilters }: { 
  onClearFilters: () => void 
}) {
  return (
    <EmptyState
      icon={SearchX}
      iconColor={colors.gray[400]}
      iconBgColor={colors.gray[50]}
      title="No Results Found"
      description="Try different keywords or adjust your filters."
      actionLabel="Clear Filters"
      onAction={onClearFilters}
    />
  );
}

// ----------------------------------------------------------------------------
// 3. Network Error (Mobile)
// ----------------------------------------------------------------------------
export function MobileNetworkErrorExample({ onRetry }: { onRetry: () => void }) {
  return (
    <NetworkError
      message="Failed to load your feed. Please try again."
      onRetry={onRetry}
      inline={false} // Full screen
    />
  );
}

// ----------------------------------------------------------------------------
// 4. Inline Network Error (Mobile)
// ----------------------------------------------------------------------------
export function MobileInlineNetworkErrorExample({ onRetry }: { onRetry: () => void }) {
  return (
    <NetworkError
      message="Failed to load section."
      onRetry={onRetry}
      inline={true} // Inline in a section
    />
  );
}

// ----------------------------------------------------------------------------
// 5. Empty Notifications (Mobile)
// ----------------------------------------------------------------------------
export function MobileEmptyNotificationsExample() {
  return (
    <EmptyState
      icon={BellOff}
      iconColor={colors.green[600]}
      iconBgColor={colors.green[50]}
      title="All Caught Up!"
      description="You have no new notifications."
    />
  );
}

// ----------------------------------------------------------------------------
// 6. Empty Messages (Mobile)
// ----------------------------------------------------------------------------
export function MobileEmptyChatExample() {
  const router = useRouter();
  
  return (
    <EmptyState
      icon={MessageSquare}
      iconColor={colors.primary[600]}
      iconBgColor={colors.primary[50]}
      title="No Messages Yet"
      description="Start conversations with your neighbors."
      actionLabel="Start Chat"
      onAction={() => router.push('/(chats)/new')}
    />
  );
}

// ----------------------------------------------------------------------------
// 7. Empty Bookings/Appointments (Mobile)
// ----------------------------------------------------------------------------
export function MobileEmptyBookingsExample() {
  const router = useRouter();
  
  return (
    <EmptyState
      icon={Calendar}
      iconColor={colors.blue[600]}
      iconBgColor={colors.blue[50]}
      title="No Bookings Yet"
      description="Book amenities and services to see them here."
      actionLabel="Browse Services"
      onAction={() => router.push('/(marketplace)')}
      secondaryActionLabel="View Calendar"
      onSecondaryAction={() => router.push('/(calendar)')}
    />
  );
}

// ----------------------------------------------------------------------------
// 8. Empty Listings (Mobile)
// ----------------------------------------------------------------------------
export function MobileEmptyListingsExample() {
  const router = useRouter();
  
  return (
    <EmptyState
      icon={Package}
      iconColor={colors.orange[600]}
      iconBgColor={colors.orange[50]}
      title="No Listings"
      description="Create your first listing to start selling."
      actionLabel="Create Listing"
      onAction={() => router.push('/(classifieds)/create')}
    />
  );
}

*/

// ============================================================================
// API ERROR HANDLING EXAMPLES
// ============================================================================

// ----------------------------------------------------------------------------
// Handling Network Errors in Data Fetching
// ----------------------------------------------------------------------------
export async function fetchWithErrorHandling() {
  try {
    const response = await fetch('/api/posts');
    
    if (!response.ok) {
      if (response.status === 401) {
        // Redirect to unauthorized page
        window.location.href = `/unauthorized?returnUrl=${encodeURIComponent(window.location.pathname)}`;
        return null;
      }
      
      if (response.status === 403) {
        // Redirect to forbidden page
        window.location.href = '/forbidden';
        return null;
      }
      
      if (response.status === 404) {
        // Will automatically show 404 page
        return null;
      }
      
      // Other errors - show error state
      throw new Error('Failed to fetch');
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('Network error:', error);
    // Show NetworkError component
    return { error: true, message: 'Network error occurred' };
  }
}

// ----------------------------------------------------------------------------
// React Component with Error Handling
// ----------------------------------------------------------------------------
export function DataListWithErrorHandling() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    
    try {
      const response = await fetch('/api/data');
      if (!response.ok) throw new Error('Failed to fetch');
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  
  if (error) {
    return <NetworkError onRetry={fetchData} />;
  }
  
  if (data.length === 0) {
    return (
      <EmptyState
        icon={<Inbox size={48} />}
        title="No Data Available"
        description="There's nothing to show here yet."
        primaryAction={{
          label: "Refresh",
          onClick: fetchData
        }}
      />
    );
  }

  return (
    <div>
      {data.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}

// ============================================================================
// NAVIGATION HELPERS
// ============================================================================

/**
 * Redirect to unauthorized page with return URL
 */
export function redirectToLogin(returnPath: string) {
  const returnUrl = encodeURIComponent(returnPath);
  window.location.href = `/unauthorized?returnUrl=${returnUrl}`;
}

/**
 * Redirect to forbidden page
 */
export function redirectToForbidden() {
  window.location.href = '/forbidden';
}

/**
 * Check authentication and redirect if needed
 */
export function requireAuth(isAuthenticated: boolean, currentPath: string) {
  if (!isAuthenticated) {
    redirectToLogin(currentPath);
    return false;
  }
  return true;
}

/**
 * Check permission and redirect if needed
 */
export function requirePermission(hasPermission: boolean) {
  if (!hasPermission) {
    redirectToForbidden();
    return false;
  }
  return true;
}
