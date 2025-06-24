<template>
  <component
    :is="tagName"
    ref="elementRef"
    :class="className"
    :style="handleStyle"
    :tabindex="disabled ? undefined : tabIndex"
    :data-panel-resize-handle="true"
    :data-panel-resize-handle-id="resizeHandleId"
    :data-panel-resize-handle-enabled="!disabled || undefined"
    :data-panel-resize-handle-disabled="disabled || undefined"
    :data-panel-group-direction="direction"
    :data-panel-group-id="groupId"
    role="separator"
    @blur="handleBlur"
    @focus="handleFocus"
    @mousedown="handleMouseDown"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed, inject, ref, onMounted, onUnmounted } from 'vue';
import { PanelGroupContextKey } from '../PanelGroupContext';
// 移除未使用的ResizeEvent导入
import { useUniqueId } from '../composables/useUniqueId';

export interface PanelResizeHandleProps {
  id?: string | null;
  className?: string;
  disabled?: boolean;
  style?: Record<string, any>;
  tabIndex?: number;
  tagName?: string;
}

const props = withDefaults(defineProps<PanelResizeHandleProps>(), {
  className: '',
  disabled: false,
  style: () => ({}),
  tabIndex: 0,
  tagName: 'div',
});

const emit = defineEmits<{
  blur: [];
  focus: [];
  dragging: [isDragging: boolean];
  pointerDown: [];
  pointerUp: [];
  click: [];
}>();

const context = inject(PanelGroupContextKey);
if (!context) {
  throw new Error('PanelResizeHandle components must be rendered within a PanelGroup container');
}

const {
  direction,
  groupId,
} = context;

const elementRef = ref<HTMLElement>();
const resizeHandleId = useUniqueId(props.id);
const isFocused = ref(false);
const isDragging = ref(false);

const handleStyle = computed(() => {
  return {
    touchAction: 'none',
    userSelect: 'none',
    cursor: direction === 'horizontal' ? 'col-resize' : 'row-resize',
    ...props.style,
  };
});

const handleBlur = () => {
  isFocused.value = false;
  emit('blur');
};

const handleFocus = () => {
  isFocused.value = true;
  emit('focus');
};

const handleMouseDown = (event: MouseEvent) => {
  if (props.disabled) return;
  
  console.log('🖱️ Mouse down on resize handle:', resizeHandleId);
  event.preventDefault();
  
  isDragging.value = true;
  
  // 初始化拖动状态
  if (context.startDragging) {
    context.startDragging(resizeHandleId, event);
  }
  
  // 立即添加全局事件监听器
  document.addEventListener('mousemove', handleMouseMove, { passive: false });
  document.addEventListener('mouseup', handleMouseUp, { passive: false });
  
  console.log('🎯 Started dragging, added global listeners');
  
  emit('pointerDown');
  emit('dragging', true);
};

const handleMouseMove = (event: MouseEvent) => {
  if (!isDragging.value) return;
  
  console.log('🖱️ Mouse move during drag');
  event.preventDefault();
  
  // 调用context的拖动处理逻辑
  if (context.handleResizeDrag) {
    context.handleResizeDrag(resizeHandleId, event);
  }
};

const handleMouseUp = (event: MouseEvent) => {
  if (!isDragging.value) return;
  
  console.log('🖱️ Mouse up, ending drag');
  event.preventDefault();
  
  isDragging.value = false;
  
  // 移除全局事件监听器
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
  
  console.log('🧹 Ended dragging, removed global listeners');
  
  emit('pointerUp');
  emit('dragging', false);
};

onMounted(() => {
  console.log('PanelResizeHandle mounted:', resizeHandleId);
});

onUnmounted(() => {
  // 确保清理事件监听器
  if (isDragging.value) {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }
});
</script> 