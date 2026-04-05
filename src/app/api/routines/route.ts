import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api";
import { routineSchema } from "@/lib/validators/routine";

export async function GET() {
  const auth = await requireUser();
  if (!auth.user) return auth.response;

  const routines = await prisma.routine.findMany({
    where: { userId: auth.user.id, archivedAt: null },
    include: {
      days: true,
      items: {
        include: { product: true },
        orderBy: { displayOrder: "asc" },
      },
    },
    orderBy: [{ period: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(routines);
}

export async function POST(req: Request) {
  const auth = await requireUser();
  if (!auth.user) return auth.response;

  const body = await req.json();
  const parsed = routineSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid routine" }, { status: 400 });
  }

  const routine = await prisma.routine.create({
    data: {
      userId: auth.user.id,
      createdById: auth.user.id,
      name: parsed.data.name,
      period: parsed.data.period,
      isDefault: parsed.data.isDefault ?? false,
      days: {
        create: parsed.data.daysOfWeek.map((dayOfWeek) => ({ dayOfWeek })),
      },
      items: {
        create: parsed.data.items.map((item, index) => ({
          productId: item.productId,
          displayOrder: index + 1,
          instructions: item.instructions || null,
        })),
      },
    },
    include: {
      days: true,
      items: {
        include: { product: true },
        orderBy: { displayOrder: "asc" },
      },
    },
  });

  return NextResponse.json(routine, { status: 201 });
}
