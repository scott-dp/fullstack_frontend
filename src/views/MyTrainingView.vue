<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { trainingApi, type TrainingAssignment } from '@/api/trainings'
import { HttpError } from '@/api/client'

const assignments = ref<TrainingAssignment[]>([])
const loading = ref(true)
const statusFilter = ref('')
const completing = ref<number | null>(null)
const error = ref('')
const showAck = ref<number | null>(null)
const ackChecked = ref(false)
const ackComments = ref('')

const filtered = computed(() => {
  return assignments.value.filter((a: TrainingAssignment) => {
    if (statusFilter.value && a.status !== statusFilter.value) return false
    return true
  })
})

onMounted(async () => {
  try {
    assignments.value = await trainingApi.myAssignments()
  } finally {
    loading.value = false
  }
})

function statusClass(s: string) {
  if (s === 'COMPLETED') return 'success'
  if (s === 'OVERDUE') return 'danger'
  if (s === 'CANCELLED') return 'warning'
  return 'info'
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString()
}

function startComplete(id: number) {
  showAck.value = id
  ackChecked.value = false
  ackComments.value = ''
  error.value = ''
}

async function handleComplete(assignmentId: number) {
  error.value = ''
  completing.value = assignmentId
  try {
    await trainingApi.complete(assignmentId, ackChecked.value, ackComments.value || undefined)
    const idx = assignments.value.findIndex(a => a.id === assignmentId)
    if (idx >= 0) assignments.value[idx].status = 'COMPLETED'
    showAck.value = null
  } catch (err: unknown) {
    error.value = err instanceof HttpError ? err.message : 'Failed to complete training'
  } finally {
    completing.value = null
  }
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>My Training</h1>
    </div>

    <div class="filter-bar">
      <select v-model="statusFilter" class="form-select">
        <option value="">All Status</option>
        <option value="ASSIGNED">Assigned</option>
        <option value="COMPLETED">Completed</option>
        <option value="OVERDUE">Overdue</option>
      </select>
    </div>

    <div v-if="loading" class="loading"><div class="spinner" /></div>

    <div v-else-if="filtered.length === 0" class="empty-state">
      <h3>No training assignments</h3>
      <p>You have no training assigned to you.</p>
    </div>

    <div v-else class="assignments-list">
      <div v-for="a in filtered" :key="a.id" class="card assignment-card">
        <div class="assignment-header">
          <h3>{{ a.templateTitle }}</h3>
          <span class="status-badge" :class="statusClass(a.status)">{{ a.status }}</span>
        </div>
        <div class="assignment-meta">
          <span>Assigned by {{ a.assignedByUsername }} on {{ formatDate(a.assignedAt) }}</span>
          <span v-if="a.dueAt">Due: {{ formatDate(a.dueAt) }}</span>
        </div>

        <div v-if="a.status === 'ASSIGNED' || a.status === 'OVERDUE'">
          <button v-if="showAck !== a.id" class="btn btn-primary btn-sm" @click="startComplete(a.id)">
            Mark as Completed
          </button>

          <div v-else class="ack-form">
            <div v-if="error" class="alert-error">{{ error }}</div>
            <label class="checkbox-label">
              <input v-model="ackChecked" type="checkbox" />
              I have read and understood this training
            </label>
            <div class="form-group">
              <textarea v-model="ackComments" class="form-textarea" rows="2" placeholder="Comments (optional)..." />
            </div>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-secondary btn-sm" @click="showAck = null">Cancel</button>
              <button class="btn btn-primary btn-sm" :disabled="completing === a.id" @click="handleComplete(a.id)">
                {{ completing === a.id ? 'Completing...' : 'Confirm Completion' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.assignments-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.assignment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.assignment-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: var(--text);
  margin-bottom: 12px;
}
.ack-form {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 12px;
}
</style>
