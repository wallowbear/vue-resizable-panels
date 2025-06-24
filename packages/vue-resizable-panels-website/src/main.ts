import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';

// 导入示例组件
import Home from './routes/Home/index.vue';
import HorizontalExample from './routes/examples/Horizontal.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/examples/horizontal', component: HorizontalExample },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const app = createApp(App);
app.use(router);
app.mount('#app'); 