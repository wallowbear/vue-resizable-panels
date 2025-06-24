<template>
  <component
    :is="tagName"
    ref="panelGroupElementRef"
    :class="className"
    :style="groupStyle"
    :data-panel-group="true"
    :data-panel-group-direction="direction"
    :data-panel-group-id="groupId"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed, provide, reactive, ref, onMounted, onUnmounted, watch } from 'vue';
import type { Direction, ResizeEvent, ResizeHandler } from '../types';
import { PanelGroupContextKey } from '../PanelGroupContext';
import type { PanelGroupContext, DragState } from '../PanelGroupContext';
import type { PanelData, PanelConstraints } from '../Panel';
import { useUniqueId } from '../composables/useUniqueId';
import { adjustLayoutByDelta } from '../utils/adjustLayoutByDelta';
import { calculateDeltaPercentage } from '../utils/calculateDeltaPercentage';
import { calculateUnsafeDefaultLayout } from '../utils/calculateUnsafeDefaultLayout';
import { computePanelFlexBoxStyle } from '../utils/computePanelFlexBoxStyle';
import { determinePivotIndices } from '../utils/determinePivotIndices';
import { getResizeEventCursorPosition } from '../utils/events/getResizeEventCursorPosition';
import { validatePanelGroupLayout } from '../utils/validatePanelGroupLayout';
import { fuzzyLayoutsEqual } from '../utils/numbers/fuzzyLayoutsEqual';
import { 
  registerResizeHandle as globalRegisterResizeHandle,
  reportConstraintsViolation,
  EXCEEDED_HORIZONTAL_MIN,
  EXCEEDED_HORIZONTAL_MAX,
  EXCEEDED_VERTICAL_MIN,
  EXCEEDED_VERTICAL_MAX,
  type ResizeHandlerAction,
  type SetResizeHandlerState
} from '../utils/panelResizeHandleRegistry';

export interface PanelGroupProps {
  id?: string | null;
  direction: Direction;
  className?: string;
  style?: Record<string, any>;
  tagName?: string;
  keyboardResizeBy?: number | null;
  onLayout?: (layout: number[]) => void;
}

const props = withDefaults(defineProps<PanelGroupProps>(), {
  className: '',
  style: () => ({}),
  tagName: 'div',
  keyboardResizeBy: null,
});

const emit = defineEmits<{
  layout: [layout: number[]];
}>();

const groupId = useUniqueId(props.id);
const panelGroupElementRef = ref<HTMLElement>();
const dragState = ref<DragState | null>(null);
const layout = ref<number[]>([]);
const panelDataArray = ref<PanelData[]>([]);
const prevDeltaRef = ref<number>(0);

const groupStyle = computed(() => {
  return {
    display: 'flex',
    flexDirection: props.direction === 'horizontal' ? 'row' : 'column',
    height: '100%',
    overflow: 'hidden',
    width: '100%',
    ...props.style,
  };
});

// React版本的registerResizeHandle实现
const registerResizeHandle = (dragHandleId: string): ResizeHandler => {
  let isRTL = false;

  const panelGroupElement = panelGroupElementRef.value;
  if (panelGroupElement) {
    const style = window.getComputedStyle(panelGroupElement, null);
    if (style.getPropertyValue("direction") === "rtl") {
      isRTL = true;
    }
  }

  return function resizeHandler(event: ResizeEvent) {
    event.preventDefault();

    const panelGroupElement = panelGroupElementRef.value;
    if (!panelGroupElement) {
      return;
    }

    const { initialLayout } = dragState.value ?? {};

    const pivotIndices = determinePivotIndices(
      groupId,
      dragHandleId,
      panelGroupElement
    );

    const currentCursorPosition = getResizeEventCursorPosition(props.direction, event);
    const { initialCursorPosition } = dragState.value || { initialCursorPosition: currentCursorPosition };
    
    let delta = calculateDeltaPercentage(
      { clientX: ('clientX' in event) ? event.clientX : 0, clientY: ('clientY' in event) ? event.clientY : 0 },
      props.direction,
      initialCursorPosition,
      panelGroupElement
    );

    const isHorizontal = props.direction === "horizontal";

    if (isHorizontal && isRTL) {
      delta = -delta;
    }

    const panelConstraints = panelDataArray.value.map(
      (panelData) => panelData.constraints
    );

    const nextLayout = adjustLayoutByDelta({
      delta,
      initialLayout: initialLayout ?? layout.value,
      panelConstraints,
      pivotIndices,
      prevLayout: layout.value,
      trigger: isKeyDown(event) ? "keyboard" : "mouse-or-touch",
    });

    const layoutChanged = !fuzzyLayoutsEqual(layout.value, nextLayout);

    // Only update the cursor for layout changes triggered by touch/mouse events (not keyboard)
    // Update the cursor even if the layout hasn't changed (we may need to show an invalid cursor state)
    if (isPointerEvent(event) || isMouseEvent(event)) {
      // Watch for multiple subsequent deltas; this might occur for tiny cursor movements.
      // In this case, Panel sizes might not change–
      // but updating cursor in this scenario would cause a flicker.
      if (prevDeltaRef.value != delta) {
        prevDeltaRef.value = delta;

        if (!layoutChanged && delta !== 0) {
          // If the pointer has moved too far to resize the panel any further, note this so we can update the cursor.
          // This mimics VS Code behavior.
          if (isHorizontal) {
            reportConstraintsViolation(
              dragHandleId,
              delta < 0 ? EXCEEDED_HORIZONTAL_MIN : EXCEEDED_HORIZONTAL_MAX
            );
          } else {
            reportConstraintsViolation(
              dragHandleId,
              delta < 0 ? EXCEEDED_VERTICAL_MIN : EXCEEDED_VERTICAL_MAX
            );
          }
        } else {
          reportConstraintsViolation(dragHandleId, 0);
        }
      }
    }

    if (layoutChanged) {
      layout.value = nextLayout;

      if (props.onLayout) {
        props.onLayout(nextLayout);
      }

      emit('layout', nextLayout);
    }
  };
};

