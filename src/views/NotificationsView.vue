<script setup lang="ts">
/**
 * Notifications view displaying all user notifications in a list.
 * Supports marking individual notifications or all as read.
 * Fetches the full notification list on mount.
 */
import { onMounted, computed } from 'vue'
import { useNotificationStore } from '@/stores/notifications'
import type { Notification } from '@/api/notifications'

const store = useNotificationStore()

/** Whether any notification in the list is still unread. */
const hasUnread = computed(() => store.notifications.some((n: Notification) => !n.read))

onMounted(() => {
  store.fetchNotifications()
})

/**
 * Formats an ISO-8601 timestamp to a locale-specific date/time string.
 * @param iso - ISO-8601 date string
 * @returns Formatted date/time string
 */
function formatDate(iso: string) {
  return new Date(iso).toLocaleString()
}

/**
 * Maps a notification type to a CSS badge class for visual styling.
 * @param type - Notification type string (TEMPERATURE_ALERT, DEVIATION_ASSIGNED, TASK_DUE, GENERAL)
 * @returns CSS class name for the type badge, or empty string for GENERAL
 */
function typeIcon(type: string) {
  if (type === 'TEMPERATURE_ALERT') return 'danger'
  if (type === 'DEVIATION_ASSIGNED') return 'warning'
  if (type === 'TASK_DUE') return 'info'
  return ''
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>Notifications</h1>
      <button
        v-if="hasUnread"
        class="btn btn-secondary btn-sm"
        @click="store.markAllAsRead()"
      >
        Mark all as read
      </button>
    </div>

    <div v-if="store.notifications.length === 0" class="empty-state">
      <h3>No notifications</h3>
      <p>You're all caught up.</p>
    </div>

    <div v-else class="notifications-list">
      <div
        v-for="n in store.notifications"
        :key="n.id"
        class="notification-item card"
        :class="{ unread: !n.read }"
        @click="!n.read && store.markAsRead(n.id)"
      >
        <div class="notification-header">
          <span class="notification-title">
            <span v-if="!n.read" class="unread-dot" />
            {{ n.title }}
          </span>
          <span class="text-muted text-sm">{{ formatDate(n.createdAt) }}</span>
        </div>
        <p class="text-sm">{{ n.message }}</p>
        <span v-if="n.type !== 'GENERAL'" class="status-badge" :class="typeIcon(n.type)">{{ n.type.replace('_', ' ') }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.notification-item {
  cursor: pointer;
  transition: border-color 0.15s;
}
.notification-item.unread {
  border-left: 3px solid var(--accent);
}
.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.notification-title {
  font-weight: 500;
  color: var(--text-h);
  display: flex;
  align-items: center;
  gap: 8px;
}
.unread-dot {
  width: 8px;
  height: 8px;
  background: var(--accent);
  border-radius: 50%;
  flex-shrink: 0;
}
.notification-item .status-badge {
  margin-top: 8px;
}
</style>
