<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-brand">
        <h1>Vue Resizable Panels</h1>
      </div>
      <div class="nav-links">
        <router-link to="/">首页</router-link>
        <router-link to="/examples/horizontal">水平布局</router-link>
      </div>
    </nav>
    
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.nav-brand h1 {
  margin: 0;
  color: #333;
}

.nav-links {
  display: flex;
  gap: 1rem;
}

.nav-links a {
  text-decoration: none;
  color: #007bff;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  background-color: #007bff;
  color: white;
}

.main-content {
  height: calc(100vh - 80px);
  overflow: hidden;
}

#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  height: 100vh;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
}
</style> 