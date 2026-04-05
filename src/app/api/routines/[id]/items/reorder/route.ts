import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api";
import { reorderRoutineItemsSchema } from "@/lib/validators/routine";

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireUser();
  if (!auth.user) return auth.response;

  const { id } = await context.params;
  const routine = await prisma.routine.findFirst({ where: { id, userId: auth.user.id, archivedAt: null } });
  if (!routine) return NextResponse.json({ error: "Routine not found" }, { status: 404 });

  const body = await req.json();
  const parsed = reorderRoutineItemsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
  }

  await prisma.$transaction(
    parsed.data.itemIds.map((itemId, index) =>
      prisma.routineItem.update({
        where: { id: itemId },
        data: { displayOrder: index + 1 },
      }),
    ),
  );

  return NextResponse.json({ ok: true });
}
