import { PanelConstraints } from "../Panel";
import { validatePanelConstraints } from "./validatePanelConstraints";

export function resizePanel({
  panelConstraints,
  panelIndex,
  size,
}: {
  panelConstraints: PanelConstraints[];
  panelIndex: number;
  size: number;
}): number {
  return validatePanelConstraints({
    panelConstraints,
    panelIndex,
    size,
  });
} 