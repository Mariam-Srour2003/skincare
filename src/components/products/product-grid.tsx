"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { toast } from "sonner";

type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  timeOfUse: string;
  notes: string | null;
  imageUrl: string | null;
  isActive: boolean;
};

export function ProductGrid({ initialProducts }: { initialProducts: Product[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ALL");
  const [active, setActive] = useState("ALL");
  const router = useRouter();

  const products = useMemo(
    () =>
      initialProducts.filter((product) => {
        const matchesQ =
          query.length === 0 ||
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.brand.toLowerCase().includes(query.toLowerCase()) ||
          (product.notes ?? "").toLowerCase().includes(query.toLowerCase());
        const matchesCategory = category === "ALL" || product.category === category;
        const matchesActive = active === "ALL" || String(product.isActive) === active;
        return matchesQ && matchesCategory && matchesActive;
      }),
    [initialProducts, query, category, active],
  );

  const remove = async (id: string) => {
    if (!window.confirm("Delete this product?")) return;

    const res = await fetch(`/api/products/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error || "Could not delete product");
      return;
    }

    toast.success("Product deleted");
    router.refresh();
  };

  return (
    <div className="space-y-5">
      <Card className="grid gap-3 p-6 md:grid-cols-4">
        <Input placeholder="Search products..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <Select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="ALL">All categories</option>
          {PRODUCT_CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
        <Select value={active} onChange={(e) => setActive(e.target.value)}>
          <option value="ALL">All status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </Select>
        <Button onClick={() => router.push("/products/new")}>Add Product</Button>
      </Card>

      {products.length === 0 ? (
        <Card className="p-6">
          <p className="text-sm text-zinc-500">No products found. Add your first item to build routines.</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id} className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                {product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.imageUrl} alt={product.name} className="h-16 w-16 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-200 text-xs text-slate-600">
                    No image
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{product.name}</p>
                  <p className="text-xs text-slate-600">{product.brand}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-pink-100 px-3 py-1 text-pink-700">{product.category}</span>
                <span className="rounded-full bg-sky-100 px-3 py-1 text-sky-700">{product.timeOfUse}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{product.isActive ? "Active" : "Inactive"}</span>
              </div>

              {product.notes ? <p className="text-sm text-slate-700">{product.notes}</p> : null}

              <div className="flex gap-2">
                <Link href={`/products/${encodeURIComponent(product.id)}/edit`} className="inline-flex flex-1">
                  <Button size="sm" variant="secondary" className="w-full justify-center">
                    Edit
                  </Button>
                </Link>
                <Button size="sm" variant="danger" onClick={() => remove(product.id)}>
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
