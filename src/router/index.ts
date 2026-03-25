/**
 * Vue Router configuration.
 *
 * Route meta fields:
 * - `guest` - Only accessible to unauthenticated users (redirects to dashboard if logged in).
 * - `requiresAuth` - Requires an authenticated session; redirects to login otherwise.
 * - `requiresAdmin` - Requires the ADMIN role; redirects to dashboard otherwise.
 * - `requiresManageAccess` - Requires ADMIN or MANAGER role; redirects to dashboard otherwise.
 * - `public` - Accessible to everyone regardless of auth state.
 * @module
 */
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'landing',
    component: () => import('@/views/LandingView.vue'),
    meta: { public: true },
  },
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
    path: '/verify-email',
    name: 'verify-email',
    component: () => import('@/views/VerifyEmailView.vue'),
    meta: { public: true },
  },
  {
    path: '/app',
    component: () => import('@/layouts/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'dashboard', component: () => import('@/views/DashboardView.vue') },
      { path: 'routines', name: 'routines', component: () => import('@/views/RoutinesListView.vue') },
      { path: 'routines/new', name: 'routine-new', component: () => import('@/views/RoutineCreateView.vue'), meta: { requiresManageAccess: true } },
      { path: 'routines/:id', name: 'routine-detail', component: () => import('@/views/RoutineDetailView.vue'), props: true },
      { path: 'routines/:id/edit', name: 'routine-edit', component: () => import('@/views/RoutineEditView.vue'), meta: { requiresManageAccess: true }, props: true },
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
        path: 'admin',
        name: 'admin-dashboard',
        component: () => import('@/views/AdminDashboardView.vue'),
        meta: { requiresAdmin: true },
      },
      {
        path: 'admin/users',
        name: 'admin-users',
        component: () => import('@/views/AdminUsersView.vue'),
        meta: { requiresManageAccess: true },
      },
    ],
  },
]

type AuthGuardStore = {
  isAuthenticated: boolean
  isAdmin: boolean
  hasManageAccess: boolean
  checkAuth: () => Promise<void>
}

/**
 * Global navigation guard.
 * Checks auth status on first navigation, then enforces route meta rules.
 */
export async function applyRouteGuard(
  to: Pick<(typeof routes)[number], 'meta'> & {
    fullPath: string
    matched: Array<{ meta: Record<string, unknown> }>
  },
  auth: AuthGuardStore,
) {
  if (!auth.isAuthenticated) {
    await auth.checkAuth()
  }

  if (to.meta?.public) {
    return
  }

  if (to.meta?.guest && auth.isAuthenticated) {
    return { name: 'dashboard' }
  }

  if (to.matched.some((r) => r.meta.requiresAuth) && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.matched.some((r) => r.meta.requiresAdmin) && !auth.isAdmin) {
    return { name: 'dashboard' }
  }

  if (to.matched.some((r) => r.meta.requiresManageAccess) && !auth.hasManageAccess) {
    return { name: 'dashboard' }
  }
}

export function createAppRouter() {
  const router = createRouter({
    history: createWebHistory(),
    routes,
  })

  router.beforeEach((to) => applyRouteGuard(to, useAuthStore()))

  return router
}

const router = createAppRouter()

export default router
