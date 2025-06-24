// 导出组件（直接re-export）
export { default as Panel } from './components/Panel.vue';
export { default as PanelGroup } from './components/PanelGroup.vue';
export { default as PanelResizeHandle } from './components/PanelResizeHandle.vue';

// 导出特定类型，避免重复
export type { PanelData, PanelConstraints } from './Panel';
export type { PanelGroupContext, DragState } from './PanelGroupContext';
export type { Direction } from './types';

// 导出工具函数
export { assert } from './utils/assert';
export { areEqual } from './utils/arrays';
export { fuzzyCompareNumbers, fuzzyNumbersEqual } from './utils/numbers/fuzzyCompareNumbers'; 