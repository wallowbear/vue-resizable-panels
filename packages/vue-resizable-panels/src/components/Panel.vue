<template>
  <component
    :is="tagName"
    :class="className"
    :style="panelStyle"
    :data-panel="true"
    :data-panel-id="panelId"
    :data-panel-size="size"
    :data-panel-collapsible="collapsible || undefined"
    :data-panel-collapsed="isCollapsed || undefined"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, watch, ref } from 'vue';
import { PanelGroupContextKey } from '../PanelGroupContext';
import type { PanelProps, PanelData, ImperativePanelHandle } from '../Panel';
import { useUniqueId } from '../composables/useUniqueId';

interface Props extends PanelProps {}

const props = withDefaults(defineProps<Props>(), {
  tagName: 'div',
  className: '',
  collapsible: false,
  collapsedSize: 0,
});

const emit = defineEmits<{
  collapse: [];
  expand: [];
  resize: [size: number, prevSize: number | undefined];
}>();

const context = inject(PanelGroupContextKey);
if (!context) {
  throw new Error('Panel components must be rendered within a PanelGroup container');
}

const {
  collapsePanel,
  expandPanel,
  getPanelSize,
  getPanelStyle,
  groupId,
  isPanelCollapsed,
  reevaluatePanelConstraints,
  registerPanel,
  resizePanel,
  unregisterPanel,
} = context;

const panelId = useUniqueId(props.id);

const panelData = ref<PanelData>({
  callbacks: {
    onCollapse: () => emit('collapse'),
    onExpand: () => emit('expand'), 
    onResize: (size: number, prevSize: number | undefined) => emit('resize', size, prevSize),
  },
  constraints: {
    collapsedSize: props.collapsedSize,
    collapsible: props.collapsible,
    defaultSize: props.defaultSize,
    maxSize: props.maxSize,
    minSize: props.minSize,
  },
  id: panelId,
  idIsFromProps: props.id !== undefined,
  order: props.order,
});

const size = computed(() => {
  const panelSize = getPanelSize(panelData.value);
  console.log(`Panel ${panelId} size:`, panelSize);
  return panelSize;
});

const isCollapsed = computed(() => isPanelCollapsed(panelData.value));

const panelStyle = computed(() => {
  const baseStyle = getPanelStyle(panelData.value, props.defaultSize);
  console.log(`Panel ${panelId} style:`, baseStyle);
  return {
    ...baseStyle,
    ...props.style,
  };
});

// Watch for constraint changes
watch(
  () => ({
    collapsedSize: props.collapsedSize,
    collapsible: props.collapsible,
    maxSize: props.maxSize,
    minSize: props.minSize,
  }),
  (newConstraints, oldConstraints) => {
    const prevConstraints = { ...panelData.value.constraints };
    
    panelData.value.constraints.collapsedSize = newConstraints.collapsedSize;
    panelData.value.constraints.collapsible = newConstraints.collapsible;
    panelData.value.constraints.maxSize = newConstraints.maxSize;
    panelData.value.constraints.minSize = newConstraints.minSize;

    if (
      prevConstraints.collapsedSize !== newConstraints.collapsedSize ||
      prevConstraints.collapsible !== newConstraints.collapsible ||
      prevConstraints.maxSize !== newConstraints.maxSize ||
      prevConstraints.minSize !== newConstraints.minSize
    ) {
      reevaluatePanelConstraints(panelData.value, prevConstraints);
    }
  },
  { deep: true }
);

onMounted(() => {
  registerPanel(panelData.value);
});

onUnmounted(() => {
  unregisterPanel(panelData.value);
});

// 暴露命令式API
const collapse = () => collapsePanel(panelData.value);
const expand = (minSize?: number) => expandPanel(panelData.value, minSize);
const getId = () => panelId;
const getSize = () => getPanelSize(panelData.value);
const isExpanded = () => !isPanelCollapsed(panelData.value);
const resize = (newSize: number) => resizePanel(panelData.value, newSize);

defineExpose<ImperativePanelHandle>({
  collapse,
  expand,
  getId,
  getSize,
  isCollapsed: () => isCollapsed.value,
  isExpanded,
  resize,
});
</script> 