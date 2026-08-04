import { Skeleton } from "@/components/ui/skeleton";

export function ProductDetailSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-6 py-16 md:px-20 md:py-24">
      <Skeleton className="h-3 w-32" />

      <div className="grid grid-cols-1 gap-12 pt-8 md:grid-cols-2">
        <Skeleton className="aspect-square w-full" />

        <div className="flex flex-col gap-6">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-24" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="mt-4 h-11 w-48" />
        </div>
      </div>
    </div>
  );
}
