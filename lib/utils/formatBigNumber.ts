import { formatUnits, parseUnits } from "viem";
import { ZERO } from "@/lib/constants";
import { roundToTwoDecimalPlaces } from "./helpers";

const MILLION = 1e6;
const THOUSAND = 1e3;

export function formatAndRoundBigNumber(
  value: BigInt,
  decimals: number
): string {
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
  if (value === 0) return "0";
  return formatNumber(value / 10 ** decimals);
}

export function formatNumber(value: number): string {
  if (!value) value = 0;
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

export function multiplyDecimals(value: number, multiplier: number): number {
  function countDecimalPlaces(value: number): number {
    if (value % 1 !== 0) {
      let decimalString = value.toString().split(".")[1];
      if (decimalString) {
        return decimalString.length;
      }
    }
    return 0;
  }

  return Number((value * multiplier).toFixed(countDecimalPlaces(value)));
}

export function formatToFixedDecimals(value: number, decimals: number): string {
  return Number(
    Number.parseFloat(value.toString()).toFixed(decimals)
  ).toLocaleString();
}

export const NumberFormatter = Intl.NumberFormat("en", {
  //@ts-ignore
  notation: "compact",
});

export function safeRound(bn: bigint, decimals = 18): bigint {
  let roundingDecimals = 1;
  if (decimals < 2) {
    roundingDecimals = 1;
  } else if (decimals <= 8) {
    roundingDecimals = 2;
  } else if (decimals <= 18) {
    roundingDecimals = 8;
  } else if (decimals === 27) {
    roundingDecimals = 12;
  }
  const roundingValue = parseUnits("1", roundingDecimals);
  return (bn / roundingValue) * roundingValue;
}

export const formatTwoDecimals = (value: number): string => {
  if (Number.isFinite(value) && value > 0) {
    return NumberFormatter.format(roundToTwoDecimalPlaces(value));
  }

  return "0";
};
