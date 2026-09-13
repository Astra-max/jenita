import { type ButtonHTMLAttributes, forwardRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

interface BaseProps {
  variant?: Variant;
  size?: Size;
  className?: string;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-ink text-white hover:bg-ink-soft active:translate-y-px",
  secondary:
    "bg-bloom-100 text-ink hover:bg-bloom-200 active:translate-y-px",
  ghost: "bg-transparent text-ink hover:bg-sand-100",
};

const sizeClasses: Record<Size, string> = {
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-[15px]",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    BaseProps {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(base, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    />
  )
);
Button.displayName = "Button";

interface LinkButtonProps extends BaseProps {
  href: string;
  children: React.ReactNode;
}

export function LinkButton({
  href,
  children,
  variant = "primary",
  size = "md",
  className,
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={cn(base, variantClasses[variant], sizeClasses[size], className)}
    >
      {children}
    </Link>
  );
}
