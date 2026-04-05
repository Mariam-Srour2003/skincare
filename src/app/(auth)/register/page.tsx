import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/forms/auth-form";
import { getSessionUser } from "@/lib/auth";

export default async function RegisterPage() {
  const user = await getSessionUser();
  if (user) redirect("/dashboard");

  return (
    <div className="hero-bg flex min-h-screen items-center justify-center px-4">
      <div className="space-y-6">
        <AuthForm mode="register" />
        <p className="text-center text-sm text-slate-600">
          Already have an account? <Link href="/login" className="font-semibold text-sky-600">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
