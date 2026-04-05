import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api";
import { productSchema } from "@/lib/validators/product";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if (!auth.user) return auth.response;

  const { id } = await context.params;
  const decodedId = decodeURIComponent(id);
  const product = await prisma.product.findFirst({ where: { id: decodedId, userId: auth.user.id } });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  return NextResponse.json(product);
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if (!auth.user) return auth.response;

  const { id } = await context.params;
  const decodedId = decodeURIComponent(id);
  const exists = await prisma.product.findFirst({ where: { id: decodedId, userId: auth.user.id } });
  if (!exists) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const body = await req.json();
  const parsed = productSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid product" }, { status: 400 });
  }

  const updated = await prisma.product.update({
    where: { id: decodedId },
    data: parsed.data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if (!auth.user) return auth.response;

  const { id } = await context.params;
  const decodedId = decodeURIComponent(id);
  const exists = await prisma.product.findFirst({ where: { id: decodedId, userId: auth.user.id } });
  if (!exists) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  await prisma.product.delete({ where: { id: decodedId } });
  return NextResponse.json({ ok: true });
}
