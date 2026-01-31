import { cn } from "@/lib/utils";

interface CurrencyDisplayProps {
  amount: number; // in cents
  className?: string;
  showIcon?: boolean;
}

export function CurrencyDisplay({ amount, className, showIcon = true }: CurrencyDisplayProps) {
  const dollars = (amount / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  return (
    <span className={cn("inline-flex items-center font-bold text-emerald-600", className)}>
      {showIcon && <span className="mr-1 text-yellow-500">🪙</span>}
      {dollars}
    </span>
  );
}
