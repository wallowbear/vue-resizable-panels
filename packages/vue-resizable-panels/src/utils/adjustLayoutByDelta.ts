import type { PanelConstraints } from "../Panel";
import { assert } from "./assert";
import { fuzzyCompareNumbers } from "./numbers/fuzzyCompareNumbers";
import { fuzzyNumbersEqual } from "./numbers/fuzzyCompareNumbers";
import { resizePanel } from "./resizePanel";

// All units must be in percentages; pixel values should be pre-converted
export function adjustLayoutByDelta({
  delta,
  initialLayout,
  panelConstraints: panelConstraintsArray,
  pivotIndices,
  prevLayout,
  trigger,
}: {
  delta: number;
  initialLayout: number[];
  panelConstraints: PanelConstraints[];
  pivotIndices: number[];
  prevLayout: number[];
  trigger: "imperative-api" | "keyboard" | "mouse-or-touch";
}): number[] {
  if (fuzzyNumbersEqual(delta, 0)) {
    return initialLayout;
  }

  const nextLayout = [...initialLayout];
  const [firstPivotIndex, secondPivotIndex] = pivotIndices;
  assert(firstPivotIndex != null, "Invalid first pivot index");
  assert(secondPivotIndex != null, "Invalid second pivot index");

  let deltaApplied = 0;

  // A resizing panel affects the panels before or after it.
  // A negative delta means the panel(s) immediately after the resize handle should grow/expand by decreasing its offset.
  // A positive delta means the panel(s) immediately before the resize handle should "expand".

  {
    // Apply the delta to the first pivot panel
    const prevSize = initialLayout[firstPivotIndex];
    assert(prevSize != null, `Previous layout not found for panel index ${firstPivotIndex}`);
    
    const unsafeSize = prevSize + delta;
    const safeSize = resizePanel({
      panelConstraints: panelConstraintsArray,
      panelIndex: firstPivotIndex,
      size: unsafeSize,
    });

    if (!fuzzyNumbersEqual(prevSize, safeSize)) {
      deltaApplied = safeSize - prevSize;
      nextLayout[firstPivotIndex] = safeSize;
    }
  }

  {
    // Apply the inverse delta to the second pivot panel  
    const prevSize = initialLayout[secondPivotIndex];
    assert(prevSize != null, `Previous layout not found for panel index ${secondPivotIndex}`);
    
    const unsafeSize = prevSize - deltaApplied;
    const safeSize = resizePanel({
      panelConstraints: panelConstraintsArray,
      panelIndex: secondPivotIndex,
      size: unsafeSize,
    });

    nextLayout[secondPivotIndex] = safeSize;
  }

  return nextLayout;
} 