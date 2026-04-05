import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RoutineForm } from "@/components/routines/routine-form";

export default async function NewRoutinePage() {
  const user = await getSessionUser();
  if (!user) return null;

  const products = await prisma.product.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } });

  return (
    <section className="space-y-4">
      <h1 className="section-title text-3xl">Create Routine</h1>
      <RoutineForm products={products} />
    </section>
  );
}
