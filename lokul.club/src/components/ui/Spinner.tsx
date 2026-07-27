import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

const sizeMap = { sm: "size-4", md: "size-6", lg: "size-8" };

export function Spinner({ size = "md", className, label = "Loading" }: SpinnerProps) {
  return (
    <Loader2
      role="status"
      aria-label={label}
      className={cn("animate-spin text-brand-600", sizeMap[size], className)}
    />
  );
}
