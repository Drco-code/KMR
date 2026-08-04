"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "border-b-2 pb-1 text-sm font-semibold tracking-[0.05em] uppercase transition-colors",
        isActive
          ? "border-gold text-gold"
          : "border-transparent text-ink hover:text-gold"
      )}
    >
      {children}
    </Link>
  );
}
