import { NextResponse } from "next/server";
import { ProductCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api";
import { productSchema } from "@/lib/validators/product";
import { PRODUCT_CATEGORIES } from "@/lib/constants";

export async function GET(req: Request) {
  const auth = await requireUser();
  if (!auth.user) return auth.response;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";
  const categoryParam = searchParams.get("category");
  const category =
    categoryParam && PRODUCT_CATEGORIES.includes(categoryParam as (typeof PRODUCT_CATEGORIES)[number])
      ? (categoryParam as ProductCategory)
      : undefined;
  const active = searchParams.get("active");

  const products = await prisma.product.findMany({
    where: {
      userId: auth.user.id,
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { brand: { contains: q } },
              { notes: { contains: q } },
            ],
          }
        : {}),
      ...(category ? { category } : {}),
      ...(active === "true" ? { isActive: true } : {}),
      ...(active === "false" ? { isActive: false } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const auth = await requireUser();
  if (!auth.user) return auth.response;

  const body = await req.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid product" }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: {
      ...parsed.data,
      userId: auth.user.id,
      notes: parsed.data.notes || null,
      imageUrl: parsed.data.imageUrl || null,
      isActive: parsed.data.isActive ?? true,
    },
  });

  return NextResponse.json(product, { status: 201 });
}
