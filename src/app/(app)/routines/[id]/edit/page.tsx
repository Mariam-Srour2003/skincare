import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RoutineForm } from "@/components/routines/routine-form";
import { DayOfWeek } from "@prisma/client";

export default async function EditRoutinePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return null;

  const { id } = await params;

  const [products, routine] = await Promise.all([
    prisma.product.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } }),
    prisma.routine.findFirst({
      where: { id, userId: user.id, archivedAt: null },
      include: { days: true, items: { orderBy: { displayOrder: "asc" } } },
    }),
  ]);

  if (!routine) notFound();

  const routineWithDays = routine as {
    id: string;
    name: string;
    period: string;
    isDefault: boolean;
    days: Array<{ dayOfWeek: DayOfWeek }>;
    items: Array<{
      id: string;
      productId: string;
      displayOrder: number;
      instructions: string | null;
    }>;
  };

  return (
    <section className="space-y-4">
      <h1 className="section-title text-3xl">Edit Routine</h1>
      <RoutineForm
        products={products}
        routineId={routineWithDays.id}
        initial={{
          name: routineWithDays.name,
          daysOfWeek: routineWithDays.days.map((entry) => entry.dayOfWeek),
          period: routineWithDays.period as "MORNING" | "NIGHT",
          isDefault: routineWithDays.isDefault,
          items: routineWithDays.items.map((item) => ({
            id: item.id,
            productId: item.productId,
            displayOrder: item.displayOrder,
            instructions: item.instructions,
          })),
        }}
      />
    </section>
  );
}
