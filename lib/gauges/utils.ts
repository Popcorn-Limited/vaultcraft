import { nextThursday } from "date-fns"

export function calcUnlockTime(days: number, start = Date.now()): number {
  const week = 86400 * 7;
  const now = start / 1000;
  const unlockTime = now + (86400 * days);

  return Math.floor(unlockTime / week) * week * 1000;
}

export function calcDaysToUnlock(unlockTime: number): number {
  const day = 86400;
  const now = Math.floor(Date.now() / 1000)
  return Math.floor((unlockTime - now) / day)
}

export function calculateVeOut(amount: number | string, days: number) {
  const week = 7;
  const maxTime = 52 * 4; // 4 years in weeks
  const lockTime = Math.floor(days / week);
  return Number(amount) * lockTime / maxTime;
}

export function getVotePeriodEndTime(): number {
  const n = nextThursday(new Date());
  const epochEndTime = Date.UTC(
    n.getFullYear(),
    n.getMonth(),
    n.getDate(),
    0,
    0,
    0
  );
  return epochEndTime;
}

export function thisPeriodTimestamp(): number {
  const week = 604800 * 1000;
  return (Math.floor(Date.now() / week) * week) / 1000;
};