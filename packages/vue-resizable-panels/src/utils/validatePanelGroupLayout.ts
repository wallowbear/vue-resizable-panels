import { PanelConstraints } from "../Panel";
import { fuzzyNumbersEqual } from "./numbers/fuzzyCompareNumbers";
import { resizePanel } from "./resizePanel";

export function validatePanelGroupLayout({
  layout,
  panelConstraints,
}: {
  layout: number[];
  panelConstraints: PanelConstraints[];
}): number[] {
  const nextLayout = [...layout];

  let totalSize = 0;

  // Validate each panel against its constraints
  for (let index = 0; index < nextLayout.length; index++) {
    const size = nextLayout[index]!;
    const validatedSize = resizePanel({
      panelConstraints,
      panelIndex: index,
      size,
    });

    nextLayout[index] = validatedSize;
    totalSize += validatedSize;
  }

  // If total doesn't equal 100%, normalize
  if (!fuzzyNumbersEqual(totalSize, 100)) {
    for (let index = 0; index < nextLayout.length; index++) {
      nextLayout[index] = (nextLayout[index]! / totalSize) * 100;
    }
  }

  return nextLayout;
} 