"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const dark = resolvedTheme === "dark";

  return (
    <Button variant="secondary" onClick={() => setTheme(dark ? "light" : "dark")}>
      {dark ? "Switch to light" : "Switch to dark"}
    </Button>
  );
}
