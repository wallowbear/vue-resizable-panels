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
import { computed, provide, reactive, ref } from 'vue';
import type { Direction, ResizeEvent } from '../types';
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
// 移除未使用的导入

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

// 移除registerResizeHandle - 不再需要

// 移除未使用的辅助函数

// 正确的startDragging实现
const startDragging = (dragHandleId: string, event: ResizeEvent) => {
  console.log('Starting drag for handle:', dragHandleId);
  
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
  
  console.log('Drag state set:', dragState.value);
  
  // 添加全局事件监听器
  addGlobalEventListeners();
};

const stopDragging = () => {
  dragState.value = null;
};

const handleMouseMove = (event: MouseEvent) => {
  if (!dragState.value || !panelGroupElementRef.value) {
    return;
  }

  console.log('Mouse move during drag');

  const { initialCursorPosition, initialLayout, dragHandleId } = dragState.value;
  
  const deltaPercentage = calculateDeltaPercentage(
    { clientX: event.clientX, clientY: event.clientY },
    props.direction,
    initialCursorPosition,
    panelGroupElementRef.value
  );

  console.log('Delta percentage:', deltaPercentage);

  // 根据拖拽的handle确定相邻面板
  const pivotIndices = determinePivotIndices(
    groupId,
    dragHandleId,
    panelGroupElementRef.value
  );
  
  console.log('Pivot indices:', pivotIndices);
  
  // 如果无法找到有效的pivot indices，停止处理
  if (pivotIndices[0] === -1 || pivotIndices[1] === -1) {
    console.warn('无法找到有效的panel索引，停止拖拽处理');
    return;
  }
  
  const nextLayout = adjustLayoutByDelta({
    delta: deltaPercentage,
    initialLayout,
    panelConstraints: panelDataArray.value.map(p => p.constraints),
    pivotIndices,
    prevLayout: layout.value,
    trigger: "mouse-or-touch",
  });

  console.log('Next layout:', nextLayout);

  if (!fuzzyLayoutsEqual(layout.value, nextLayout)) {
    layout.value = nextLayout;
    
    if (props.onLayout) {
      props.onLayout(nextLayout);
    }
    
    emit('layout', nextLayout);
  }
};

// 添加全局事件监听
const addGlobalEventListeners = () => {
  console.log('🎯 Adding global event listeners');
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', stopDraggingAndCleanup);
  console.log('✅ Global event listeners added');
};

const removeGlobalEventListeners = () => {
  console.log('🧹 Removing global event listeners');
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', stopDraggingAndCleanup);
  console.log('✅ Global event listeners removed');
};

const stopDraggingAndCleanup = () => {
  console.log('🛑 Stopping drag and cleanup');
  stopDragging();
  removeGlobalEventListeners();
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
  handleResizeDrag: (dragHandleId: string, event: MouseEvent) => {
    // 如果没有拖动状态，先初始化
    if (!dragState.value) {
      startDragging(dragHandleId, event);
      return;
    }
    
    // 使用现有的handleMouseMove逻辑
    handleMouseMove(event);
  },
  isPanelCollapsed: (_panelData: PanelData) => {
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

  resizePanel: (panelData: PanelData, size: number) => {
    const index = panelDataArray.value.findIndex(pd => pd.id === panelData.id);
    if (index !== -1) {
      layout.value[index] = size;
    }
  },
  startDragging,
  stopDragging: stopDraggingAndCleanup,
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