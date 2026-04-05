import { NextResponse } from "next/server";
import { startOfWeek, endOfWeek } from "date-fns";
import { requireUser } from "@/lib/api";
import { getDailyLogWithItems } from "@/lib/daily-log";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireUser();
  if (!auth.user) return auth.response;

  const today = new Date();
  const todayLog = await getDailyLogWithItems(auth.user.id, today);

  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  const weekLogs = await prisma.dailyLog.findMany({
    where: {
      userId: auth.user.id,
      date: { gte: weekStart, lte: weekEnd },
    },
    include: { items: true },
  });

  const weekTotal = weekLogs.reduce((acc, log) => acc + log.items.length, 0);
  const weekDone = weekLogs.reduce((acc, log) => acc + log.items.filter((item) => item.completed).length, 0);

  const allLogs = await prisma.dailyLog.findMany({
    where: { userId: auth.user.id },
    include: { items: true },
    orderBy: { date: "desc" },
    take: 60,
  });

  let streak = 0;
  for (const log of allLogs) {
    if (log.items.length === 0) continue;
    const completed = log.items.filter((item) => item.completed).length;
    if (completed === log.items.length) {
      streak += 1;
    } else {
      break;
    }
  }

  const todayDone = todayLog.items.filter((item) => item.completed).length;
  const todayTotal = todayLog.items.length;

  return NextResponse.json({
    today: {
      date: todayLog.date,
      total: todayTotal,
      completed: todayDone,
      percent: todayTotal ? Math.round((todayDone / todayTotal) * 100) : 0,
      morning: todayLog.items.filter((item) => item.routinePeriod === "MORNING"),
      night: todayLog.items.filter((item) => item.routinePeriod === "NIGHT"),
    },
    weekly: {
      total: weekTotal,
      completed: weekDone,
      percent: weekTotal ? Math.round((weekDone / weekTotal) * 100) : 0,
    },
    streak,
  });
}
