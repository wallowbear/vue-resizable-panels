export function intersects(
  rectA: DOMRect,
  rectB: DOMRect,
  allowTouching: boolean = false
): boolean {
  const threshold = allowTouching ? 0 : 1;
  
  return !(
    rectA.right < rectB.left + threshold ||
    rectA.left > rectB.right - threshold ||
    rectA.bottom < rectB.top + threshold ||
    rectA.top > rectB.bottom - threshold
  );
} 