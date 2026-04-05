import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api";
import { getDailyLogWithItems, getDayOfWeek } from "@/lib/daily-log";
import { prisma } from "@/lib/prisma";
import { dailyNoteSchema } from "@/lib/validators/daily";

function parseDate(dateParam: string) {
  const date = new Date(`${dateParam}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) throw new Error("Invalid date");
  return date;
}

export async function GET(_: Request, context: { params: Promise<{ date: string }> }) {
  const auth = await requireUser();
  if (!auth.user) return auth.response;

  try {
    const { date } = await context.params;
    const log = await getDailyLogWithItems(auth.user.id, parseDate(date));
    return NextResponse.json(log);
  } catch {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }
}

export async function PATCH(req: Request, context: { params: Promise<{ date: string }> }) {
  const auth = await requireUser();
  if (!auth.user) return auth.response;

  try {
    const { date } = await context.params;
    const parsedDate = parseDate(date);
    const body = await req.json();
    const parsed = dailyNoteSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid note" }, { status: 400 });

    const updated = await prisma.dailyLog.upsert({
      where: { userId_date: { userId: auth.user.id, date: parsedDate } },
      create: {
        userId: auth.user.id,
        date: parsedDate,
        dayOfWeek: getDayOfWeek(parsedDate),
        note: parsed.data.note || null,
      },
      update: {
        note: parsed.data.note || null,
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }
}
