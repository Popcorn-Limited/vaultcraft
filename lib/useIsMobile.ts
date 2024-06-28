import { useEffect, useState } from "react";

export default function useIsBreakPoint(bp: "md" | "sm" | "lg") {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    function onChange(event: MediaQueryListEvent) {
      setIsActive(event.matches);
    }

    const result = matchMedia(
      `(max-width: ${bp === "lg" ? 1200 : bp === "md" ? 1024 : 640}px)`
    );
    result.addEventListener("change", onChange);
    setIsActive(result.matches);

    return () => result.removeEventListener("change", onChange);
  }, [bp]);

  return isActive;
}
