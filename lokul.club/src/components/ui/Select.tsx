"use client";
import * as React from "react";
import { cn } from "@/lib/cn";
import { ChevronDown } from "lucide-react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
  selectSize?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "h-8 text-sm pl-3 pr-8",
  md: "h-10 text-sm pl-3 pr-9",
  lg: "h-12 text-base pl-4 pr-10",
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ invalid, selectSize = "md", className, children, ...rest }, ref) {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "w-full appearance-none rounded-[6px] border bg-surface text-gray-900 outline-none transition-colors",
            "focus:ring-2 focus:ring-brand-100 focus:border-brand-500",
            "disabled:cursor-not-allowed disabled:opacity-50",
            invalid
              ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100"
              : "border-border",
            sizeMap[selectSize],
            className
          )}
          {...rest}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
      </div>
    );
  }
);
