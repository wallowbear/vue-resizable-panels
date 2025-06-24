import { PanelData } from "../Panel";

export function calculateUnsafeDefaultLayout({
  panelDataArray,
}: {
  panelDataArray: PanelData[];
}): number[] {
  const layout: number[] = Array(panelDataArray.length);

  const panelsWithSizes: number[] = [];
  const panelsWithoutSizes: number[] = [];

  let totalDefaultSize = 0;

  // First pass: identify explicit sizes
  for (let index = 0; index < panelDataArray.length; index++) {
    const panelData = panelDataArray[index]!;
    const { defaultSize } = panelData.constraints;

    if (defaultSize != null) {
      panelsWithSizes.push(index);
      layout[index] = defaultSize;
      totalDefaultSize += defaultSize;
    } else {
      panelsWithoutSizes.push(index);
    }
  }

  // Second pass: distribute remaining space
  if (panelsWithoutSizes.length > 0) {
    const remainingSize = 100 - totalDefaultSize;
    const sizePerPanel = Math.max(0, remainingSize / panelsWithoutSizes.length);

    for (const index of panelsWithoutSizes) {
      layout[index] = sizePerPanel;
    }
  }

  return layout;
} 