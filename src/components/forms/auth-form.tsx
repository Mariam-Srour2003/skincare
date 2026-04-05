"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loginSchema, registerSchema } from "@/lib/validators/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

type Mode = "login" | "register";

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const schema = mode === "login" ? loginSchema : registerSchema;

  const form = useForm<LoginValues | RegisterValues>({
    resolver: zodResolver(schema),
    defaultValues: mode === "login" ? { email: "", password: "" } : { name: "", email: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setLoading(true);
    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Authentication failed");
        return;
      }

      toast.success(mode === "login" ? "Welcome back" : "Account created");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Unexpected error");
    } finally {
      setLoading(false);
    }
  });

  const nameError =
    mode === "register" && "name" in form.formState.errors
      ? form.formState.errors.name?.message
      : undefined;

  return (
    <Card className="w-full max-w-md p-8 bg-slate-50">
      <h1 className="section-title text-3xl text-slate-900">{mode === "login" ? "Sign in" : "Create account"}</h1>
      <p className="mt-2 text-sm text-slate-600">Track your routine consistency and product performance.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {mode === "register" && (
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-900">Name</span>
            <Input {...form.register("name" as const)} />
            <p className="text-xs text-rose-500">{nameError}</p>
          </label>
        )}

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-900">Email</span>
          <Input type="email" {...form.register("email")} />
          <p className="text-xs text-rose-500">{form.formState.errors.email?.message}</p>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-900">Password</span>
          <Input type="password" {...form.register("password")} />
          <p className="text-xs text-rose-500">{form.formState.errors.password?.message}</p>
        </label>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Please wait..." : mode === "login" ? "Login" : "Register"}
        </Button>
      </form>
    </Card>
  );
}
