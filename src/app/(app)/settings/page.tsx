import { getSessionUser } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default async function SettingsPage() {
  const user = await getSessionUser();
  if (!user) return null;

  return (
    <section className="space-y-4">
      <h1 className="section-title text-3xl">Settings</h1>

      <Card className="p-6 space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Account Information</p>
          <p className="font-semibold text-lg text-slate-900 mt-2">{user.name}</p>
          <p className="text-sm text-slate-600">{user.email}</p>
        </div>
      </Card>

      <Card className="p-6 flex flex-wrap items-center gap-6">
        <ThemeToggle />
        <a href="/api/export/history">
          <Button variant="secondary">Export history as CSV</Button>
        </a>
      </Card>
    </section>
  );
}
