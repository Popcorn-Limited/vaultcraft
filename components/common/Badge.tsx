import { cn } from "@/lib/utils/helpers";
import type { PropsWithChildren } from "react";

function Badge({
  children,
  className,
  variant = "primaryGreen",
}: PropsWithChildren<{
  className?: string;
  variant?: "primaryGreen" | "primaryGreen";
}>) {
  return (
    <div
      className={cn(
        "px-3 py-0.5 rounded-xl inline-block",
        variant === "primaryGreen" &&
          "bg-customNeutral100/40 text-primaryGreen",
        variant === "primaryGreen" &&
          "bg-primaryGreen/[0.15] text-primaryGreen",
        className
      )}
    >
      {children}
    </div>
  );
}

export default Badge;
