import type { ResizeEvent } from "../../types";

export function getResizeEventCursorPosition(
  direction: "horizontal" | "vertical",
  event: ResizeEvent
): number {
  const isHorizontal = direction === "horizontal";
  
  if ('clientX' in event && 'clientY' in event) {
    return isHorizontal ? event.clientX : event.clientY;
  }

  return 0;
} 