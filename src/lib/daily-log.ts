import { DailyLog, DayOfWeek, RoutinePeriod } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const DAY_NAMES: DayOfWeek[] = [
  DayOfWeek.SUNDAY,
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY,
];

export function getDayOfWeek(date: Date): DayOfWeek {
  return DAY_NAMES[date.getUTCDay()];
}

function normalizeDate(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export async function ensureDailyLog(userId: string, inputDate: Date): Promise<DailyLog> {
  const date = normalizeDate(inputDate);

  const dayOfWeek = getDayOfWeek(date);

  const routines = await prisma.routine.findMany({
    where: {
      userId,
      archivedAt: null,
      period: { in: [RoutinePeriod.MORNING, RoutinePeriod.NIGHT] },
      OR: [{ days: { some: { dayOfWeek } } }, { isDefault: true }],
    },
    include: {
      days: true,
      items: {
        include: { product: true },
        orderBy: { displayOrder: "asc" },
      },
    },
    orderBy: [{ isDefault: "asc" }, { createdAt: "desc" }],
  });

  const selectedByPeriod = new Map<RoutinePeriod, (typeof routines)[number]>();

  for (const routine of routines) {
    const routineDays = routine.days as Array<{ dayOfWeek: DayOfWeek }>;
    if (routineDays.some((entry) => entry.dayOfWeek === dayOfWeek)) {
      selectedByPeriod.set(routine.period, routine);
    }
  }

  for (const routine of routines) {
    if (!selectedByPeriod.has(routine.period) && routine.isDefault) {
      selectedByPeriod.set(routine.period, routine);
    }
  }

  const plannedItems = Array.from(selectedByPeriod.values()).flatMap((routine) =>
    routine.items
      .filter((item) => item.product.isActive)
      .map((item) => ({
        productId: item.productId,
        routinePeriod: routine.period,
        routineName: routine.name,
        plannedOrder: item.displayOrder,
        plannedNote: item.instructions,
      })),
  );

  const existingLog = await prisma.dailyLog.findUnique({
    where: {
      userId_date: { userId, date },
    },
    include: {
      items: true,
    },
  });

  const dailyLog =
    existingLog ??
    (await prisma.dailyLog.create({
      data: {
        userId,
        date,
        dayOfWeek,
      },
    }));

  const existingItems = (existingLog?.items ?? []) as Array<{
    productId: string;
    routinePeriod: RoutinePeriod;
    routineName: string;
    plannedOrder: number;
    plannedNote: string | null;
    completed: boolean;
    completedAt: Date | null;
  }>;

  const completionMap = new Map<string, { completed: boolean; completedAt: Date | null }>(
    existingItems.map((item) => [`${item.productId}:${item.routinePeriod}`, { completed: item.completed, completedAt: item.completedAt }]),
  );

  const nextItems = plannedItems.map((item) => {
    const saved = completionMap.get(`${item.productId}:${item.routinePeriod}`);
    return {
      dailyLogId: dailyLog.id,
      productId: item.productId,
      routinePeriod: item.routinePeriod,
      routineName: item.routineName,
      plannedOrder: item.plannedOrder,
      plannedNote: item.plannedNote,
      completed: saved?.completed ?? false,
      completedAt: saved?.completedAt ?? null,
    };
  });

  const sameShape =
    existingItems.length === nextItems.length &&
    existingItems.every((item) =>
      nextItems.some(
        (nextItem) =>
          nextItem.productId === item.productId &&
          nextItem.routinePeriod === item.routinePeriod &&
          nextItem.routineName === item.routineName &&
          nextItem.plannedOrder === item.plannedOrder,
      ),
    );

  if (!sameShape) {
    await prisma.dailyLogItem.deleteMany({ where: { dailyLogId: dailyLog.id } });
    if (nextItems.length > 0) {
      await prisma.dailyLogItem.createMany({ data: nextItems });
    }
  }

  return dailyLog;
}

export async function getDailyLogWithItems(userId: string, date: Date) {
  const log = await ensureDailyLog(userId, date);
  return prisma.dailyLog.findUniqueOrThrow({
    where: { id: log.id },
    include: {
      items: {
        include: { product: true },
        orderBy: [{ routinePeriod: "asc" }, { plannedOrder: "asc" }],
      },
    },
  });
}
