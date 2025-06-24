import type { Direction } from "../types";

export function calculateDeltaPercentage(
  event: { clientX: number; clientY: number },
  direction: Direction,
  initialCursorPosition: number,
  panelGroupElement: HTMLElement
): number {
  const rect = panelGroupElement.getBoundingClientRect();
  const isHorizontal = direction === "horizontal";
  
  const currentPosition = isHorizontal ? event.clientX : event.clientY;
  const groupSize = isHorizontal ? rect.width : rect.height;
  
  const deltaPixels = currentPosition - initialCursorPosition;
  const deltaPercentage = (deltaPixels / groupSize) * 100;
  
  return deltaPercentage;
} 