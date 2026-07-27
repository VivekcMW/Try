"use client";
import * as React from "react";
import { cn } from "@/lib/cn";

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  function Switch({ label, description, className, id, ...rest }, ref) {
    const autoId = React.useId();
    const inputId = id || autoId;
    return (
      <label htmlFor={inputId} className={cn("inline-flex items-start gap-3 cursor-pointer", className)}>
        <span className="relative inline-block w-9 h-5 mt-0.5">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            role="switch"
            className="peer sr-only"
            {...rest}
          />
          <span className="absolute inset-0 rounded-[6px] bg-gray-300 peer-checked:bg-brand-600 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-brand-100 peer-focus-visible:ring-offset-1 peer-disabled:opacity-50" />
          <span className="absolute left-0.5 top-0.5 size-4 rounded-[6px] bg-white shadow-sm transition-transform peer-checked:translate-x-4" />
        </span>
        {(label || description) && (
          <span className="flex flex-col">
            {label ? <span className="text-sm text-gray-800 leading-tight">{label}</span> : null}
            {description ? <span className="text-xs text-gray-500 mt-0.5">{description}</span> : null}
          </span>
        )}
      </label>
    );
  }
);
