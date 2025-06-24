import { Direction, ResizeEvent } from '../types';
import { getResizeEventCoordinates } from './events/getResizeEventCoordinates';
import { getInputType } from './getInputType';
import { intersects } from './rects/intersects';
import { compare } from './vendor/stackingOrder';

export type ResizeHandlerAction = "down" | "move" | "up";
export type SetResizeHandlerState = (
  action: ResizeHandlerAction,
  isActive: boolean,
  event: ResizeEvent | null
) => void;

export type PointerHitAreaMargins = {
  coarse: number;
  fine: number;
};

export type ResizeHandlerData = {
  direction: Direction;
  element: HTMLElement;
  hitAreaMargins: PointerHitAreaMargins;
  setResizeHandlerState: SetResizeHandlerState;
};

export const EXCEEDED_HORIZONTAL_MIN = 0b0001;
export const EXCEEDED_HORIZONTAL_MAX = 0b0010;
export const EXCEEDED_VERTICAL_MIN = 0b0100;
export const EXCEEDED_VERTICAL_MAX = 0b1000;

const isCoarsePointer = getInputType() === "coarse";

let intersectingHandles: ResizeHandlerData[] = [];
let isPointerDown = false;
let ownerDocumentCounts: Map<Document, number> = new Map();
let panelConstraintFlags: Map<string, number> = new Map();

const registeredResizeHandlers = new Set<ResizeHandlerData>();

export function registerResizeHandle(
  resizeHandleId: string,
  element: HTMLElement,
  direction: Direction,
  hitAreaMargins: PointerHitAreaMargins,
  setResizeHandlerState: SetResizeHandlerState
) {
  const { ownerDocument } = element;

  const data: ResizeHandlerData = {
    direction,
    element,
    hitAreaMargins,
    setResizeHandlerState,
  };

  const count = ownerDocumentCounts.get(ownerDocument) ?? 0;
  ownerDocumentCounts.set(ownerDocument, count + 1);

  registeredResizeHandlers.add(data);

  updateListeners();

  return function unregisterResizeHandle() {
    panelConstraintFlags.delete(resizeHandleId);
    registeredResizeHandlers.delete(data);

    const count = ownerDocumentCounts.get(ownerDocument) ?? 1;
    ownerDocumentCounts.set(ownerDocument, count - 1);

    updateListeners();

    if (count === 1) {
      ownerDocumentCounts.delete(ownerDocument);
    }

    // If the resize handle that is currently unmounting is intersecting with the pointer,
    // update the global pointer to account for the change
    if (intersectingHandles.includes(data)) {
      const index = intersectingHandles.indexOf(data);
      if (index >= 0) {
        intersectingHandles.splice(index, 1);
      }

      updateCursor();

      // Also instruct the handle to stop dragging; this prevents the parent group from being left in an inconsistent state
      setResizeHandlerState("up", true, null);
    }
  };
}

function handlePointerDown(event: PointerEvent) {
  const { target } = event;
  const { x, y } = getResizeEventCoordinates(event);

  isPointerDown = true;

  recalculateIntersectingHandles({ target, x, y });
  updateListeners();

  if (intersectingHandles.length > 0) {
    updateResizeHandlerStates("down", event);

    event.preventDefault();

    if (!isWithinResizeHandle(target as HTMLElement)) {
      event.stopImmediatePropagation();
    }
  }
}

function handlePointerMove(event: PointerEvent) {
  const { x, y } = getResizeEventCoordinates(event);

  // Edge case (see #340)
  // Detect when the pointer has been released outside an iframe on a different domain
  if (isPointerDown && event.buttons === 0) {
    isPointerDown = false;

    updateResizeHandlerStates("up", event);
  }

  if (!isPointerDown) {
    const { target } = event;

    // Recalculate intersecting handles whenever the pointer moves, except if it has already been pressed
    // at that point, the handles may not move with the pointer (depending on constraints)
    // but the same set of active handles should be locked until the pointer is released
    recalculateIntersectingHandles({ target, x, y });
  }

  updateResizeHandlerStates("move", event);

  // Update cursor based on return value(s) from active handles
  updateCursor();

  if (intersectingHandles.length > 0) {
    event.preventDefault();
  }
}

