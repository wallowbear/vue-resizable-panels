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
    :data-panel-resize-handle-state="resizeHandlerState"
    role="separator"
    @blur="handleBlur"
    @focus="handleFocus"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed, inject, ref, onMounted, onUnmounted, watch } from 'vue';
import { PanelGroupContextKey } from '../PanelGroupContext';
import type { ResizeEvent } from '../types';
import { useUniqueId } from '../composables/useUniqueId';
import { 
  registerResizeHandle,
  type ResizeHandlerAction,
  type SetResizeHandlerState,
  type PointerHitAreaMargins
} from '../utils/panelResizeHandleRegistry';

export interface PanelResizeHandleProps {
  id?: string | null;
  className?: string;
  disabled?: boolean;
  style?: Record<string, any>;
  tabIndex?: number;
  tagName?: string;
  hitAreaMargins?: PointerHitAreaMargins;
}

const props = withDefaults(defineProps<PanelResizeHandleProps>(), {
  className: '',
  disabled: false,
  style: () => ({}),
  tabIndex: 0,
  tagName: 'div',
  hitAreaMargins: () => ({ coarse: 15, fine: 5 }),
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
  startDragging,
  stopDragging,
} = context;

const elementRef = ref<HTMLElement>();
const resizeHandleId = useUniqueId(props.id);
const resizeHandlerState = ref<'inactive' | 'hover' | 'drag'>('inactive');
const isFocused = ref(false);
const unregisterResizeHandle = ref<(() => void) | null>(null);

const handleStyle = computed(() => {
  return {
    touchAction: 'none',
    userSelect: 'none',
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

// React版本的setResizeHandlerState实现
const setResizeHandlerState: SetResizeHandlerState = (
  action: ResizeHandlerAction,
  isActive: boolean,
  event: ResizeEvent | null
) => {
  if (!isActive) {
    resizeHandlerState.value = 'inactive';
    return;
  }

  let didMove = false;

  switch (action) {
    case 'down': {
      resizeHandlerState.value = 'drag';
      didMove = false;

      if (event) {
        startDragging(resizeHandleId, event);
      }

      emit('dragging', true);
      emit('pointerDown');
      break;
    }
    case 'move': {
      didMove = true;

      if (resizeHandlerState.value !== 'drag') {
        resizeHandlerState.value = 'hover';
      }
      break;
    }
    case 'up': {
      resizeHandlerState.value = 'hover';

      stopDragging();

      emit('dragging', false);
      emit('pointerUp');

      if (!didMove) {
        emit('click');
      }
      break;
    }
  }
};

// 注册和注销handle
const registerHandle = () => {
  if (props.disabled || !elementRef.value) {
    return;
  }

  const unregister = registerResizeHandle(
    resizeHandleId,
    elementRef.value,
    direction,
    props.hitAreaMargins,
    setResizeHandlerState
  );

  unregisterResizeHandle.value = unregister;
};

const unregisterHandle = () => {
  if (unregisterResizeHandle.value) {
    unregisterResizeHandle.value();
    unregisterResizeHandle.value = null;
  }
};

watch(
  () => props.disabled,
  (disabled) => {
    if (disabled) {
      unregisterHandle();
    } else {
      registerHandle();
    }
  }
);

onMounted(() => {
  registerHandle();
});

onUnmounted(() => {
  unregisterHandle();
});
</script> 