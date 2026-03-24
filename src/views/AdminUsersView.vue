<script setup lang="ts">
/**
 * Admin user management view displaying a table of all users
 * in the organization with their roles. Accessible only to admins.
 */
import { ref, onMounted } from 'vue'
import { userApi, type UserSummary } from '@/api/users'

/** All users loaded from the server. */
const users = ref<UserSummary[]>([])
/** Whether users are still being fetched. */
const loading = ref(true)

onMounted(async () => {
  try {
    users.value = await userApi.list()
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <div class="page-header">
      <h1>User Management</h1>
    </div>

    <div v-if="loading" class="loading"><div class="spinner" /></div>

    <div v-else-if="users.length === 0" class="empty-state">
      <h3>No users found</h3>
    </div>

    <div v-else class="card table-wrapper">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Name</th>
            <th>Roles</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id">
            <td>{{ u.id }}</td>
            <td><strong>{{ u.username }}</strong></td>
            <td>{{ [u.firstName, u.lastName].filter(Boolean).join(' ') || '-' }}</td>
            <td>
              <span v-for="role in u.roles" :key="role" class="status-badge info role-badge">
                {{ role.replace('ROLE_', '') }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.role-badge {
  margin-right: 4px;
}
</style>
