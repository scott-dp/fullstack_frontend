<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notifications'
import AppSidebar from '@/components/AppSidebar.vue'

const auth = useAuthStore()
const notificationStore = useNotificationStore()
const router = useRouter()
const sidebarOpen = ref(false)

notificationStore.fetchUnreadCount()

async function handleLogout() {
  await auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="app-layout">
    <AppSidebar :open="sidebarOpen" @close="sidebarOpen = false" />
    <div class="app-main">
      <header class="app-header">
        <button class="menu-toggle" @click="sidebarOpen = !sidebarOpen" aria-label="Toggle menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
        </button>
        <div class="header-right">
          <router-link to="/notifications" class="notification-badge" aria-label="Notifications">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
            <span v-if="notificationStore.unreadCount > 0" class="badge">{{ notificationStore.unreadCount }}</span>
          </router-link>
          <div class="user-info">
            <span class="username">{{ auth.user?.firstName || auth.user?.username }}</span>
            <button class="btn-link" @click="handleLogout">Log out</button>
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
.menu-toggle {
  display: none;
  background: none;
  border: none;
  color: var(--text);
  cursor: pointer;
  padding: 4px;
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
  .app-content {
    padding: 16px;
  }
  .app-header {
    padding: 0 16px;
  }
}
</style>
