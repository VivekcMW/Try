"use client";
import * as React from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  invalid?: boolean;
  inputSize?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "h-8 text-sm",
  md: "h-10 text-sm",
  lg: "h-12 text-base",
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input({ leftIcon, rightIcon, invalid, inputSize = "md", className, ...rest }, ref) {
    return (
      <div
        className={cn(
          "flex items-center rounded-[6px] border bg-surface transition-colors",
          "focus-within:ring-2 focus-within:ring-brand-100 focus-within:border-brand-500",
          invalid
            ? "border-rose-400 focus-within:border-rose-500 focus-within:ring-rose-100"
            : "border-border",
          sizeMap[inputSize],
          className
        )}
      >
        {leftIcon ? (
          <span className="pl-3 text-gray-400 flex items-center">{leftIcon}</span>
        ) : null}
        <input
          ref={ref}
          className={cn(
            "flex-1 bg-transparent px-3 outline-none placeholder:text-gray-400 text-gray-900",
            "disabled:cursor-not-allowed disabled:opacity-50",
            leftIcon && "pl-2",
            rightIcon && "pr-2"
          )}
          {...rest}
        />
        {rightIcon ? (
          <span className="pr-3 text-gray-400 flex items-center">{rightIcon}</span>
        ) : null}
      </div>
    );
  }
);
