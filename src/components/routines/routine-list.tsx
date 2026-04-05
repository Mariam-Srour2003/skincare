"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

type Routine = {
  id: string;
  name: string;
  period: string;
  isDefault: boolean;
  days: Array<{ dayOfWeek: string }>;
  items: Array<{
    id: string;
    displayOrder: number;
    instructions: string | null;
    product: { id: string; name: string; brand: string };
  }>;
};

export function RoutineList({ routines }: { routines: Routine[] }) {
  const router = useRouter();

  const removeRoutine = async (id: string) => {
    if (!window.confirm("Delete this routine?")) return;
    const res = await fetch(`/api/routines/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error || "Could not delete routine");
      return;
    }

    toast.success("Routine deleted");
    router.refresh();
  };

  if (routines.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-sm text-zinc-500">No routines created yet. Start with a default morning or night routine.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {routines.map((routine) => (
        <Card key={routine.id} className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">{routine.name}</h3>
              <p className="text-xs text-slate-600">
                {routine.isDefault ? "Default fallback" : routine.days.map((entry) => entry.dayOfWeek).join(", ")} • {routine.period}
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={`/routines/${routine.id}/edit`}>
                <Button size="sm" variant="secondary">
                  Edit
                </Button>
              </Link>
              <Button size="sm" variant="danger" onClick={() => removeRoutine(routine.id)}>
                Delete
              </Button>
            </div>
          </div>

          <ol className="space-y-2 text-sm">
            {routine.items.map((item) => (
              <li key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                <p className="font-medium text-slate-900">
                  {item.displayOrder}. {item.product.name} <span className="text-slate-600">({item.product.brand})</span>
                </p>
                {item.instructions ? <p className="text-xs text-slate-600 mt-1">{item.instructions}</p> : null}
              </li>
            ))}
          </ol>
        </Card>
      ))}
    </div>
  );
}
