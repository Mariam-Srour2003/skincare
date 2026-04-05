import { endOfMonth, format, startOfMonth } from "date-fns";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MonthView } from "@/components/calendar/month-view";

export default async function CalendarPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);

  const logs = await prisma.dailyLog.findMany({
    where: { userId: user.id, date: { gte: start, lte: end } },
    include: { items: true },
  });

  const statuses = logs.map((log) => ({
    date: format(log.date, "yyyy-MM-dd"),
    completed: log.items.filter((item) => item.completed).length,
    total: log.items.length,
  }));

  return (
    <section className="space-y-4">
      <h1 className="section-title text-3xl">Calendar & History</h1>
      <MonthView currentMonth={now} statuses={statuses} />
    </section>
  );
}
