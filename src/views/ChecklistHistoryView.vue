<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { checklistApi, type ChecklistCompletion } from '@/api/checklists'

const completions = ref<ChecklistCompletion[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    completions.value = await checklistApi.listCompletions()
  } finally {
    loading.value = false
  }
})

function statusClass(status: string) {
  if (status === 'COMPLETE') return 'success'
  if (status === 'DEVIATION_FOUND') return 'danger'
  return 'warning'
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString()
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>Checklist History</h1>
    </div>

    <div v-if="loading" class="loading"><div class="spinner" /></div>

    <div v-else-if="completions.length === 0" class="empty-state">
      <h3>No completions yet</h3>
      <p>Complete your first checklist to see it here.</p>
    </div>

    <div v-else class="card table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Checklist</th>
            <th>Completed By</th>
            <th>Date</th>
            <th>Status</th>
            <th>Comment</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in completions" :key="c.id">
            <td>{{ c.templateTitle }}</td>
            <td>{{ c.completedByUsername }}</td>
            <td>{{ formatDate(c.completedAt) }}</td>
            <td><span class="status-badge" :class="statusClass(c.status)">{{ c.status }}</span></td>
            <td>{{ c.comment || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
