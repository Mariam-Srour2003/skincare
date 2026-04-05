"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

type Item = {
  id: string;
  productId: string;
  completed: boolean;
  routinePeriod: "MORNING" | "NIGHT";
  plannedOrder: number;
  plannedNote: string | null;
  product: { name: string; brand: string };
};

export type ChecklistItem = Item;

export function TodayChecklist({ dateKey, items }: { dateKey: string; items: Item[] }) {
  const [localItems, setLocalItems] = useState(items);
  const router = useRouter();

  const grouped = useMemo(
    () => ({
      morning: localItems.filter((item) => item.routinePeriod === "MORNING"),
      night: localItems.filter((item) => item.routinePeriod === "NIGHT"),
    }),
    [localItems],
  );

  const totals = useMemo(() => {
    const done = localItems.filter((item) => item.completed).length;
    const total = localItems.length;
    return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
  }, [localItems]);

  const toggle = async (item: Item) => {
    const nextCompleted = !item.completed;
    setLocalItems((prev) => prev.map((entry) => (entry.id === item.id ? { ...entry, completed: nextCompleted } : entry)));

    const res = await fetch(`/api/daily/${dateKey}/toggle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: item.productId,
        routinePeriod: item.routinePeriod,
        completed: nextCompleted,
      }),
    });

    if (!res.ok) {
      toast.error("Could not update progress");
      setLocalItems((prev) => prev.map((entry) => (entry.id === item.id ? { ...entry, completed: item.completed } : entry)));
      return;
    }

    router.refresh();
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="section-title text-2xl">Today&apos;s Progress</h2>
          <p className="text-sm font-semibold text-sky-600">{totals.done}/{totals.total} done</p>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-sky-600 transition-all shadow-md" style={{ width: `${totals.percent}%` }} />
        </div>
        <p className="mt-3 text-xs text-slate-600">{totals.percent}% completed this week</p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {[{ label: "Morning", key: "morning" as const }, { label: "Night", key: "night" as const }].map((section) => (
          <Card key={section.key} className="p-6">
            <h3 className="section-title text-lg font-semibold">{section.label} Checklist</h3>
            {grouped[section.key].length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">No routine assigned.</p>
            ) : (
              <div className="mt-4 space-y-2">
                {grouped[section.key]
                  .sort((a, b) => a.plannedOrder - b.plannedOrder)
                  .map((item) => (
                    <label key={item.id} className={`flex items-start gap-3 rounded-lg border p-3 transition-colors cursor-pointer ${
                      item.completed
                        ? "border-sky-200 bg-sky-50"
                        : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                    }`}>
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => toggle(item)}
                        className="mt-1 h-5 w-5 rounded accent-sky-600"
                      />
                      <span className="flex-1 text-sm">
                        <span className={`block font-semibold ${item.completed ? "text-slate-500 line-through" : "text-slate-900"}`}>
                          {item.product.name}
                        </span>
                        <span className="block text-xs text-slate-600">{item.product.brand}</span>
                        {item.plannedNote ? <span className="block text-xs text-slate-600 mt-1">{item.plannedNote}</span> : null}
                      </span>
                    </label>
                  ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
