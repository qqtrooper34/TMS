import { createRouter, createWebHistory } from 'vue-router';
import OrdersList from '../components/OrdersList.vue';  // Импортируй компонент
import tracking from '../components/tracking.vue';

// Определение маршрутов
const routes = [
  { path: '/', redirect: '/plan' },
  { path: '/plan', name: 'plan', component: OrdersList },
  { path: '/fact', name: 'fact', component: tracking },
];

// Создание экземпляра роутера
const router = createRouter({
  history: createWebHistory(),  // Используй createWebHistory() для Vue 3
  routes,
});

export default router;
