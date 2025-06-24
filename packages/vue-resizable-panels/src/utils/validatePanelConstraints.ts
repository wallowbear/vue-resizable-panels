import { PanelConstraints } from "../Panel";
import { fuzzyNumbersEqual } from "./numbers/fuzzyCompareNumbers";

export function validatePanelConstraints({
  panelConstraints,
  panelIndex,
  size,
}: {
  panelConstraints: PanelConstraints[];
  panelIndex: number;
  size: number;
}): number {
  const { collapsedSize = 0, collapsible, maxSize = 100, minSize = 0 } =
    panelConstraints[panelIndex] ?? {};

  if (collapsible && fuzzyNumbersEqual(size, collapsedSize)) {
    return collapsedSize;
  }

  if (size < minSize) {
    return minSize;
  } else if (size > maxSize) {
    return maxSize;
  }

  return size;
} 