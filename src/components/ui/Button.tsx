import React from "react";
import { clsx } from "clsx";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-xl font-heading font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

    const variants = {
      primary:
        "bg-primary text-white hover:bg-primary-600 shadow-lg shadow-primary/25 border border-transparent",
      secondary:
        "bg-secondary text-white hover:bg-secondary-600 shadow-lg shadow-secondary/25 border border-transparent",
      outline:
        "border-2 border-primary text-primary hover:bg-primary-50 bg-transparent",
      ghost:
        "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
      danger:
        "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/25",
    };

    const sizes = {
      sm: "h-9 px-3 text-xs",
      md: "h-11 px-5 text-sm",
      lg: "h-14 px-8 text-lg",
    };

    return (
      <button
        ref={ref}
        disabled={isLoading || disabled}
        className={clsx(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
