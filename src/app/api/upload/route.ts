import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/api";

const uploadDir = path.join(process.cwd(), "public", "uploads");

export async function POST(req: Request) {
  const auth = await requireUser();
  if (!auth.user) return auth.response;

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Image must be <= 5MB" }, { status: 400 });
  }

  await fs.mkdir(uploadDir, { recursive: true });

  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `${crypto.randomUUID()}.${ext}`;
  const absPath = path.join(uploadDir, fileName);

  const arrayBuffer = await file.arrayBuffer();
  await fs.writeFile(absPath, Buffer.from(arrayBuffer));

  return NextResponse.json({ url: `/uploads/${fileName}` }, { status: 201 });
}
