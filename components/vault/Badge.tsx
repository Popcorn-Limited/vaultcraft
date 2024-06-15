import { cn } from "@/lib/utils/helpers";
import type { PropsWithChildren } from "react";

function Badge({
  children,
  className,
}: PropsWithChildren<{
  className?: string;
}>) {
  return (
    <div
      className={cn(
        "bg-customNeutral100/40 px-3 py-0.5 rounded-xl inline-block text-primaryGreen",
        className
      )}
    >
      {children}
    </div>
  );
}

export default Badge;
