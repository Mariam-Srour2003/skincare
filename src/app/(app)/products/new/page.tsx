import { ProductForm } from "@/components/products/product-form";

export default function NewProductPage() {
  return (
    <section className="space-y-4">
      <h1 className="section-title text-3xl">Add Product</h1>
      <ProductForm />
    </section>
  );
}
