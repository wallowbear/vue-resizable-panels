<template>
  <component
    :is="tagName"
    ref="panelGroupElementRef"
    :class="className"
    :style="groupStyle"
    :data-panel-group="true"
    :data-panel-group-id="groupId"
    :data-panel-group-direction="direction"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed, provide, ref, reactive, nextTick } from 'vue';
import { PanelGroupContextKey } from '../PanelGroupContext';
import type { PanelGroupContext, DragState, ResizeEvent } from '../PanelGroupContext';
import type { PanelData, PanelConstraints } from '../Panel';
import { useUniqueId } from '../composables/useUniqueId';
import { computePanelFlexBoxStyle } from '../utils/computePanelFlexBoxStyle';
import { adjustLayoutByDelta } from '../utils/adjustLayoutByDelta';
import { calculateDeltaPercentage } from '../utils/calculateDeltaPercentage';
import { getResizeEventCursorPosition } from '../utils/events/getResizeEventCursorPosition';
import { areEqual } from '../utils/arrays';

// 简化的pivot索引确定函数
const determinePivotIndices = (dragHandleId: string): [number, number] => {
  // 从dragHandleId解析handle的序号
  console.log('Determining pivot for handle:', dragHandleId);
  
  if (dragHandleId.includes('handle-0')) {
    return [0, 1]; // 第一个handle控制第1和第2个面板
  } else if (dragHandleId.includes('handle-1')) {
    return [1, 2]; // 第二个handle控制第2和第3个面板
  }
  
  return [0, 1]; // 默认值
};

export interface PanelGroupProps {
  id?: string | null;
  className?: string;
  direction: 'horizontal' | 'vertical';
  style?: Record<string, any>;
  tagName?: string;
  autoSaveId?: string | null;
}

const props = withDefaults(defineProps<PanelGroupProps>(), {
  className: '',
  style: () => ({}),
  tagName: 'div',
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

// 拖拽处理函数
const startDragging = (dragHandleId: string, event: ResizeEvent) => {
  const panelGroupElement = panelGroupElementRef.value;
  if (!panelGroupElement) return;

  const handleElement = panelGroupElement.querySelector(
    `[data-panel-resize-handle-id="${dragHandleId}"]`
  ) as HTMLElement;
  
  if (!handleElement) return;

  const initialCursorPosition = getResizeEventCursorPosition(props.direction, event);
  const dragHandleRect = handleElement.getBoundingClientRect();

  dragState.value = {
    dragHandleId,
    dragHandleRect,
    initialCursorPosition,
    initialLayout: [...layout.value],
  };

  console.log('Start dragging:', dragState.value);
};

const stopDragging = () => {
  console.log('Stop dragging');
  dragState.value = null;
};

const handleMouseMove = (event: MouseEvent) => {
  if (!dragState.value || !panelGroupElementRef.value) return;

  const { initialCursorPosition, initialLayout } = dragState.value;
  
  const deltaPercentage = calculateDeltaPercentage(
    event,
    props.direction,
    initialCursorPosition,
    panelGroupElementRef.value
  );

  // 根据拖拽的handle确定相邻面板
  const pivotIndices = determinePivotIndices(dragState.value.dragHandleId);
  
  const nextLayout = adjustLayoutByDelta({
    delta: deltaPercentage,
    initialLayout,
    panelConstraints: panelDataArray.value.map(p => p.constraints),
    pivotIndices,
    prevLayout: layout.value,
    trigger: "mouse-or-touch",
  });

  if (!areEqual(layout.value, nextLayout)) {
    layout.value = nextLayout;
    emit('layout', nextLayout);
  }
};

// 添加全局事件监听
const addGlobalEventListeners = () => {
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', stopDragging);
};

const removeGlobalEventListeners = () => {
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', stopDragging);
};

// 创建响应式的上下文实现
const context: PanelGroupContext = {
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
    console.log('Registering panel:', panelData.id, panelData.constraints);
    panelDataArray.value.push(panelData);
    
    // 重新计算布局
    const totalPanels = panelDataArray.value.length;
    const newLayout: number[] = [];
    let totalSize = 0;
    
    // 计算有默认大小的面板
    for (const panel of panelDataArray.value) {
      if (panel.constraints.defaultSize != null) {
        newLayout.push(panel.constraints.defaultSize);
        totalSize += panel.constraints.defaultSize;
      } else {
        newLayout.push(0); // 临时占位
      }
    }
    
    // 为没有默认大小的面板分配剩余空间
    const remainingSize = 100 - totalSize;
    const panelsWithoutDefault = newLayout.filter(size => size === 0).length;
    const defaultSizeForRest = panelsWithoutDefault > 0 ? remainingSize / panelsWithoutDefault : 0;
    
    for (let i = 0; i < newLayout.length; i++) {
      if (newLayout[i] === 0) {
        newLayout[i] = defaultSizeForRest;
      }
    }
    
    layout.value = newLayout;
    console.log('New layout after registration:', layout.value);
    console.log('Total panels:', panelDataArray.value.length);
    emit('layout', layout.value);
  },
  registerResizeHandle: (dragHandleId: string) => {
    return (event: ResizeEvent) => {
      startDragging(dragHandleId, event);
      addGlobalEventListeners();
    };
  },
  resizePanel: (panelData: PanelData, size: number) => {
    const index = panelDataArray.value.findIndex(pd => pd.id === panelData.id);
    if (index !== -1) {
      layout.value[index] = size;
    }
  },
  startDragging,
  stopDragging: () => {
    stopDragging();
    removeGlobalEventListeners();
  },
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
      
      emit('layout', layout.value);
    }
  },
  get panelGroupElement() {
    return panelGroupElementRef.value || null;
  },
};

provide(PanelGroupContextKey, reactive(context));
</script> 