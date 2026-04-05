import { format } from "date-fns";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";

function csvEscape(value: string) {
  const escaped = value.replace(/"/g, '""');
  return `"${escaped}"`;
}

export async function GET() {
  const auth = await requireUser();
  if (!auth.user) return auth.response;

  const logs = await prisma.dailyLog.findMany({
    where: { userId: auth.user.id },
    include: {
      items: {
        include: { product: true },
      },
    },
    orderBy: { date: "desc" },
  });

  const lines = [
    ["date", "period", "product", "brand", "completed", "routineName", "note"].join(","),
    ...logs.flatMap((log) =>
      log.items.map((item) =>
        [
          format(log.date, "yyyy-MM-dd"),
          item.routinePeriod,
          csvEscape(item.product.name),
          csvEscape(item.product.brand),
          item.completed ? "yes" : "no",
          csvEscape(item.routineName),
          csvEscape(item.plannedNote ?? ""),
        ].join(","),
      ),
    ),
  ];

  return new NextResponse(lines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="skincare-history.csv"',
    },
  });
}
