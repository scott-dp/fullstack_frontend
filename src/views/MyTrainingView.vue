<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { trainingApi, type TrainingAssignment } from '@/api/trainings'
import { getErrorMessage } from '@/api/client'

const assignments = ref<TrainingAssignment[]>([])
const loading = ref(true)
const statusFilter = ref('')
const completing = ref<number | null>(null)
const error = ref('')
const showAck = ref<number | null>(null)
const ackChecked = ref(false)
const ackComments = ref('')
const { t, locale } = useI18n()

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
  return new Date(iso).toLocaleDateString(locale.value)
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
    error.value = getErrorMessage(err, {
      defaultMessage: t('Failed to complete training'),
      byStatus: {
        400: t('Please confirm the training acknowledgment before completing'),
      },
    })
  } finally {
    completing.value = null
  }
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>{{ t('My Training') }}</h1>
    </div>

    <div class="filter-bar">
      <select v-model="statusFilter" class="form-select">
        <option value="">{{ t('All Status') }}</option>
        <option value="ASSIGNED">{{ t('Assigned') }}</option>
        <option value="COMPLETED">{{ t('Completed') }}</option>
        <option value="OVERDUE">{{ t('Overdue') }}</option>
      </select>
    </div>

    <div v-if="loading" class="loading"><div class="spinner" /></div>

    <div v-else-if="filtered.length === 0" class="empty-state">
      <h3>{{ t('No training assignments') }}</h3>
      <p>{{ t('You have no training assigned to you.') }}</p>
    </div>

    <div v-else class="assignments-list">
      <div v-for="a in filtered" :key="a.id" class="card assignment-card">
        <div class="assignment-header">
          <h3>{{ a.templateTitle }}</h3>
          <span class="status-badge" :class="statusClass(a.status)">{{ t(a.status.charAt(0) + a.status.slice(1).toLowerCase()) }}</span>
        </div>
        <div class="assignment-meta">
          <span>{{ t('Assigned by {username} on {date}', { username: a.assignedByUsername, date: formatDate(a.assignedAt) }) }}</span>
          <span v-if="a.dueAt">{{ t('Due: {date}', { date: formatDate(a.dueAt) }) }}</span>
        </div>

        <div v-if="a.status === 'ASSIGNED' || a.status === 'OVERDUE'">
          <button v-if="showAck !== a.id" class="btn btn-primary btn-sm" @click="startComplete(a.id)">
            {{ t('Mark as Completed') }}
          </button>

          <div v-else class="ack-form">
            <div v-if="error" class="alert-error">{{ error }}</div>
            <label class="checkbox-label">
              <input v-model="ackChecked" type="checkbox" />
              {{ t('I have read and understood this training') }}
            </label>
            <div class="form-group">
              <textarea v-model="ackComments" class="form-textarea" rows="2" :placeholder="t('Comments (optional)...')" />
            </div>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-secondary btn-sm" @click="showAck = null">{{ t('Cancel') }}</button>
              <button class="btn btn-primary btn-sm" :disabled="completing === a.id" @click="handleComplete(a.id)">
                {{ completing === a.id ? t('Completing...') : t('Confirm Completion') }}
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
