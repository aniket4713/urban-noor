import { ProductCardSkeleton } from "@/components/store/ProductCard";

export default function Loading() {
  return (
    <div className="container-x py-12">
      <div className="mx-auto mb-12 flex flex-col items-center gap-3">
        <div className="skeleton h-3 w-24" />
        <div className="skeleton h-12 w-80" />
      </div>
      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
