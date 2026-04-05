import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api";
import { ensureDailyLog } from "@/lib/daily-log";
import { prisma } from "@/lib/prisma";
import { toggleDailyItemSchema } from "@/lib/validators/daily";

function parseDate(dateParam: string) {
  const date = new Date(`${dateParam}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) throw new Error("Invalid date");
  return date;
}

export async function POST(req: Request, context: { params: Promise<{ date: string }> }) {
  const auth = await requireUser();
  if (!auth.user) return auth.response;

  try {
    const { date } = await context.params;
    const parsedDate = parseDate(date);
    const body = await req.json();
    const parsed = toggleDailyItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
    }

    const log = await ensureDailyLog(auth.user.id, parsedDate);

    const updated = await prisma.dailyLogItem.updateMany({
      where: {
        dailyLogId: log.id,
        productId: parsed.data.productId,
        routinePeriod: parsed.data.routinePeriod,
      },
      data: {
        completed: parsed.data.completed,
        completedAt: parsed.data.completed ? new Date() : null,
      },
    });

    return NextResponse.json({ ok: true, count: updated.count });
  } catch {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }
}
