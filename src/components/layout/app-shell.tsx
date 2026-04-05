"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/products", label: "Products" },
  { href: "/routines", label: "Routines" },
  { href: "/calendar", label: "Calendar" },
  { href: "/settings", label: "Settings" },
];

export function AppShell({ children, userName }: { children: React.ReactNode; userName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    const res = await fetch("/api/auth/logout", { method: "POST" });
    if (res.ok) {
      toast.success("Logged out");
      router.push("/login");
      router.refresh();
    } else {
      toast.error("Could not log out");
    }
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Welcome back</p>
            <h1 className="section-title text-xl text-slate-900">{userName}</h1>
          </div>
          <nav className="hidden gap-2 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  pathname.startsWith(link.href)
                    ? "bg-sky-600 text-white hover:bg-sky-700"
                    : "text-slate-600 hover:bg-slate-100",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <Button variant="secondary" onClick={logout}>
            Logout
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">{children}</main>

      <nav className="fixed bottom-4 left-1/2 z-50 flex w-[min(95vw,580px)] -translate-x-1/2 gap-2 rounded-xl border border-slate-200 bg-slate-50/95 p-2 shadow-lg backdrop-blur md:hidden">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex-1 rounded-lg px-2 py-2 text-center text-xs font-semibold transition-colors",
              pathname.startsWith(link.href)
                ? "bg-sky-600 text-white"
                : "text-slate-600",
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
