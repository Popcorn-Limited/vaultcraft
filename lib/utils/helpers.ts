export function validateInput(value: string | number): { formatted: string, isValid: boolean } {
  const formatted = value === "." ? "0" : (`${value || "0"}`.replace(/\.$/, ".0") as any);
  return {
    formatted,
    isValid: value === "" || isFinite(Number(formatted)),
  };
};