function handlePointerUp(event: ResizeEvent) {
  const { target } = event;
  const { x, y } = getResizeEventCoordinates(event);

  panelConstraintFlags.clear();
  isPointerDown = false;

  if (intersectingHandles.length > 0) {
    event.preventDefault();

    if (!isWithinResizeHandle(target as HTMLElement)) {
      event.stopImmediatePropagation();
    }
  }

  updateResizeHandlerStates("up", event);
  recalculateIntersectingHandles({ target, x, y });
  updateCursor();

  updateListeners();
}

function isWithinResizeHandle(element: HTMLElement | null) {
  let currentElement = element;

  while (currentElement) {
    if (currentElement.hasAttribute('data-panel-resize-handle')) {
      return true;
    }

    currentElement = currentElement.parentElement;
  }

  return false;
}

function recalculateIntersectingHandles({
  target,
  x,
  y,
}: {
  target: EventTarget | null;
  x: number;
  y: number;
}) {
  intersectingHandles.splice(0);

  let targetElement: HTMLElement | SVGElement | null = null;
  if (target instanceof HTMLElement || target instanceof SVGElement) {
    targetElement = target;
  }

  registeredResizeHandlers.forEach((data) => {
    const { element: dragHandleElement, hitAreaMargins } = data;

    const dragHandleRect = dragHandleElement.getBoundingClientRect();
    const { bottom, left, right, top } = dragHandleRect;

    const margin = isCoarsePointer
      ? hitAreaMargins.coarse
      : hitAreaMargins.fine;

    const eventIntersects =
      x >= left - margin &&
      x <= right + margin &&
      y >= top - margin &&
      y <= bottom + margin;

    if (eventIntersects) {
      // TRICKY
      // We listen for pointers events at the root in order to support hit area margins
      // (determining when the pointer is close enough to an element to be considered a "hit")
      // Clicking on an element "above" a handle (e.g. a modal) should prevent a hit though
      // so at this point we need to compare stacking order of a potentially intersecting drag handle,
      // and the element that was actually clicked/touched
      if (
        targetElement !== null &&
        document.contains(targetElement) &&
        dragHandleElement !== targetElement &&
        !dragHandleElement.contains(targetElement) &&
        !targetElement.contains(dragHandleElement) &&
        // Calculating stacking order has a cost, so we should avoid it if possible
        // That is why we only check potentially intersecting handles,
        // and why we skip if the event target is within the handle's DOM
        compare(targetElement, dragHandleElement) > 0
      ) {
        // If the target is above the drag handle, then we also need to confirm they overlap
        // If they are beside each other (e.g. a panel and its drag handle) then the handle is still interactive
        //
        // It's not enough to compare only the target
        // The target might be a small element inside of a larger container
        // (For example, a SPAN or a DIV inside of a larger modal dialog)
        let currentElement: HTMLElement | SVGElement | null = targetElement;
        let didIntersect = false;
        while (currentElement) {
          if (currentElement.contains(dragHandleElement)) {
            break;
          } else if (
            intersects(
              currentElement.getBoundingClientRect(),
              dragHandleRect,
              true
            )
          ) {
            didIntersect = true;
            break;
          }

          currentElement = currentElement.parentElement;
        }

        if (didIntersect) {
          return;
        }
      }

      intersectingHandles.push(data);
    }
  });
}

export function reportConstraintsViolation(
  resizeHandleId: string,
  flag: number
) {
  panelConstraintFlags.set(resizeHandleId, flag);
}

function updateCursor() {
  let intersectsHorizontal = false;
  let intersectsVertical = false;

  intersectingHandles.forEach((data) => {
    const { direction } = data;

    if (direction === "horizontal") {
      intersectsHorizontal = true;
    } else {
      intersectsVertical = true;
    }
  });

  let constraintFlags = 0;
  panelConstraintFlags.forEach((flag) => {
    constraintFlags |= flag;
  });

  if (intersectsHorizontal && intersectsVertical) {
    setGlobalCursorStyle("intersection", constraintFlags);
  } else if (intersectsHorizontal) {
    setGlobalCursorStyle("horizontal", constraintFlags);
  } else if (intersectsVertical) {
    setGlobalCursorStyle("vertical", constraintFlags);
  } else {
    resetGlobalCursorStyle();
  }
}

