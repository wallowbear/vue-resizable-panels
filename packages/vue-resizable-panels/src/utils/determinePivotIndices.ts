function getResizeHandleElementsForGroup(
  groupId: string,
  scope: ParentNode | HTMLElement = document
): HTMLElement[] {
  return Array.from(
    scope.querySelectorAll(
      `[data-panel-resize-handle-id][data-panel-group-id="${groupId}"]`
    )
  );
}

function getResizeHandleElementIndex(
  groupId: string,
  id: string,
  scope: ParentNode | HTMLElement = document
): number | null {
  const handles = getResizeHandleElementsForGroup(groupId, scope);
  const index = handles.findIndex(
    (handle) => handle.getAttribute('data-panel-resize-handle-id') === id
  );
  return index >= 0 ? index : null;
}

export function determinePivotIndices(
  groupId: string,
  resizeHandleId: string,
  panelGroupElement: HTMLElement
): [number, number] {
  const index = getResizeHandleElementIndex(
    groupId,
    resizeHandleId,
    panelGroupElement
  );

  return index != null ? [index, index + 1] : [-1, -1];
} 