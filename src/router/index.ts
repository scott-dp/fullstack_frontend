/**
 * Vue Router configuration.
 *
 * Route meta fields:
 * - `guest` - Only accessible to unauthenticated users (redirects to dashboard if logged in).
 * - `requiresAuth` - Requires an authenticated session; redirects to login otherwise.
 * - `requiresAdmin` - Requires the ADMIN role; redirects to dashboard otherwise.
 * - `requiresSuperAdmin` - Requires the SUPERADMIN role; redirects to the correct dashboard otherwise.
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
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { guest: true },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/auth/RegisterView.vue'),
    meta: { guest: true },
  },
  {
    path: '/verify-email',
    name: 'verify-email',
    component: () => import('@/views/auth/VerifyEmailView.vue'),
    meta: { public: true },
  },
  {
    path: '/admin-setup',
    name: 'admin-setup',
    component: () => import('@/views/admin/AdminSetupView.vue'),
    meta: { public: true },
  },
  {
    path: '/app',
    component: () => import('@/layouts/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'dashboard', component: () => import('@/views/dashboard/DashboardView.vue') },
      { path: 'superadmin', name: 'superadmin-dashboard', component: () => import('@/views/admin/SuperAdminDashboardView.vue'), meta: { requiresSuperAdmin: true } },
      { path: 'routines', name: 'routines', component: () => import('@/views/routines/RoutinesListView.vue') },
      { path: 'routines/new', name: 'routine-new', component: () => import('@/views/routines/RoutineCreateView.vue'), meta: { requiresManageAccess: true } },
      { path: 'routines/:id', name: 'routine-detail', component: () => import('@/views/routines/RoutineDetailView.vue'), props: true },
      { path: 'routines/:id/edit', name: 'routine-edit', component: () => import('@/views/routines/RoutineEditView.vue'), meta: { requiresManageAccess: true }, props: true },
      { path: 'checklists', name: 'checklists', component: () => import('@/views/checklists/ChecklistsView.vue') },
      { path: 'checklists/:id/complete', name: 'checklist-complete', component: () => import('@/views/checklists/ChecklistCompleteView.vue'), props: true },
      { path: 'checklists/history', name: 'checklist-history', component: () => import('@/views/checklists/ChecklistHistoryView.vue') },
      { path: 'temperature', name: 'temperature', component: () => import('@/views/temperature/TemperatureView.vue') },
      { path: 'deviations', name: 'deviations', component: () => import('@/views/deviations/DeviationsView.vue') },
      { path: 'deviations/new', name: 'deviation-new', component: () => import('@/views/deviations/DeviationCreateView.vue') },
      { path: 'deviations/:id', name: 'deviation-detail', component: () => import('@/views/deviations/DeviationDetailView.vue'), props: true },
      { path: 'dishes', name: 'dishes', component: () => import('@/views/food/DishesView.vue') },
      { path: 'dishes/new', name: 'dish-new', component: () => import('@/views/food/DishCreateEditView.vue'), meta: { requiresManageAccess: true } },
      { path: 'dishes/:id', name: 'dish-detail', component: () => import('@/views/food/DishDetailView.vue'), props: true },
      { path: 'dishes/:id/edit', name: 'dish-edit', component: () => import('@/views/food/DishCreateEditView.vue'), props: true, meta: { requiresManageAccess: true } },
      { path: 'ingredients', name: 'ingredients', component: () => import('@/views/food/IngredientsView.vue'), meta: { requiresManageAccess: true } },
      { path: 'ingredients/new', name: 'ingredient-new', component: () => import('@/views/food/IngredientCreateEditView.vue'), meta: { requiresManageAccess: true } },
      { path: 'ingredients/:id/edit', name: 'ingredient-edit', component: () => import('@/views/food/IngredientCreateEditView.vue'), props: true, meta: { requiresManageAccess: true } },
      { path: 'allergen-sheet', name: 'allergen-sheet', component: () => import('@/views/food/AllergenSheetView.vue') },
      { path: 'alcohol-incidents', name: 'alcohol-incidents', component: () => import('@/views/alcohol/AlcoholIncidentsView.vue') },
      { path: 'alcohol-incidents/new', name: 'alcohol-incident-new', component: () => import('@/views/alcohol/AlcoholIncidentCreateView.vue') },
      { path: 'alcohol-incidents/report', name: 'alcohol-incident-report', component: () => import('@/views/alcohol/AlcoholIncidentReportView.vue'), meta: { requiresManageAccess: true } },
      { path: 'alcohol-incidents/:id', name: 'alcohol-incident-detail', component: () => import('@/views/alcohol/AlcoholIncidentDetailView.vue'), props: true },
      { path: 'suppliers', name: 'suppliers', component: () => import('@/views/suppliers/SuppliersView.vue') },
      { path: 'suppliers/new', name: 'supplier-new', component: () => import('@/views/suppliers/SupplierCreateView.vue') },
      { path: 'suppliers/:id', name: 'supplier-detail', component: () => import('@/views/suppliers/SupplierDetailView.vue'), props: true },
      { path: 'deliveries', name: 'deliveries', component: () => import('@/views/deliveries/DeliveriesView.vue') },
      { path: 'deliveries/new', name: 'delivery-new', component: () => import('@/views/deliveries/DeliveryCreateView.vue') },
      { path: 'deliveries/:id', name: 'delivery-detail', component: () => import('@/views/deliveries/DeliveryDetailView.vue'), props: true },
      { path: 'traceability', name: 'traceability', component: () => import('@/views/suppliers/TraceabilitySearchView.vue') },
      { path: 'training', name: 'training-templates', component: () => import('@/views/training/TrainingTemplatesView.vue') },
      { path: 'training/new', name: 'training-new', component: () => import('@/views/training/TrainingTemplateCreateView.vue'), meta: { requiresManageAccess: true } },
      { path: 'training/templates/:id', name: 'training-detail', component: () => import('@/views/training/TrainingTemplateDetailView.vue'), props: true },
      { path: 'training/templates/:id/assign', name: 'training-assign', component: () => import('@/views/training/TrainingAssignView.vue'), meta: { requiresManageAccess: true }, props: true },
      { path: 'training/my', name: 'my-training', component: () => import('@/views/training/MyTrainingView.vue') },
      { path: 'training/report', name: 'training-report', component: () => import('@/views/training/TrainingReportView.vue'), meta: { requiresManageAccess: true } },
      { path: 'bevilling', name: 'bevilling', component: () => import('@/views/bevilling/BevillingView.vue') },
      { path: 'bevilling/new', name: 'bevilling-new', component: () => import('@/views/bevilling/BevillingEditView.vue'), meta: { requiresManageAccess: true } },
      { path: 'bevilling/:id/edit', name: 'bevilling-edit', component: () => import('@/views/bevilling/BevillingEditView.vue'), meta: { requiresManageAccess: true }, props: true },
      { path: 'bevilling/:id/conditions', name: 'bevilling-conditions', component: () => import('@/views/bevilling/BevillingConditionsView.vue'), meta: { requiresManageAccess: true }, props: true },
      { path: 'notifications', name: 'notifications', component: () => import('@/views/NotificationsView.vue') },
      { path: 'settings', name: 'settings', component: () => import('@/views/SettingsView.vue') },
      {
        path: 'admin',
        name: 'admin-dashboard',
        component: () => import('@/views/admin/AdminDashboardView.vue'),
        meta: { requiresAdmin: true },
      },
      {
        path: 'admin/users',
        name: 'admin-users',
        component: () => import('@/views/admin/AdminUsersView.vue'),
        meta: { requiresManageAccess: true },
      },
    ],
  },
]

type AuthGuardStore = {
  isAuthenticated: boolean
  isSuperAdmin: boolean
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
    return { name: auth.isSuperAdmin ? 'superadmin-dashboard' : 'dashboard' }
  }

  if (to.matched.some((r) => r.meta.requiresAuth) && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.matched.some((r) => r.meta.requiresSuperAdmin) && !auth.isSuperAdmin) {
    return { name: 'dashboard' }
  }

  if (auth.isSuperAdmin && to.matched.some((r) => r.meta.requiresAuth) && !to.matched.some((r) => r.meta.requiresSuperAdmin)) {
    return { name: 'superadmin-dashboard' }
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