let listenersAbortController = new AbortController();

function updateListeners() {
  listenersAbortController.abort();
  listenersAbortController = new AbortController();

  const options: AddEventListenerOptions = {
    capture: true,
    signal: listenersAbortController.signal,
  };

  if (!registeredResizeHandlers.size) {
    return;
  }

  if (isPointerDown) {
    if (intersectingHandles.length > 0) {
      ownerDocumentCounts.forEach((count, ownerDocument) => {
        const { body } = ownerDocument;

        if (count > 0) {
          body.addEventListener("contextmenu", handlePointerUp, options);
          body.addEventListener("pointerleave", handlePointerMove, options);
          body.addEventListener("pointermove", handlePointerMove, options);
        }
      });
    }

    window.addEventListener("pointerup", handlePointerUp, options);
    window.addEventListener("pointercancel", handlePointerUp, options);
  } else {
    ownerDocumentCounts.forEach((count, ownerDocument) => {
      const { body } = ownerDocument;

      if (count > 0) {
        body.addEventListener("pointerdown", handlePointerDown, options);
        body.addEventListener("pointermove", handlePointerMove, options);
      }
    });
  }
}

function updateResizeHandlerStates(
  action: ResizeHandlerAction,
  event: ResizeEvent
) {
  registeredResizeHandlers.forEach((data) => {
    const { setResizeHandlerState } = data;

    const isActive = intersectingHandles.includes(data);

    setResizeHandlerState(action, isActive, event);
  });
}

// 光标样式管理
type CursorState = "horizontal" | "intersection" | "vertical";

let currentCursorStyle: string | null = null;
let enabled: boolean = true;
let prevRuleIndex = -1;
let styleElement: HTMLStyleElement | null = null;

export function getCursorStyle(
  state: CursorState,
  constraintFlags: number
): string {
  if (constraintFlags) {
    const horizontalMin = (constraintFlags & EXCEEDED_HORIZONTAL_MIN) !== 0;
    const horizontalMax = (constraintFlags & EXCEEDED_HORIZONTAL_MAX) !== 0;
    const verticalMin = (constraintFlags & EXCEEDED_VERTICAL_MIN) !== 0;
    const verticalMax = (constraintFlags & EXCEEDED_VERTICAL_MAX) !== 0;

    if (horizontalMin) {
      if (verticalMin) {
        return "se-resize";
      } else if (verticalMax) {
        return "ne-resize";
      } else {
        return "e-resize";
      }
    } else if (horizontalMax) {
      if (verticalMin) {
        return "sw-resize";
      } else if (verticalMax) {
        return "nw-resize";
      } else {
        return "w-resize";
      }
    } else if (verticalMin) {
      return "s-resize";
    } else if (verticalMax) {
      return "n-resize";
    }
  }

  switch (state) {
    case "horizontal":
      return "ew-resize";
    case "intersection":
      return "move";
    case "vertical":
      return "ns-resize";
  }
}

export function resetGlobalCursorStyle() {
  if (styleElement !== null) {
    document.head.removeChild(styleElement);

    currentCursorStyle = null;
    styleElement = null;
    prevRuleIndex = -1;
  }
}

export function setGlobalCursorStyle(
  state: CursorState,
  constraintFlags: number
) {
  if (!enabled) {
    return;
  }

  const style = getCursorStyle(state, constraintFlags);

  if (currentCursorStyle === style) {
    return;
  }

  currentCursorStyle = style;

  if (styleElement === null) {
    styleElement = document.createElement("style");
    document.head.appendChild(styleElement);
  }

  if (prevRuleIndex >= 0) {
    styleElement.sheet?.removeRule(prevRuleIndex);
  }

  prevRuleIndex =
    styleElement.sheet?.insertRule(`*{cursor: ${style} !important;}`) ?? -1;
} 