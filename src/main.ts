import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createRouter, createWebHashHistory } from 'vue-router';
import { registerSW } from 'virtual:pwa-register';
import App from './App.vue';
import './style.css';

const preloadRecoveryKey = 'trajectory-showcase:preload-recovery';

window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  if (window.sessionStorage.getItem(preloadRecoveryKey)) return;
  window.sessionStorage.setItem(preloadRecoveryKey, '1');
  window.location.reload();
});

registerSW({ immediate: true });

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, top: 88, behavior: 'smooth' };
    return { top: 0 };
  },
  routes: [
    { path: '/', component: () => import('./views/TodayView.vue'), meta: { title: 'Сегодня' } },
    {
      path: '/week',
      component: () => import('./views/WeekView.vue'),
      props: (route) => ({ initialWeek: typeof route.query.week === 'string' ? route.query.week : '' }),
      meta: { title: 'Неделя' },
    },
    { path: '/trends', component: () => import('./views/TrendsView.vue'), meta: { title: 'Тренды' } },
    { path: '/:pathMatch(.*)*', component: () => import('./views/NotFoundView.vue'), meta: { title: 'Страница не найдена' } },
  ],
});

router.afterEach((to) => {
  document.title = `${String(to.meta.title)} · Trajectory`;
});

router.isReady().then(() => window.sessionStorage.removeItem(preloadRecoveryKey));

createApp(App).use(createPinia()).use(router).mount('#app');
