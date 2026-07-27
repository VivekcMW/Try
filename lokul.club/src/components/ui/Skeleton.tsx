import { cn } from "@/lib/cn";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...rest }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-[6px] bg-gray-200/70", className)}
      aria-hidden="true"
      {...rest}
    />
  );
}
