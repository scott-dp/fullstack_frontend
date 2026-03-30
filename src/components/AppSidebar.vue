<script setup lang="ts">
/**
 * Application sidebar navigation component.
 * Renders grouped navigation with collapsible sections for the main app areas.
 * On mobile, behaves as a slide-out drawer controlled by the `open` prop.
 */
import { computed, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()
const route = useRoute()
const auth = useAuthStore()
const { t } = useI18n()

type NavItem = {
  to: string
  label: string
  icon: string
}

type NavGroup = {
  key: string
  label: string
  icon: string
  items: NavItem[]
}

const dashboardItem: NavItem = {
  to: '/app',
  label: 'Dashboard',
  icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1',
}

const navGroups: NavGroup[] = [
  {
    key: 'operations',
    label: 'Operations',
    icon: 'M4 6h16M4 12h16M4 18h16',
    items: [
      { to: '/app/routines', label: 'Routines', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
      { to: '/app/checklists', label: 'Checklists', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
      { to: '/app/checklists/history', label: 'History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
      { to: '/app/temperature', label: 'Temperature', icon: 'M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z' },
    ],
  },
  {
    key: 'food',
    label: 'Food Management',
    icon: 'M12 3l1.912 5.813h6.11l-4.944 3.59 1.89 5.817L12 14.63l-4.968 3.59 1.89-5.817-4.944-3.59h6.11L12 3',
    items: [
      { to: '/app/dishes', label: 'Dishes', icon: 'M12 3l1.912 5.813h6.11l-4.944 3.59 1.89 5.817L12 14.63l-4.968 3.59 1.89-5.817-4.944-3.59h6.11L12 3' },
      { to: '/app/ingredients', label: 'Ingredients', icon: 'M11 3a1 1 0 011 1v7.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4A1 1 0 017.707 9.293L10 11.586V4a1 1 0 011-1zM5 19a2 2 0 002 2h8a2 2 0 002-2v-1H5v1z' },
      { to: '/app/allergen-sheet', label: 'Allergen Sheet', icon: 'M9 12h6m-6 4h6M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z' },
    ],
  },
  {
    key: 'incidents',
    label: 'Incidents & Follow-up',
    icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z',
    items: [
      { to: '/app/deviations', label: 'Deviations', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z' },
      { to: '/app/alcohol-incidents', label: 'Incidents', icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' },
    ],
  },
  {
    key: 'supply',
    label: 'Supply Chain',
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    items: [
      { to: '/app/suppliers', label: 'Suppliers', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
      { to: '/app/deliveries', label: 'Deliveries', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
      { to: '/app/traceability', label: 'Traceability', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
    ],
  },
  {
    key: 'training',
    label: 'Training',
    icon: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z',
    items: [
      { to: '/app/training', label: 'Training', icon: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z' },
      { to: '/app/training/my', label: 'My Training', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    ],
  },
  {
    key: 'account',
    label: 'Account',
    icon: 'M12 12a5 5 0 100-10 5 5 0 000 10zm-7 9a7 7 0 0114 0',
    items: [
      { to: '/app/notifications', label: 'Notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
      { to: '/app/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
    ],
  },
]

const superAdminNavItems: NavItem[] = [
  { to: '/app/superadmin', label: 'Superadmin', icon: 'M12 3l7 4v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V7l7-4zm0 6a2 2 0 100 4 2 2 0 000-4zm0-2v1m0 6v1' },
]

const standaloneItems: NavItem[] = [
  { to: '/app/bevilling', label: 'Bevilling', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
]

function isActive(to: string) {
  if (to === '/app') return route.path === '/app'
  return route.path.startsWith(to)
}

function isGroupActive(items: NavItem[]) {
  return items.some((item) => isActive(item.to))
}

const groupState = reactive<Record<string, boolean>>(
  Object.fromEntries(
    navGroups.map((group) => [group.key, isGroupActive(group.items)]),
  ),
)

const visibleNavGroups = computed(() => (auth.isSuperAdmin ? [] : navGroups))

function toggleGroup(key: string) {
  groupState[key] = !groupState[key]
}

function handleNavClick() {
  emit('close')
}
</script>

<template>
  <div class="sidebar-overlay" :class="{ visible: open }" @click="emit('close')" />
  <aside class="sidebar" :class="{ open }">
    <div class="sidebar-header">
      <h1 class="logo">CheckMate</h1>
      <span class="org-name">{{ auth.isSuperAdmin ? t('Platform Access') : auth.user?.organizationName || t('No organization') }}</span>
    </div>
    <nav class="sidebar-nav" role="navigation" :aria-label="t('Dashboard')">
      <router-link
        v-if="!auth.isSuperAdmin"
        :to="dashboardItem.to"
        class="nav-item"
        :class="{ active: isActive(dashboardItem.to) }"
        @click="handleNavClick"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path :d="dashboardItem.icon" /></svg>
        <span>{{ t(dashboardItem.label) }}</span>
      </router-link>

      <router-link
        v-for="item in auth.isSuperAdmin ? superAdminNavItems : []"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        :class="{ active: isActive(item.to) }"
        @click="handleNavClick"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path :d="item.icon" /></svg>
        <span>{{ t(item.label) }}</span>
      </router-link>

      <section
        v-for="group in visibleNavGroups"
        :key="group.key"
        class="nav-group"
      >
        <button
          type="button"
          class="nav-group-toggle"
          :class="{ active: isGroupActive(group.items) }"
          @click="toggleGroup(group.key)"
        >
          <span class="nav-group-main">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path :d="group.icon" /></svg>
            <span>{{ t(group.label) }}</span>
          </span>
          <svg
            class="nav-group-chevron"
            :class="{ open: groupState[group.key] }"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        <div v-if="groupState[group.key]" class="nav-subitems">
          <router-link
            v-for="item in group.items"
            :key="item.to"
            :to="item.to"
            class="nav-subitem"
            :class="{ active: isActive(item.to) }"
            @click="handleNavClick"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path :d="item.icon" /></svg>
            <span>{{ t(item.label) }}</span>
          </router-link>
        </div>
      </section>

      <router-link
        v-for="item in auth.isSuperAdmin ? [] : standaloneItems"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        :class="{ active: isActive(item.to) }"
        @click="handleNavClick"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path :d="item.icon" /></svg>
        <span>{{ t(item.label) }}</span>
      </router-link>

      <div v-if="!auth.isSuperAdmin && auth.hasManageAccess" class="nav-divider" />

      <router-link
        v-if="!auth.isSuperAdmin && auth.isAdmin"
        to="/app/admin"
        class="nav-item"
        :class="{ active: route.path === '/app/admin' }"
        @click="handleNavClick"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        <span>{{ t('Admin Panel') }}</span>
      </router-link>

      <router-link
        v-if="!auth.isSuperAdmin && auth.hasManageAccess"
        to="/app/admin/users"
        class="nav-item"
        :class="{ active: route.path === '/app/admin/users' }"
        @click="handleNavClick"
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
  width: 264px;
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

.nav-item,
.nav-subitem {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text);
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
}

.nav-item {
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 14px;
}

.nav-subitem {
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
}

.nav-item:hover,
.nav-subitem:hover {
  background: var(--accent-bg);
  color: var(--text-h);
}

.nav-item.active,
.nav-subitem.active {
  background: var(--accent-bg);
  color: var(--accent);
  font-weight: 500;
}

.nav-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-group-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-radius: 6px;
  background: none;
  color: var(--text);
  font: inherit;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.nav-group-toggle:hover {
  background: var(--accent-bg);
  color: var(--text-h);
}

.nav-group-toggle.active {
  background: color-mix(in srgb, var(--accent-bg) 65%, transparent);
  color: var(--text-h);
}

.nav-group-main {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.nav-group-main span:last-child {
  line-height: 1.2;
}

.nav-group-chevron {
  transition: transform 0.18s ease;
}

.nav-group-chevron.open {
  transform: rotate(180deg);
}

.nav-subitems {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-left: 22px;
  padding-left: 14px;
  border-left: 1px solid var(--border);
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
