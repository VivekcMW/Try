"use client";
import * as React from "react";
import { cn } from "@/lib/cn";

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  function Radio({ label, description, className, id, ...rest }, ref) {
    const autoId = React.useId();
    const inputId = id || autoId;
    return (
      <label htmlFor={inputId} className={cn("flex items-start gap-2.5 cursor-pointer", className)}>
        <span className="relative inline-flex items-center justify-center mt-0.5">
          <input
            ref={ref}
            id={inputId}
            type="radio"
            className="peer size-4 appearance-none rounded-[6px] border border-border bg-surface checked:border-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-100 focus-visible:ring-offset-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            {...rest}
          />
          <span className="pointer-events-none absolute size-2 rounded-[6px] bg-brand-600 opacity-0 peer-checked:opacity-100" />
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

interface RadioGroupProps {
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function RadioGroup({ name, value, onChange, children, className }: RadioGroupProps) {
  return (
    <div role="radiogroup" className={cn("flex flex-col gap-2", className)}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        const childProps = child.props as RadioProps;
        return React.cloneElement(child as React.ReactElement<RadioProps>, {
          name,
          checked: value === childProps.value,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange?.(e.target.value),
        });
      })}
    </div>
  );
}
