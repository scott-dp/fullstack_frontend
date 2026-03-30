<!-- Main authenticated layout combining the sidebar, header actions, and routed content. -->
<script setup lang="ts">
/**
 * Main application layout wrapping authenticated pages.
 * Provides the sidebar navigation, top header bar with notification badge
 * and user info, and a router-view outlet for child views.
 */
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notifications'
import AppSidebar from '@/components/AppSidebar.vue'
import { setI18nLocale, type AppLocale } from '@/i18n'

const auth = useAuthStore()
const notificationStore = useNotificationStore()
const router = useRouter()
const { t, locale } = useI18n()
/** Whether the mobile sidebar drawer is open. */
const sidebarOpen = ref(false)

if (!auth.isSuperAdmin) {
  notificationStore.fetchUnreadCount()
}

/** Logs out the current user and redirects to the login page. */
async function handleLogout() {
  await auth.logout()
  router.push({ name: 'login' })
}

function changeLocale(event: Event) {
  setI18nLocale((event.target as HTMLSelectElement).value as AppLocale)
}
</script>

<template>
  <div class="app-layout">
    <AppSidebar :open="sidebarOpen" @close="sidebarOpen = false" />
    <div class="app-main">
      <header class="app-header">
        <div class="header-left">
          <button class="menu-toggle" @click="sidebarOpen = !sidebarOpen" :aria-label="t('Toggle menu')">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          </button>
          <router-link to="/" class="home-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/></svg>
            <span>{{ t('Front Page') }}</span>
          </router-link>
        </div>
        <div class="header-right">
          <label class="locale-switcher">
            <span>{{ t('Language') }}</span>
            <select :value="locale" @change="changeLocale">
              <option value="en">{{ t('English') }}</option>
              <option value="es">{{ t('Spanish') }}</option>
              <option value="no">{{ t('Norwegian') }}</option>
              <option value="ne">{{ t('Nepali') }}</option>
              <option value="ur">{{ t('Urdu') }}</option>
            </select>
          </label>
          <router-link v-if="!auth.isSuperAdmin" to="/app/notifications" class="notification-badge" :aria-label="t('Notifications')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
            <span v-if="notificationStore.unreadCount > 0" class="badge">{{ notificationStore.unreadCount }}</span>
          </router-link>
          <div class="user-info">
            <span class="username">{{ auth.user?.firstName || auth.user?.username }}</span>
            <button class="btn-link" @click="handleLogout">{{ t('Log out') }}</button>
          </div>
        </div>
      </header>
      <main class="app-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
}
.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 60px;
  border-bottom: 1px solid var(--border);
  background: var(--bg);
  position: sticky;
  top: 0;
  z-index: 10;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.menu-toggle {
  display: none;
  background: none;
  border: none;
  color: var(--text);
  cursor: pointer;
  padding: 4px;
}
.home-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-h);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}
.home-link:hover {
  background: var(--accent-bg);
  border-color: var(--accent);
  color: var(--accent);
}
.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-left: auto;
}
.notification-badge {
  position: relative;
  color: var(--text);
  text-decoration: none;
}
.locale-switcher {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text);
}
.locale-switcher select {
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  color: var(--text-h);
  padding: 6px 10px;
}
.badge {
  position: absolute;
  top: -6px;
  right: -8px;
  background: var(--danger);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
.username {
  font-weight: 500;
  color: var(--text-h);
}
.btn-link {
  background: none;
  border: none;
  color: var(--accent);
  cursor: pointer;
  font-size: 14px;
}
.btn-link:hover {
  text-decoration: underline;
}
.app-content {
  flex: 1;
  padding: 24px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}
@media (max-width: 768px) {
  .menu-toggle {
    display: block;
  }
  .home-link {
    padding: 8px;
  }
  .home-link span {
    display: none;
  }
  .app-content {
    padding: 16px;
  }
  .app-header {
    padding: 0 16px;
  }
}
</style>
