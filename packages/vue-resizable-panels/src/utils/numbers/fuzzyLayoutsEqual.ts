import { fuzzyNumbersEqual } from "./fuzzyCompareNumbers";

export function fuzzyLayoutsEqual(
  a: number[],
  b: number[],
  fractionDigits?: number
): boolean {
  if (a.length !== b.length) {
    return false;
  }

  for (let index = 0; index < a.length; index++) {
    if (!fuzzyNumbersEqual(a[index]!, b[index]!, fractionDigits)) {
      return false;
    }
  }

  return true;
} 