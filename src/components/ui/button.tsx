import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-sky-500 text-white hover:bg-sky-600 focus-visible:ring-sky-400 shadow-md hover:shadow-lg",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:ring-slate-400 shadow-sm hover:shadow-md",
        ghost: "hover:bg-slate-100 text-slate-700",
        danger: "bg-rose-500 text-white hover:bg-rose-600 focus-visible:ring-rose-500 shadow-md hover:shadow-lg",
      },
      size: {
        md: "h-10 px-4",
        sm: "h-9 px-3 text-xs",
        lg: "h-11 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button suppressHydrationWarning className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
