const PRECISION = 5;

export function fuzzyCompareNumbers(
  actual: number,
  expected: number,
  fractionDigits: number = PRECISION
): number {
  const actualRounded = parseFloat(actual.toFixed(fractionDigits));
  const expectedRounded = parseFloat(expected.toFixed(fractionDigits));

  if (actualRounded < expectedRounded) {
    return -1;
  } else if (actualRounded > expectedRounded) {
    return 1;
  } else {
    return 0;
  }
}

export function fuzzyNumbersEqual(
  actual: number,
  expected: number,
  fractionDigits: number = PRECISION
): boolean {
  return fuzzyCompareNumbers(actual, expected, fractionDigits) === 0;
} 