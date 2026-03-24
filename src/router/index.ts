import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { guest: true },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { guest: true },
  },
  {
    path: '/',
    component: () => import('@/layouts/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'dashboard', component: () => import('@/views/DashboardView.vue') },
      { path: 'checklists', name: 'checklists', component: () => import('@/views/ChecklistsView.vue') },
      { path: 'checklists/:id/complete', name: 'checklist-complete', component: () => import('@/views/ChecklistCompleteView.vue'), props: true },
      { path: 'checklists/history', name: 'checklist-history', component: () => import('@/views/ChecklistHistoryView.vue') },
      { path: 'temperature', name: 'temperature', component: () => import('@/views/TemperatureView.vue') },
      { path: 'deviations', name: 'deviations', component: () => import('@/views/DeviationsView.vue') },
      { path: 'deviations/new', name: 'deviation-new', component: () => import('@/views/DeviationCreateView.vue') },
      { path: 'deviations/:id', name: 'deviation-detail', component: () => import('@/views/DeviationDetailView.vue'), props: true },
      { path: 'notifications', name: 'notifications', component: () => import('@/views/NotificationsView.vue') },
      { path: 'settings', name: 'settings', component: () => import('@/views/SettingsView.vue') },
      {
        path: 'admin/users',
        name: 'admin-users',
        component: () => import('@/views/AdminUsersView.vue'),
        meta: { requiresAdmin: true },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (!auth.isAuthenticated) {
    await auth.checkAuth()
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.guest && auth.isAuthenticated) {
    return { name: 'dashboard' }
  }

  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return { name: 'dashboard' }
  }
})

export default router
