<template>
  <div class="example-page">
    <div class="example-header">
      <h2>水平布局示例</h2>
      <p>这是一个3列水平布局的 <code>PanelGroup</code>。点击并拖拽面板之间的分隔线来调整大小。</p>
      <p>也可以使用方向键来调整面板大小。这些面板使用 <code>minSize</code> 属性来防止它们被调整得过小。</p>
    </div>
    
    <div class="example-container">
      <PanelGroup 
        class="panel-group"
        direction="horizontal"
        @layout="onLayout"
      >
        <Panel 
          class="panel left-panel"
          :default-size="30" 
          :min-size="20"
        >
          <div class="panel-content">
            <h3>左侧面板</h3>
            <p>最小尺寸: 20%</p>
            <p>默认尺寸: 30%</p>
            <p>当前尺寸: {{ Math.round(layout[0] || 0) }}%</p>
          </div>
        </Panel>
        
        <PanelResizeHandle id="handle-0" class="resize-handle" />
        
        <Panel 
          class="panel middle-panel"
          :min-size="30"
        >
          <div class="panel-content">
            <h3>中间面板</h3>
            <p>最小尺寸: 30%</p>
            <p>当前尺寸: {{ Math.round(layout[1] || 0) }}%</p>
          </div>
        </Panel>
        
        <PanelResizeHandle id="handle-1" class="resize-handle" />
        
        <Panel 
          class="panel right-panel"
          :default-size="30" 
          :min-size="20"
        >
          <div class="panel-content">
            <h3>右侧面板</h3>
            <p>最小尺寸: 20%</p>
            <p>默认尺寸: 30%</p>
            <p>当前尺寸: {{ Math.round(layout[2] || 0) }}%</p>
          </div>
        </Panel>
      </PanelGroup>
    </div>
    
    <div class="code-section">
      <h3>代码示例</h3>
      <pre><code>{{ codeExample }}</code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import PanelGroup from '../../../../vue-resizable-panels/src/components/PanelGroup.vue';
import Panel from '../../../../vue-resizable-panels/src/components/Panel.vue';
import PanelResizeHandle from '../../../../vue-resizable-panels/src/components/PanelResizeHandle.vue';

const layout = ref<number[]>([30, 40, 30]);

const onLayout = (newLayout: number[]) => {
  layout.value = newLayout;
};

const codeExample = `
<PanelGroup direction="horizontal">
  <Panel :defaultSize="30" :minSize="20">
    左侧面板
  </Panel>
  <PanelResizeHandle />
  <Panel :minSize="30">
    中间面板
  </Panel>
  <PanelResizeHandle />
  <Panel :defaultSize="30" :minSize="20">
    右侧面板
  </Panel>
</PanelGroup>
`;
</script>

<style scoped>
.example-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

.example-header {
  margin-bottom: 1rem;
}

.example-header h2 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.example-header p {
  color: #7f8c8d;
  line-height: 1.6;
  margin-bottom: 0.5rem;
}

.example-header code {
  background: #f1f3f4;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
}

.example-container {
  flex: 1;
  min-height: 400px;
  margin-bottom: 2rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.panel-group {
  height: 100%;
}

.panel {
  background: #f8f9fa;
  border-right: 1px solid #e9ecef;
}

.panel:last-child {
  border-right: none;
}

.left-panel {
  border-left: 4px solid #007bff;
}

.middle-panel {
  background: #e3f2fd;
  border-left: 4px solid #2196F3;
}

.right-panel {
  background: #f1f8e9;
  border-left: 4px solid #4caf50;
}

.panel-content {
  padding: 1rem;
  height: 100%;
}

.panel-content h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.panel-content p {
  margin-bottom: 0.5rem;
  color: #6c757d;
}

.resize-handle {
  background: #dee2e6;
  position: relative;
  width: 8px;
  cursor: col-resize;
  transition: background-color 0.2s;
}

.resize-handle:hover {
  background: #007bff;
}

.resize-handle::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 3px;
  height: 30px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 2px;
}

.code-section {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
}

.code-section h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.code-section pre {
  background: #2d3748;
  color: #e2e8f0;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
}

.code-section code {
  font-size: 0.9rem;
  line-height: 1.4;
}
</style> 