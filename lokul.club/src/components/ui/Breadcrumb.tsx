import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center text-sm", className)}>
      <ol className="flex items-center gap-1.5 flex-wrap">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <Link href={item.href} className="text-gray-500 hover:text-gray-900 transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "text-gray-900 font-medium" : "text-gray-500"}>
                  {item.label}
                </span>
              )}
              {!isLast ? <ChevronRight className="size-3.5 text-gray-400" /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
