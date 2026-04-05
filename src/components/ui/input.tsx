import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus-visible:border-sky-500 focus-visible:ring-2 focus-visible:ring-sky-100",
      className,
    )}
    {...props}
  />
));

Input.displayName = "Input";
