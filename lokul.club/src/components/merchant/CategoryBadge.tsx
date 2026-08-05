"use client";

import type { MerchantCategory } from "@/types/merchant-categories";
import {
  getCategoryLabel,
  getCategoryEmoji,
  getCategoryColor,
} from "@/types/merchant-categories";

interface CategoryBadgeProps {
  category: MerchantCategory;
  size?: "sm" | "md" | "lg";
  showEmoji?: boolean;
  className?: string;
}

/**
 * CategoryBadge - Display a merchant category with emoji, label, and color
 * 
 * @example
 * <CategoryBadge category="kirana" />
 * <CategoryBadge category="restaurant" size="lg" showEmoji={false} />
 */
export function CategoryBadge({
  category,
  size = "md",
  showEmoji = true,
  className = "",
}: Readonly<CategoryBadgeProps>) {
  const label = getCategoryLabel(category);
  const emoji = getCategoryEmoji(category);
  const color = getCategoryColor(category);

  // Size-based styling
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-3 py-1 text-sm gap-1.5",
    lg: "px-4 py-1.5 text-base gap-2",
  };

  const emojiSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <span
      className={`inline-flex items-center rounded-md font-medium ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: `${color}15`, // 15% opacity
        color: color,
        borderColor: `${color}40`, // 40% opacity
        borderWidth: "1px",
        borderStyle: "solid",
      }}
    >
      {showEmoji && <span className={emojiSizes[size]}>{emoji}</span>}
      <span>{label}</span>
    </span>
  );
}
