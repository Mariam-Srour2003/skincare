"use client";

import Link from "next/link";
import { eachDayOfInterval, endOfMonth, format, isSameMonth, startOfMonth, startOfWeek } from "date-fns";
import { Card } from "@/components/ui/card";

type DayStatus = {
  date: string;
  completed: number;
  total: number;
};

export function MonthView({ currentMonth, statuses }: { currentMonth: Date; statuses: DayStatus[] }) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: monthEnd });

  const map = new Map(statuses.map((status) => [status.date, status]));

  return (
    <Card className="p-6">
      <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-slate-600 mb-4">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((date) => {
          const key = format(date, "yyyy-MM-dd");
          const status = map.get(key);
          const percent = status && status.total ? Math.round((status.completed / status.total) * 100) : 0;
          const inMonth = isSameMonth(date, monthStart);

          return (
            <Link
              key={key}
              href={`/daily/${key}`}
              className={`rounded-lg border p-2 text-xs transition text-center ${
                inMonth
                  ? "border-slate-200 bg-slate-50 hover:border-sky-400"
                  : "border-slate-100 bg-slate-50 text-slate-400"
              }`}
            >
              <p className="font-semibold">{format(date, "d")}</p>
              <p className="mt-1 text-[11px] text-slate-600">{status ? `${percent}%` : "-"}</p>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
