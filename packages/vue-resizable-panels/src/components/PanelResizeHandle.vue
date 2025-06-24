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
import type { ResizeHandler } from '../types';
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
}>();

const context = inject(PanelGroupContextKey);
if (!context) {
  throw new Error('PanelResizeHandle components must be rendered within a PanelGroup container');
}

const {
  direction,
  groupId,
  registerResizeHandle: registerResizeHandleWithParentGroup,
  startDragging,
  stopDragging,
  panelGroupElement,
} = context;

const elementRef = ref<HTMLElement>();
const resizeHandleId = useUniqueId(props.id);
const resizeHandler = ref<ResizeHandler | null>(null);
const isFocused = ref(false);

const handleStyle = computed(() => {
  return {
    ...props.style,
    cursor: direction === 'horizontal' ? 'col-resize' : 'row-resize',
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
  if (props.disabled || !resizeHandler.value) return;
  
  event.preventDefault();
  console.log('Mouse down on resize handle:', resizeHandleId);
  resizeHandler.value(event);
  emit('pointerDown');
};

const handlePointerDown = (event: PointerEvent) => {
  if (props.disabled || !resizeHandler.value) return;
  
  event.preventDefault();
  console.log('Pointer down on resize handle:', resizeHandleId);
  resizeHandler.value(event);
  emit('pointerDown');
};

watch(
  () => props.disabled,
  (disabled) => {
    if (disabled) {
      resizeHandler.value = null;
    } else {
      const handler = registerResizeHandleWithParentGroup(resizeHandleId);
      resizeHandler.value = handler;
    }
  },
  { immediate: true }
);

onMounted(() => {
  if (!props.disabled) {
    const handler = registerResizeHandleWithParentGroup(resizeHandleId);
    resizeHandler.value = handler;
  }
});

onUnmounted(() => {
  resizeHandler.value = null;
});
</script> 