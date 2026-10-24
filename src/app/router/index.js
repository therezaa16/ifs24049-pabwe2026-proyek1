import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/features/auth/application/auth.store.js';
import { APP_TITLE } from '@/core/config/env.js';

export const routes = [
  { path: '/masuk', alias: '/auth/login', name: 'login', component: () => import('@/features/auth/presentation/LoginView.vue'), meta: { guestOnly: true, title: 'Masuk' } },
  { path: '/daftar', alias: '/auth/register', name: 'register', component: () => import('@/features/auth/presentation/RegisterView.vue'), meta: { guestOnly: true, title: 'Daftar' } },
  {
    path: '/',
    component: () => import('../layouts/AppShell.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'dashboard', component: () => import('@/features/dashboard/presentation/DashboardView.vue'), meta: { title: 'Dashboard' } },
      { path: 'transaksi', name: 'transactions', component: () => import('@/features/transactions/presentation/TransactionsView.vue'), meta: { title: 'Transaksi' } },
      { path: 'misi', name: 'missions', component: () => import('@/features/study-missions/presentation/StudyMissionsView.vue'), meta: { title: 'Misi Belajar' } },
      { path: 'profil', name: 'profile', component: () => import('@/features/profile/presentation/ProfileView.vue'), meta: { title: 'Profil Saya' } }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/' }
];

export const authGuard = (to) => {
  const auth = useAuthStore();

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    const query = to.fullPath === '/' ? {} : { redirect: to.fullPath };
    return { name: 'login', query };
  }
  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'dashboard' };
  }
  return undefined;
};

export const createAppRouter = () => {
  const router = createRouter({ history: createWebHistory(), routes });
  router.beforeEach((to) => authGuard(to) ?? true);
  router.afterEach((to) => {
    const title = typeof to.meta.title === 'string' ? to.meta.title : '';
    document.title = title ? `${title} · ${APP_TITLE}` : APP_TITLE;
  });
  return router;
};
