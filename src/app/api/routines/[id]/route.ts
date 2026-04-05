import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api";
import { routineSchema } from "@/lib/validators/routine";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if (!auth.user) return auth.response;

  const { id } = await context.params;
  const routine = await prisma.routine.findFirst({
    where: { id, userId: auth.user.id, archivedAt: null },
    include: {
      days: true,
      items: {
        include: { product: true },
        orderBy: { displayOrder: "asc" },
      },
    },
  });

  if (!routine) return NextResponse.json({ error: "Routine not found" }, { status: 404 });
  return NextResponse.json(routine);
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if (!auth.user) return auth.response;

  const { id } = await context.params;
  const existing = await prisma.routine.findFirst({
    where: { id, userId: auth.user.id, archivedAt: null },
    include: { items: true, days: true },
  });
  if (!existing) return NextResponse.json({ error: "Routine not found" }, { status: 404 });

  const body = await req.json();
  const parsed = routineSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid routine" }, { status: 400 });
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.routine.update({
      where: { id: existing.id },
      data: { archivedAt: new Date() },
    });

    const nextRoutine = await tx.routine.create({
      data: {
        userId: existing.userId,
        createdById: auth.user.id,
        name: parsed.data.name,
        period: parsed.data.period,
        isDefault: parsed.data.isDefault ?? false,
      },
    });

    if (!parsed.data.isDefault) {
      await tx.routineDay.createMany({
        data: parsed.data.daysOfWeek.map((dayOfWeek) => ({
          routineId: nextRoutine.id,
          dayOfWeek,
        })),
      });
    }

    await tx.routineItem.createMany({
      data: parsed.data.items.map((item, index) => ({
        routineId: nextRoutine.id,
        productId: item.productId,
        displayOrder: index + 1,
        instructions: item.instructions || null,
      })),
    });

    const today = new Date();
    const resetFromDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    await tx.dailyLog.deleteMany({
      where: {
        userId: auth.user.id,
        date: { gte: resetFromDate },
      },
    });

    return tx.routine.findUniqueOrThrow({
      where: { id: nextRoutine.id },
      include: {
        days: true,
        items: {
          include: { product: true },
          orderBy: { displayOrder: "asc" },
        },
      },
    });
  });

  return NextResponse.json({
    ...updated,
    updatedFromRoutineId: existing.id,
  });
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if (!auth.user) return auth.response;

  const { id } = await context.params;
  const existing = await prisma.routine.findFirst({ where: { id, userId: auth.user.id, archivedAt: null } });
  if (!existing) return NextResponse.json({ error: "Routine not found" }, { status: 404 });

  await prisma.routine.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
