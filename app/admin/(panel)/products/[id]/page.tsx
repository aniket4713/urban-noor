"use client";

import { ProductForm, type ProductFormValue } from "@/components/admin/ProductForm";
import { useAdminData } from "@/components/admin/ui";

type ApiProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  gender: ProductFormValue["gender"];
  categoryId: string;
  price: number;
  mrp: number;
  stock: number;
  sku: string | null;
  material: string | null;
  tags: string[];
  images: { url: string }[];
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isActive: boolean;
};

export default function EditProductPage({ params }: { params: { id: string } }) {
  const { data, error } = useAdminData<{ product: ApiProduct }>(`/api/admin/products/${params.id}`);
  if (error) return <p className="text-red-600">{error}</p>;
  if (!data) return <div className="skeleton h-96" />;
  const p = data.product;
  return (
    <ProductForm
      productId={p.id}
      initial={{
        name: p.name,
        slug: p.slug,
        description: p.description,
        gender: p.gender,
        categoryId: p.categoryId,
        price: String(p.price),
        mrp: String(p.mrp),
        stock: String(p.stock),
        sku: p.sku ?? "",
        material: p.material ?? "",
        tags: p.tags,
        images: p.images.map((i) => i.url),
        isFeatured: p.isFeatured,
        isNewArrival: p.isNewArrival,
        isBestSeller: p.isBestSeller,
        isActive: p.isActive,
      }}
    />
  );
}
