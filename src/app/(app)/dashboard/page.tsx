import { endOfWeek, startOfWeek } from "date-fns";
import { getSessionUser } from "@/lib/auth";
import { getDailyLogWithItems } from "@/lib/daily-log";
import { prisma } from "@/lib/prisma";
import { TodayChecklist } from "@/components/dashboard/today-checklist";
import type { ChecklistItem } from "@/components/dashboard/today-checklist";
import { Card } from "@/components/ui/card";

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const today = new Date();
  const log = await getDailyLogWithItems(user.id, today);

  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const weekLogs = await prisma.dailyLog.findMany({
    where: { userId: user.id, date: { gte: weekStart, lte: weekEnd } },
    include: { items: true },
  });

  const weekTotal = weekLogs.reduce((acc, curr) => acc + curr.items.length, 0);
  const weekCompleted = weekLogs.reduce((acc, curr) => acc + curr.items.filter((i) => i.completed).length, 0);
  const weekPercent = weekTotal ? Math.round((weekCompleted / weekTotal) * 100) : 0;

  const recent = await prisma.dailyLog.findMany({
    where: { userId: user.id },
    include: { items: true },
    orderBy: { date: "desc" },
    take: 30,
  });

  let streak = 0;
  for (const item of recent) {
    if (!item.items.length) continue;
    const done = item.items.filter((entry) => entry.completed).length;
    if (done === item.items.length) streak += 1;
    else break;
  }

  return (
    <section className="space-y-4">
      <h1 className="section-title text-3xl">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Weekly completion</p>
          <p className="section-title mt-3 text-4xl text-sky-600">{weekPercent}%</p>
        </Card>
        <Card className="p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Weekly done items</p>
          <p className="section-title mt-3 text-4xl text-rose-600">{weekCompleted}</p>
        </Card>
        <Card className="p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Perfect-day streak</p>
          <p className="section-title mt-3 text-4xl text-violet-600">{streak} days</p>
        </Card>
      </div>

      <TodayChecklist dateKey={dateKey(log.date)} items={log.items as unknown as ChecklistItem[]} />
    </section>
  );
}
