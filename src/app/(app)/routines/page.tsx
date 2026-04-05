import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { RoutineList } from "@/components/routines/routine-list";

export default async function RoutinesPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const routines = await prisma.routine.findMany({
    where: { userId: user.id, archivedAt: null },
    include: {
      days: true,
      items: {
        include: { product: true },
        orderBy: { displayOrder: "asc" },
      },
    },
    orderBy: [{ isDefault: "desc" }, { period: "asc" }, { createdAt: "desc" }],
  });

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="section-title text-3xl">Routines</h1>
        <Link href="/routines/new">
          <Button>Create routine</Button>
        </Link>
      </div>
      <RoutineList routines={routines} />
    </section>
  );
}
