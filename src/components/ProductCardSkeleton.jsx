import { Skeleton } from "@/components/ui/skeleton";

function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
      <Skeleton className="aspect-square w-full" />
      <div className="p-4 flex flex-col gap-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-24" />
        <div className="flex justify-between mt-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-8 w-12 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default ProductCardSkeleton;
