import { Skeleton } from "@/components/ui/skeleton";

// Mirrors CatalogView's layout (heading/sort row, sidebar filter, product
// grid) so the page's shape appears instantly instead of a blank screen, 
// shown automatically by Next.js while the catalog's data fetch is in flight.
export function CatalogSkeleton() {
  return (
    <div className="flex flex-col gap-10 px-6 py-16 md:px-20 md:py-24">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-10 w-72 max-w-full" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="h-9 w-40" />
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-[220px_1fr]">
        <aside className="flex flex-col gap-4 border-b border-border pb-6 md:border-b-0">
          <Skeleton className="h-3 w-20" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-6" />
            </div>
          ))}
        </aside>

        <div className="grid w-full grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-4">
              <Skeleton className="aspect-[4/5] w-full" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
