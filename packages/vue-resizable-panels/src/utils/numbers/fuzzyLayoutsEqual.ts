import { fuzzyNumbersEqual } from "./fuzzyCompareNumbers";

export function fuzzyLayoutsEqual(
  a: number[],
  b: number[]
): boolean {
  if (a.length !== b.length) {
    return false;
  }

  for (let index = 0; index < a.length; index++) {
    if (!fuzzyNumbersEqual(a[index], b[index])) {
      return false;
    }
  }

  return true;
} 