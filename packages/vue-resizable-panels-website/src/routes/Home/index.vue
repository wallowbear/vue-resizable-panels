<template>
  <div class="home">
    <div class="hero">
      <h1>Vue Resizable Panels</h1>
      <p>基于Vue 3的可调整大小面板组件库</p>
      <p>完全移植自React版本，保持相同的API和功能特性</p>
    </div>
    
    <div class="features">
      <div class="feature-card">
        <h3>🎯 完整功能</h3>
        <p>支持拖拽调整、键盘操作、面板折叠等所有特性</p>
      </div>
      
      <div class="feature-card">
        <h3>📱 多设备支持</h3>
        <p>完美支持桌面端和移动端的触摸操作</p>
      </div>
      
      <div class="feature-card">
        <h3>🎨 高度可定制</h3>
        <p>支持自定义样式、尺寸约束和布局持久化</p>
      </div>
      
      <div class="feature-card">
        <h3>⚡ 高性能</h3>
        <p>基于Vue 3 Composition API，提供出色的性能表现</p>
      </div>
    </div>
    
    <div class="examples-nav">
      <h2>示例导航</h2>
      <div class="example-links">
        <router-link to="/examples/horizontal" class="example-link">
          <h4>水平布局</h4>
          <p>基础的水平方向面板布局示例</p>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.hero {
  text-align: center;
  margin-bottom: 4rem;
}

.hero h1 {
  font-size: 3rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.2rem;
  color: #7f8c8d;
  margin-bottom: 0.5rem;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.feature-card h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.feature-card p {
  color: #7f8c8d;
  line-height: 1.6;
}

.examples-nav h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #2c3e50;
}

.example-links {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.example-link {
  display: block;
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s, box-shadow 0.2s;
}

.example-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.example-link h4 {
  color: #007bff;
  margin-bottom: 0.5rem;
}

.example-link p {
  color: #7f8c8d;
  margin: 0;
}
</style> 