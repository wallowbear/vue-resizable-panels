export function determinePivotIndices(
  _groupId: string,
  resizeHandleId: string,
  _panelGroupElement: HTMLElement
): [number, number] {
  // 简化实现：通过handle ID确定相邻的两个面板
  const handleIndex = parseInt(resizeHandleId.split('-').pop() || '0');
  const firstPivotIndex = handleIndex;
  const secondPivotIndex = handleIndex + 1;
  
  return [firstPivotIndex, secondPivotIndex];
} 