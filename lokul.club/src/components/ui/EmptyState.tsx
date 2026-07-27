import { cn } from "@/lib/cn";
import Link from "next/link";

interface ActionButton {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
}

interface EmptyStateProps {
  /** Icon element to display (Lucide icon recommended) */
  icon?: React.ReactNode;
  /** Icon size in pixels (default: 48) */
  iconSize?: number;
  /** Icon background color (default: bg-gray-50) */
  iconBgColor?: string;
  /** Icon color (default: text-gray-400) */
  iconColor?: string;
  /** Main title text */
  title: string;
  /** Optional description text */
  description?: string;
  /** Custom action node (overrides action/secondaryAction props) */
  action?: React.ReactNode;
  /** Primary action button configuration */
  primaryAction?: ActionButton;
  /** Secondary action button configuration */
  secondaryAction?: ActionButton;
  /** Additional CSS classes */
  className?: string;
  /** Minimum height (default: 400px) */
  minHeight?: number;
}

function ActionButtonComponent({ 
  label, 
  href, 
  onClick, 
  variant = 'primary' 
}: ActionButton) {
  const baseClasses = "inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-colors";
  const variantClasses = {
    primary: "bg-[#1D65AF] text-white hover:bg-[#165499]",
    secondary: "border-2 border-[#1D65AF] text-[#1D65AF] hover:bg-blue-50",
    ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
  };

  const className = cn(baseClasses, variantClasses[variant]);

  if (href) {
    return (
      <Link href={href} className={className}>
        {label}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={className}>
      {label}
    </button>
  );
}

/**
 * EmptyState component for web
 * Displays a consistent empty state UI with icon, title, description, and optional action buttons
 * 
 * @example
 * ```tsx
 * <EmptyState
 *   icon={<ShoppingBag size={48} />}
 *   iconBgColor="bg-blue-50"
 *   iconColor="text-blue-600"
 *   title="No Orders Yet"
 *   description="Browse trusted local services and make your first order."
 *   primaryAction={{
 *     label: "Browse Services",
 *     href: "/web/marketplace"
 *   }}
 *   secondaryAction={{
 *     label: "Learn More",
 *     onClick: () => showInfo()
 *   }}
 * />
 * ```
 */
export function EmptyState({ 
  icon, 
  iconSize = 48,
  iconBgColor = "bg-gray-50",
  iconColor = "text-gray-400",
  title, 
  description, 
  action,
  primaryAction,
  secondaryAction,
  className,
  minHeight = 400,
}: EmptyStateProps) {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center text-center px-6 py-12", 
        className
      )}
      style={{ minHeight: `${minHeight}px` }}
    >
      {/* Icon Circle */}
      {icon && (
        <div 
          className={cn(
            "flex items-center justify-center rounded-full mb-6",
            iconBgColor,
            iconColor
          )}
          style={{ 
            width: iconSize * 2, 
            height: iconSize * 2 
          }}
        >
          {icon}
        </div>
      )}

      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-900 mb-3">
        {title}
      </h2>

      {/* Description */}
      {description && (
        <p className="text-base text-gray-600 max-w-md mb-6">
          {description}
        </p>
      )}

      {/* Actions */}
      {action && <div className="mt-4">{action}</div>}
      
      {!action && (primaryAction || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          {primaryAction && (
            <ActionButtonComponent {...primaryAction} variant="primary" />
          )}
          {secondaryAction && (
            <ActionButtonComponent 
              {...secondaryAction} 
              variant={secondaryAction.variant || "secondary"} 
            />
          )}
        </div>
      )}
    </div>
  );
}
