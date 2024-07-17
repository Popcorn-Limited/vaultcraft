import { cn } from "@/lib/utils/helpers";
import type { PropsWithChildren } from "react";

function Badge({
  children,
  className,
  variant = "primaryGreen",
}: PropsWithChildren<{
  className?: string;
  variant?: "primaryGreen" | "primaryYellow";
}>) {
  return (
    <div
      className={cn(
        "px-3 py-0.5 rounded-xl inline-block",
        variant === "primaryGreen" &&
          "bg-customNeutral100/40 text-primaryGreen",
        variant === "primaryYellow" &&
          "bg-primaryYellow/[0.15] text-primaryYellow",
        className
      )}
    >
      {children}
    </div>
  );
}

export default Badge;
