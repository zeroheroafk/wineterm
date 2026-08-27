import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "quiet";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "border border-wine bg-wine text-paper hover:bg-wine-deep hover:border-wine-deep",
  secondary:
    "border border-rule bg-paper text-ink hover:border-wine hover:text-wine-deep",
  quiet: "border border-transparent bg-transparent text-wine hover:text-wine-deep",
};

const BASE_CLASSES =
  "inline-flex h-9 items-center justify-center gap-2 px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...props}
      className={`${BASE_CLASSES} ${VARIANT_CLASSES[variant]} ${className}`}
    />
  );
}

export function ButtonLink({
  variant = "primary",
  href,
  children,
  className = "",
}: {
  variant?: Variant;
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`${BASE_CLASSES} ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
