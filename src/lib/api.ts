import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) {
    return {
      user: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { user, response: null };
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}
