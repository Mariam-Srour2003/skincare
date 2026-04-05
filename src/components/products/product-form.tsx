"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { productSchema } from "@/lib/validators/product";
import { PRODUCT_CATEGORIES, TIME_OF_USE_OPTIONS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

type ProductValues = z.infer<typeof productSchema>;

export function ProductForm({
  initial,
  productId,
}: {
  initial?: Partial<ProductValues>;
  productId?: string;
}) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);

  const form = useForm<ProductValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initial?.name ?? "",
      brand: initial?.brand ?? "",
      category: initial?.category ?? "CLEANSER",
      timeOfUse: initial?.timeOfUse ?? "BOTH",
      notes: initial?.notes ?? "",
      imageUrl: initial?.imageUrl ?? "",
      isActive: initial?.isActive ?? true,
    },
  });

  const imageUrl = form.watch("imageUrl");

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");
      form.setValue("imageUrl", data.url, { shouldDirty: true, shouldValidate: true });
      toast.success("Image uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = form.handleSubmit(async (values) => {
    const method = productId ? "PATCH" : "POST";
    const endpoint = productId ? `/api/products/${productId}` : "/api/products";

    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || "Could not save product");
      return;
    }

    toast.success(productId ? "Product updated" : "Product created");
    router.push("/products");
    router.refresh();
  });

  return (
    <Card className="p-6">
      <form className="space-y-6" onSubmit={onSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-900">Product name</span>
            <Input {...form.register("name")} />
            <p className="text-xs text-rose-500">{form.formState.errors.name?.message}</p>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-900">Brand</span>
            <Input {...form.register("brand")} />
            <p className="text-xs text-rose-500">{form.formState.errors.brand?.message}</p>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-900">Category</span>
            <Select {...form.register("category")}>
              {PRODUCT_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category.toLowerCase()}
                </option>
              ))}
            </Select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-900">Time of use</span>
            <Select {...form.register("timeOfUse")}>
              {TIME_OF_USE_OPTIONS.map((time) => (
                <option key={time} value={time}>
                  {time.toLowerCase()}
                </option>
              ))}
            </Select>
          </label>
        </div>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-900">Notes</span>
          <Textarea rows={4} {...form.register("notes")} />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-900">Upload image</span>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadImage(file);
            }}
          />
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="Preview" className="h-24 w-24 rounded-lg object-cover mt-2" />
          ) : null}
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...form.register("isActive")} className="h-4 w-4 rounded accent-pink-500" />
          <span className="text-slate-900">Product is active</span>
        </label>

        <div className="flex gap-3">
          <Button type="submit" disabled={form.formState.isSubmitting || uploading}>
            {form.formState.isSubmitting ? "Saving..." : productId ? "Update product" : "Create product"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.push("/products")}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
