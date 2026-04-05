import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/products/product-form";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return null;

  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const product = await prisma.product.findFirst({ where: { id: decodedId, userId: user.id } });

  if (!product) notFound();

  return (
    <section className="space-y-4">
      <h1 className="section-title text-3xl">Edit Product</h1>
      <ProductForm productId={product.id} initial={product} />
    </section>
  );
}
