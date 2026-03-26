<script setup lang="ts">
/**
 * Application sidebar navigation component.
 * Renders the main nav links with SVG icons, highlights the active route,
 * and conditionally shows the admin-only "User Management" link.
 * On mobile, behaves as a slide-out drawer controlled by the `open` prop.
 */
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'

/** @prop open - Whether the mobile sidebar drawer is open. */
defineProps<{ open: boolean }>()
/** @event close - Emitted when the sidebar should be closed (overlay click or nav). */
const emit = defineEmits<{ close: [] }>()
const route = useRoute()
const auth = useAuthStore()
const { t } = useI18n()

/** Navigation items displayed in the sidebar, each with a route path, label, and SVG icon path. */
const navItems = [
  { to: '/app', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1' },
  { to: '/app/checklists', label: 'Checklists', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  { to: '/app/checklists/history', label: 'History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { to: '/app/temperature', label: 'Temperature', icon: 'M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z' },
  { to: '/app/deviations', label: 'Deviations', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z' },
<<<<<<< HEAD
  { to: '/app/dishes', label: 'Dishes', icon: 'M12 3l1.912 5.813h6.11l-4.944 3.59 1.89 5.817L12 14.63l-4.968 3.59 1.89-5.817-4.944-3.59h6.11L12 3' },
  { to: '/app/allergen-sheet', label: 'Allergen Sheet', icon: 'M9 12h6m-6 4h6M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z' },
  { to: '/app/alcohol-incidents', label: 'Incidents', icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' },
=======
  { to: '/app/suppliers', label: 'Suppliers', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { to: '/app/deliveries', label: 'Deliveries', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { to: '/app/traceability', label: 'Traceability', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
>>>>>>> 0136aa2 (add supplier, delivery, and traceability frontend)
  { to: '/app/notifications', label: 'Notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
  { to: '/app/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
]

const manageNavItems = [
  { to: '/app/ingredients', label: 'Ingredients', icon: 'M11 3a1 1 0 011 1v7.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4A1 1 0 017.707 9.293L10 11.586V4a1 1 0 011-1zM5 19a2 2 0 002 2h8a2 2 0 002-2v-1H5v1z' },
]

/**
 * Determines whether a navigation item is active based on the current route path.
 * The dashboard ("/") requires an exact match; other items use prefix matching.
 * @param to - Route path of the navigation item
 * @returns True if the item should be highlighted as active
 */
function isActive(to: string) {
  if (to === '/app') return route.path === '/app'
  return route.path.startsWith(to)
}
</script>

<template>
  <div class="sidebar-overlay" :class="{ visible: open }" @click="emit('close')" />
  <aside class="sidebar" :class="{ open }">
    <div class="sidebar-header">
      <h1 class="logo">IK System</h1>
      <span class="org-name">{{ auth.user?.organizationName || t('No organization') }}</span>
    </div>
    <nav class="sidebar-nav" role="navigation" :aria-label="t('Dashboard')">
      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        :class="{ active: isActive(item.to) }"
        @click="emit('close')"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path :d="item.icon" /></svg>
        <span>{{ t(item.label) }}</span>
      </router-link>
      <router-link
        v-for="item in auth.hasManageAccess ? manageNavItems : []"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        :class="{ active: isActive(item.to) }"
        @click="emit('close')"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path :d="item.icon" /></svg>
        <span>{{ t(item.label) }}</span>
      </router-link>
      <div v-if="auth.hasManageAccess" class="nav-divider" />
      <router-link
        v-if="auth.isAdmin"
        to="/app/admin"
        class="nav-item"
        :class="{ active: route.path === '/app/admin' }"
        @click="emit('close')"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        <span>{{ t('Admin Panel') }}</span>
      </router-link>
      <router-link
        v-if="auth.hasManageAccess"
        to="/app/admin/users"
        class="nav-item"
        :class="{ active: route.path === '/app/admin/users' }"
        @click="emit('close')"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>
        <span>{{ t('User Management') }}</span>
      </router-link>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 19;
}
.sidebar-overlay.visible {
  display: block;
}
.sidebar {
  width: 240px;
  background: var(--bg);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  height: 100vh;
  position: sticky;
  top: 0;
}
.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid var(--border);
}
.logo {
  font-size: 20px;
  margin: 0 0 4px;
  letter-spacing: -0.5px;
}
.org-name {
  font-size: 13px;
  color: var(--text);
}
.sidebar-nav {
  display: flex;
  flex-direction: column;
  padding: 8px;
  gap: 2px;
  overflow-y: auto;
  flex: 1;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 6px;
  color: var(--text);
  text-decoration: none;
  font-size: 14px;
  transition: background 0.15s, color 0.15s;
}
.nav-item:hover {
  background: var(--accent-bg);
  color: var(--text-h);
}
.nav-item.active {
  background: var(--accent-bg);
  color: var(--accent);
  font-weight: 500;
}
.nav-divider {
  height: 1px;
  background: var(--border);
  margin: 6px 12px;
}
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    z-index: 20;
    transform: translateX(-100%);
    transition: transform 0.2s ease;
  }
  .sidebar.open {
    transform: translateX(0);
  }
}
</style>
