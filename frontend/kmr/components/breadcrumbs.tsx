import Link from "next/link";

// Visible breadcrumb trail. Every caller also emits a matching
// BreadcrumbList JSON-LD block (see lib/schema.ts), so the two never disagree.
export function Breadcrumbs({
  items,
  className,
}: {
  items: Array<{ name: string; path: string }>;
  className?: string;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`text-xs font-medium tracking-[0.15em] text-gold uppercase ${className ?? ""}`}
    >
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.path}-${index}`} className="flex items-center gap-2">
              {isLast ? (
                <span aria-current="page" className="text-ink-muted">
                  {item.name}
                </span>
              ) : (
                <Link href={item.path} className="transition-colors hover:text-ink">
                  {item.name}
                </Link>
              )}
              {!isLast && (
                <span aria-hidden className="text-gold/50">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
