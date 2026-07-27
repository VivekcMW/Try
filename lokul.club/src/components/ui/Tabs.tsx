"use client";
import * as React from "react";
import { cn } from "@/lib/cn";

interface TabItem {
  value: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  variant?: "line" | "pill";
  className?: string;
}

export function Tabs({ items, value, onChange, variant = "line", className }: TabsProps) {
  if (variant === "pill") {
    return (
      <div
        role="tablist"
        className={cn("inline-flex gap-1 rounded-[6px] bg-surface-muted p-1", className)}
      >
        {items.map((item) => {
          const active = item.value === value;
          return (
            <button
              key={item.value}
              role="tab"
              aria-selected={active}
              disabled={item.disabled}
              onClick={() => onChange(item.value)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded px-3 h-8 text-sm font-medium transition-colors",
                active
                  ? "bg-surface text-gray-900 shadow-xs"
                  : "text-gray-600 hover:text-gray-900",
                item.disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </div>
    );
  }
  return (
    <div role="tablist" className={cn("flex gap-4 border-b border-border", className)}>
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            role="tab"
            aria-selected={active}
            disabled={item.disabled}
            onClick={() => onChange(item.value)}
            className={cn(
              "inline-flex items-center gap-1.5 px-1 pb-2.5 -mb-px border-b-2 text-sm font-medium transition-colors",
              active
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-gray-600 hover:text-gray-900",
              item.disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {item.icon}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
