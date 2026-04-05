import { notFound } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { getDailyLogWithItems } from "@/lib/daily-log";
import { TodayChecklist } from "@/components/dashboard/today-checklist";
import type { ChecklistItem } from "@/components/dashboard/today-checklist";

export default async function DailyDetailPage({ params }: { params: Promise<{ date: string }> }) {
  const user = await getSessionUser();
  if (!user) return null;

  const { date } = await params;
  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) notFound();

  const log = await getDailyLogWithItems(user.id, parsed);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="section-title text-3xl">Daily Detail {date}</h1>
        <Link href="/calendar" className="text-sm font-semibold text-sky-600">
          Back to calendar
        </Link>
      </div>
      <TodayChecklist dateKey={date} items={log.items as unknown as ChecklistItem[]} />
    </section>
  );
}
