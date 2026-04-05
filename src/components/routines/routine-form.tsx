"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { routineSchema } from "@/lib/validators/routine";
import { DAYS_OF_WEEK, ROUTINE_PERIODS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type Product = { id: string; name: string; brand: string; isActive: boolean };
type RoutineFormValues = z.input<typeof routineSchema>;
type RoutineValues = z.output<typeof routineSchema>;
type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

function SortableItem({
  id,
  index,
  products,
  value,
  onChange,
  onRemove,
}: {
  id: string;
  index: number;
  products: Product[];
  value: { productId: string; instructions: string | null };
  onChange: (index: number, field: "productId" | "instructions", value: string) => void;
  onRemove: (index: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          suppressHydrationWarning
          {...attributes}
          {...listeners}
          className="cursor-grab rounded-lg bg-slate-100 px-2 py-1 text-xs"
        >
          Drag
        </button>
        <p className="text-sm font-semibold">Step {index + 1}</p>
        <Button type="button" size="sm" variant="danger" onClick={() => onRemove(index)}>
          Remove
        </Button>
      </div>

      <div className="mt-3 space-y-3">
        <Select value={value.productId} onChange={(e) => onChange(index, "productId", e.target.value)}>
          <option value="">Select product</option>
          {products
            .filter((product) => product.isActive)
            .map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} - {product.brand}
              </option>
            ))}
        </Select>

        <Textarea
          rows={2}
          value={value.instructions ?? ""}
          onChange={(e) => onChange(index, "instructions", e.target.value)}
          placeholder="Optional instruction (e.g. wait 30 seconds)"
        />
      </div>
    </div>
  );
}

