import * as React from "react";
import { cn } from "@/lib/cn";

type Size = "xs" | "sm" | "md" | "lg" | "xl";

const sizeMap: Record<Size, string> = {
  xs: "size-6 text-xs",
  sm: "size-8 text-sm",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
  xl: "size-16 text-lg",
};

interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: Size;
}

function initials(name?: string) {
  if (!name) return "";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("");
}

export function Avatar({ src, alt, name, size = "md", className, ...rest }: AvatarProps) {
  const [errored, setErrored] = React.useState(false);
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-[6px] bg-brand-100 text-brand-700 font-semibold overflow-hidden",
        sizeMap[size],
        className
      )}
      {...rest}
    >
      {src && !errored ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt ?? name ?? "avatar"}
          className="h-full w-full object-cover"
          onError={() => setErrored(true)}
        />
      ) : (
        <span>{initials(name) || "?"}</span>
      )}
    </span>
  );
}

export function AvatarGroup({
  children,
  max = 4,
  className,
}: {
  children: React.ReactNode;
  max?: number;
  className?: string;
}) {
  const items = React.Children.toArray(children);
  const visible = items.slice(0, max);
  const extra = items.length - visible.length;
  return (
    <span className={cn("inline-flex -space-x-2", className)}>
      {visible.map((c, i) => (
        <span key={i} className="ring-2 ring-surface rounded-[6px]">
          {c}
        </span>
      ))}
      {extra > 0 && (
        <span className="ring-2 ring-surface inline-flex items-center justify-center rounded-[6px] bg-gray-200 text-gray-700 text-xs font-semibold size-10">
          +{extra}
        </span>
      )}
    </span>
  );
}
