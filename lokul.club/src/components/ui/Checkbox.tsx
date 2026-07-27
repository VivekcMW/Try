"use client";
import * as React from "react";
import { cn } from "@/lib/cn";
import { Check, Minus } from "lucide-react";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  indeterminate?: boolean;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ label, description, indeterminate, className, id, ...rest }, ref) {
    const innerRef = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(ref, () => innerRef.current!, []);
    React.useEffect(() => {
      if (innerRef.current) innerRef.current.indeterminate = !!indeterminate;
    }, [indeterminate]);

    const autoId = React.useId();
    const inputId = id || autoId;
    return (
      <label htmlFor={inputId} className={cn("flex items-start gap-2.5 cursor-pointer", className)}>
        <span className="relative inline-flex items-center justify-center mt-0.5">
          <input
            ref={innerRef}
            id={inputId}
            type="checkbox"
            className="peer size-4 appearance-none rounded border border-border bg-surface checked:bg-brand-600 checked:border-brand-600 indeterminate:bg-brand-600 indeterminate:border-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-100 focus-visible:ring-offset-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            {...rest}
          />
          {indeterminate ? (
            <Minus className="pointer-events-none absolute size-3 text-white" strokeWidth={3} />
          ) : (
            <Check className="pointer-events-none absolute size-3 text-white opacity-0 peer-checked:opacity-100" strokeWidth={3} />
          )}
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