export function RoutineForm({
  products,
  initial,
  routineId,
}: {
  products: Product[];
  initial?: Partial<RoutineValues>;
  routineId?: string;
}) {
  const router = useRouter();
  const [items, setItems] = useState(
    initial?.items?.length
      ? initial.items.map((item, index) => ({ ...item, id: item.id ?? crypto.randomUUID(), displayOrder: index + 1 }))
      : [{ id: crypto.randomUUID(), productId: "", displayOrder: 1, instructions: "" }],
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const form = useForm<RoutineFormValues>({
    resolver: zodResolver(routineSchema),
    defaultValues: {
      name: initial?.name ?? "",
      daysOfWeek: initial?.daysOfWeek ?? [],
      period: initial?.period ?? "MORNING",
      isDefault: initial?.isDefault ?? false,
      items: [],
    },
  });

  const selectedDays = (form.watch("daysOfWeek") ?? []) as DayOfWeek[];
  const routineName = form.watch("name") ?? "";
  const isDefault = form.watch("isDefault") ?? false;

  const toggleDay = (day: DayOfWeek) => {
    const nextDays = selectedDays.includes(day)
      ? selectedDays.filter((value) => value !== day)
      : [...selectedDays, day];

    form.setValue("daysOfWeek", nextDays, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const itemIds = useMemo(() => items.map((item) => item.id || `${item.displayOrder}`), [items]);

  useEffect(() => {
    form.setValue(
      "items",
      items.map((item, index) => ({
        id: item.id,
        productId: item.productId,
        displayOrder: index + 1,
        instructions: item.instructions || null,
      })),
      { shouldValidate: false, shouldDirty: true },
    );
  }, [items, form]);

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = itemIds.indexOf(String(active.id));
    const newIndex = itemIds.indexOf(String(over.id));

    setItems((prev) =>
      arrayMove(prev, oldIndex, newIndex).map((item, index) => ({ ...item, displayOrder: index + 1 })),
    );
  };

  const onSubmit = form.handleSubmit(async (values) => {
    const missingStepNumbers = items
      .map((item, index) => (!item.productId ? index + 1 : null))
      .filter((value): value is number => value !== null);

    const missingMessages: string[] = [];
    if ((values.name ?? "").trim().length < 2) {
      missingMessages.push("name");
    }
    if (!values.isDefault && (values.daysOfWeek ?? []).length === 0) {
      missingMessages.push("at least one day of week");
    }
    if (missingStepNumbers.length > 0) {
      missingMessages.push(`product on step ${missingStepNumbers.join(", ")}`);
    }

    if (missingMessages.length > 0) {
      toast.error(`Missing: ${missingMessages.join("; ")}`);
      return;
    }

    const parsedPayload = routineSchema.safeParse({
      ...values,
      daysOfWeek: values.isDefault ? [] : values.daysOfWeek ?? [],
      items: items.map((item, index) => ({
        id: item.id,
        productId: item.productId,
        displayOrder: index + 1,
        instructions: item.instructions || null,
      })),
    });

    if (!parsedPayload.success) {
      const issueMessages = parsedPayload.error.issues.map((issue) => issue.message).filter(Boolean);
      toast.error(issueMessages.length > 0 ? issueMessages.join("; ") : "Please complete all required fields");
      return;
    }

    const payload: RoutineValues = parsedPayload.data;

    const endpoint = routineId ? `/api/routines/${routineId}` : "/api/routines";
    const method = routineId ? "PATCH" : "POST";

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data: { id?: string; error?: string } = {};
      try {
        data = (await res.json()) as { error?: string };
      } catch {
        data = {};
      }

      if (!res.ok) {
        toast.error(data.error || "Could not save routine");
        return;
      }

      toast.success(routineId ? "Routine updated" : "Routine created");
      if (routineId && data.id) {
        router.push(`/routines/${data.id}/edit`);
      } else {
        router.push("/routines");
      }
      router.refresh();
    } catch {
      toast.error("Could not save routine");
    }
  }, () => {
    const invalidMessages = [
      form.formState.errors.name?.message,
      form.formState.errors.daysOfWeek?.message,
      form.formState.errors.items?.message,
    ].filter((message): message is string => Boolean(message));

    toast.error(invalidMessages.length > 0 ? invalidMessages.join("; ") : "Please complete all required fields");
  });

  const hasMissingProducts = items.some((item) => !item.productId);
  const missingProductSteps = items
    .map((item, index) => (!item.productId ? index + 1 : null))
    .filter((value): value is number => value !== null);
  const showMissingDays = !isDefault && selectedDays.length === 0;
  const showMissingName = routineName.trim().length > 0 && routineName.trim().length < 2;

  return (
    <Card className="p-6">
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-900">Routine name</span>
            <Input {...form.register("name")} />
            <p className="text-xs text-rose-500">{form.formState.errors.name?.message}</p>
            {showMissingName ? <p className="text-xs text-rose-500">Name must be at least 2 characters.</p> : null}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-900">Period</span>
            <Select {...form.register("period")}>
              {ROUTINE_PERIODS.map((period) => (
                <option key={period} value={period}>
                  {period}
                </option>
              ))}
            </Select>
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...form.register("isDefault")} className="h-4 w-4 accent-pink-500" />
          <span className="text-slate-900">Use as default fallback routine</span>
        </label>

        {!form.watch("isDefault") ? (
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-900">Day(s) of week</span>
            <div className="grid gap-2 sm:grid-cols-2">
              {DAYS_OF_WEEK.map((day) => {
                const active = selectedDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                      active
                        ? "border-sky-500 bg-sky-50 text-slate-900"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`h-4 w-4 rounded border ${active ? "border-sky-500 bg-sky-500" : "border-slate-300"}`} />
                      {day}
                    </span>
                  </button>
                );
              })}
            </div>
            {showMissingDays ? <p className="text-xs text-rose-500">Select at least one day, or mark as default.</p> : null}
          </label>
        ) : null}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-slate-900">Routine steps</p>
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                setItems((prev) => [
                  ...prev,
                  { id: crypto.randomUUID(), productId: "", displayOrder: prev.length + 1, instructions: "" },
                ])
              }
            >
              Add step
            </Button>
          </div>

          {hasMissingProducts ? (
            <p className="text-xs text-rose-500">
              Select a product for every step before saving. Missing at step: {missingProductSteps.join(", ")}.
            </p>
          ) : null}

          <DndContext id="routine-builder-dnd" sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {items.map((item, index) => (
                  <SortableItem
                    key={item.id}
                    id={item.id || `${index}`}
                    index={index}
                    products={products}
                    value={{ productId: item.productId, instructions: item.instructions ?? "" }}
                    onChange={(idx, field, value) => {
                      setItems((prev) => prev.map((entry, i) => (i === idx ? { ...entry, [field]: value } : entry)));
                    }}
                    onRemove={(idx) => {
                      setItems((prev) =>
                        prev
                          .filter((_, i) => i !== idx)
                          .map((entry, order) => ({ ...entry, displayOrder: order + 1 })),
                      );
                    }}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : routineId ? "Update routine" : "Create routine"}
        </Button>
      </form>
    </Card>
  );
}
