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
    @pointerdown="handlePointerDown"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed, inject, ref, onMounted, onUnmounted, watch } from 'vue';
import { PanelGroupContextKey } from '../PanelGroupContext';
import type { ResizeEvent, ResizeHandler } from '../types';
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
  registerResizeHandle,
  startDragging,
  stopDragging,
} = context;

const elementRef = ref<HTMLElement>();
const resizeHandleId = useUniqueId(props.id);
const resizeHandler = ref<ResizeHandler | null>(null);
const isFocused = ref(false);

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
  
  console.log('Mouse down on resize handle:', resizeHandleId);
  event.preventDefault();
  
  if (resizeHandler.value) {
    resizeHandler.value(event);
  }
  
  emit('pointerDown');
};

const handlePointerDown = (event: PointerEvent) => {
  if (props.disabled) return;
  
  console.log('Pointer down on resize handle:', resizeHandleId);
  event.preventDefault();
  
  if (resizeHandler.value) {
    resizeHandler.value(event);
  }
  
  emit('pointerDown');
};

watch(
  () => props.disabled,
  (disabled) => {
    if (disabled) {
      resizeHandler.value = null;
    } else {
      const handler = registerResizeHandle(resizeHandleId);
      resizeHandler.value = handler;
    }
  }
);

onMounted(() => {
  console.log('PanelResizeHandle mounted:', resizeHandleId);
  if (!props.disabled) {
    const handler = registerResizeHandle(resizeHandleId);
    resizeHandler.value = handler;
  }
});

onUnmounted(() => {
  resizeHandler.value = null;
});
</script> 