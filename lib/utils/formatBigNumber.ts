import { formatUnits, parseUnits } from "viem";
import { ZERO } from "@/lib/constants";

const MILLION = 1e6;
const THOUSAND = 1e3;

export function formatAndRoundBigNumber(value: BigInt, decimals: number): string {
  if (typeof value === "bigint") {
    const formatedValue = Number(formatUnits(value, decimals));

    if (formatedValue > MILLION) {
      return `${(formatedValue / MILLION).toLocaleString(undefined, {
        maximumFractionDigits: 2,
      })}M`;
    }

    if (formatedValue > THOUSAND) {
      return `${(formatedValue / THOUSAND).toLocaleString(undefined, {
        maximumFractionDigits: 2,
      })}k`;
    }

    return parseFloat(formatedValue.toFixed(6)).toLocaleString(undefined, {
      maximumFractionDigits: formatedValue > 1 ? 2 : 6,
      // If number < 1, max fractional units are 6, else 2
    });
  }
  return `Invalid val: ${value}`;
}

export function formatAndRoundNumber(value: number, decimals: number): string {
  if (value === 0) return "0"
  return formatNumber(value / (10 ** decimals))
}

export function formatNumber(value: number): string {
  if (value > MILLION) {
    return `${(value / MILLION).toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })}M`;
  }

  if (value > THOUSAND) {
    return `${(value / THOUSAND).toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })}k`;
  }

  return parseFloat(value.toFixed(6)).toLocaleString(undefined, {
    maximumFractionDigits: value > 1 ? 2 : 6,
    // If number < 1, max fractional units are 6, else 2
  });
}

export function numberToBigNumber(value: number | string, decimals: number): BigInt {
  if (typeof value === "number") {
    return parseUnits(String(value), decimals);
  } else if (typeof value === "string") {
    if (value == "" || value == ".") value = "0";
    return parseUnits(value, decimals);
  }
  return ZERO;
}


export const NumberFormatter = Intl.NumberFormat("en", {
  //@ts-ignore
  notation: "compact",
});

export function safeRound(bn: bigint, decimals = 18): bigint {
  const roundingValue = parseUnits("1", decimals > 8 ? 8 : 2)
  return (bn / roundingValue) * roundingValue
}