// 判断事件类型的辅助函数
function isKeyDown(event: ResizeEvent): event is KeyboardEvent {
  return event.type === 'keydown';
}

function isPointerEvent(event: ResizeEvent): event is PointerEvent {
  return event.type.startsWith('pointer');
}

function isMouseEvent(event: ResizeEvent): event is MouseEvent {
  return event.type.startsWith('mouse');
}

// React版本的startDragging实现
const startDragging = (dragHandleId: string, event: ResizeEvent) => {
  if (!panelGroupElementRef.value) {
    return;
  }

  const handleElement = panelGroupElementRef.value.querySelector(
    `[data-panel-resize-handle-id="${dragHandleId}"]`
  ) as HTMLElement;
  
  if (!handleElement) {
    console.error(`Drag handle element not found for id "${dragHandleId}"`);
    return;
  }

  const initialCursorPosition = getResizeEventCursorPosition(
    props.direction,
    event
  );

  dragState.value = {
    dragHandleId,
    dragHandleRect: handleElement.getBoundingClientRect(),
    initialCursorPosition,
    initialLayout: [...layout.value],
  };
};

const stopDragging = () => {
  dragState.value = null;
};

// 创建上下文
const context: PanelGroupContext = reactive({
  collapsePanel: (panelData: PanelData) => {
    console.log('collapsePanel', panelData);
  },
  get direction() { return props.direction; },
  get dragState() { return dragState.value; },
  expandPanel: (panelData: PanelData, minSizeOverride?: number) => {
    console.log('expandPanel', panelData, minSizeOverride);
  },
  getPanelSize: (panelData: PanelData) => {
    const index = panelDataArray.value.findIndex(pd => pd.id === panelData.id);
    return layout.value[index] || 0;
  },
  getPanelStyle: (panelData: PanelData, defaultSize?: number) => {
    const index = panelDataArray.value.findIndex(pd => pd.id === panelData.id);
    return computePanelFlexBoxStyle({
      defaultSize,
      dragState: dragState.value,
      layout: layout.value,
      panelData: panelDataArray.value,
      panelIndex: index,
    });
  },
  groupId,
  isPanelCollapsed: (panelData: PanelData) => {
    return false;
  },
  isPanelExpanded: (panelData: PanelData) => {
    return !context.isPanelCollapsed(panelData);
  },
  reevaluatePanelConstraints: (panelData: PanelData, prevConstraints: PanelConstraints) => {
    console.log('reevaluatePanelConstraints', panelData, prevConstraints);
  },
  registerPanel: (panelData: PanelData) => {
    panelDataArray.value.push(panelData);
    panelDataArray.value.sort((panelA, panelB) => {
      const orderA = panelA.order;
      const orderB = panelB.order;
      if (orderA == null && orderB == null) {
        return 0;
      } else if (orderA == null) {
        return -1;
      } else if (orderB == null) {
        return 1;
      } else {
        return orderA - orderB;
      }
    });

    // 重新计算布局
    const unsafeLayout = calculateUnsafeDefaultLayout({
      panelDataArray: panelDataArray.value,
    });

    const nextLayout = validatePanelGroupLayout({
      layout: unsafeLayout,
      panelConstraints: panelDataArray.value.map(
        (panelData) => panelData.constraints
      ),
    });

    if (!fuzzyLayoutsEqual(layout.value, nextLayout)) {
      layout.value = nextLayout;
      
      if (props.onLayout) {
        props.onLayout(nextLayout);
      }
      
      emit('layout', nextLayout);
    }
  },
  registerResizeHandle,
  resizePanel: (panelData: PanelData, size: number) => {
    const index = panelDataArray.value.findIndex(pd => pd.id === panelData.id);
    if (index !== -1) {
      layout.value[index] = size;
    }
  },
  startDragging,
  stopDragging,
  unregisterPanel: (panelData: PanelData) => {
    const index = panelDataArray.value.findIndex(pd => pd.id === panelData.id);
    if (index !== -1) {
      panelDataArray.value.splice(index, 1);
      layout.value.splice(index, 1);
      
      // 重新分配剩余空间
      if (panelDataArray.value.length > 0) {
        const totalSize = layout.value.reduce((sum, size) => sum + size, 0);
        if (totalSize < 100) {
          const extraPerPanel = (100 - totalSize) / layout.value.length;
          layout.value = layout.value.map(size => size + extraPerPanel);
        }
      }
      
      if (props.onLayout) {
        props.onLayout(layout.value);
      }
      
      emit('layout', layout.value);
    }
  },
  get panelGroupElement() {
    return panelGroupElementRef.value || null;
  },
});

provide(PanelGroupContextKey, context);
</script> 