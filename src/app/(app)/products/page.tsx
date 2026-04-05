import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { ProductGrid } from "@/components/products/product-grid";

export default async function ProductsPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const products = await prisma.product.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="space-y-4">
      <h1 className="section-title text-3xl">Products</h1>
      <ProductGrid initialProducts={products} />
    </section>
  );
}
