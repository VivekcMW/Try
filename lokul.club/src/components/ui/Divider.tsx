import { cn } from "@/lib/cn";

export function Divider({
  className,
  orientation = "horizontal",
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { orientation?: "horizontal" | "vertical" }) {
  return (
    <div
      role="separator"
      className={cn(
        "bg-border",
        orientation === "horizontal" ? "h-px w-full" : "w-px h-full",
        className
      )}
      {...rest}
    />
  );
}
