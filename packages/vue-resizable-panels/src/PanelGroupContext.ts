import type { PanelConstraints, PanelData } from "./Panel";
import type { InjectionKey } from "vue";

// The "contextmenu" event is not supported as a PointerEvent in all browsers yet, so MouseEvent still need to be handled
export type ResizeEvent = KeyboardEvent | PointerEvent | MouseEvent;
export type ResizeHandler = (event: ResizeEvent) => void;

export type DragState = {
  dragHandleId: string;
  dragHandleRect: DOMRect;
  initialCursorPosition: number;
  initialLayout: number[];
};

export interface PanelGroupContext {
  collapsePanel: (panelData: PanelData) => void;
  direction: "horizontal" | "vertical";
  dragState: DragState | null;
  expandPanel: (panelData: PanelData, minSizeOverride?: number) => void;
  getPanelSize: (panelData: PanelData) => number;
  getPanelStyle: (
    panelData: PanelData,
    defaultSize: number | undefined
  ) => Record<string, any>;
  groupId: string;
  isPanelCollapsed: (panelData: PanelData) => boolean;
  isPanelExpanded: (panelData: PanelData) => boolean;
  reevaluatePanelConstraints: (
    panelData: PanelData,
    prevConstraints: PanelConstraints
  ) => void;
  registerPanel: (panelData: PanelData) => void;
  registerResizeHandle: (dragHandleId: string) => ResizeHandler;
  resizePanel: (panelData: PanelData, size: number) => void;
  startDragging: (dragHandleId: string, event: ResizeEvent) => void;
  stopDragging: () => void;
  unregisterPanel: (panelData: PanelData) => void;
  panelGroupElement: ParentNode | null;
}

export const PanelGroupContextKey: InjectionKey<PanelGroupContext> = Symbol('PanelGroupContext'); 