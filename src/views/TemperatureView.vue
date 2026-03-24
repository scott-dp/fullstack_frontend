<script setup lang="ts">
/**
 * Temperature logging view displaying a table of recorded readings
 * and an inline form for recording new temperature measurements.
 */
import { ref, onMounted } from 'vue'
import { temperatureApi, type TemperatureLog, type CreateTemperatureLogRequest } from '@/api/temperature'
import { HttpError } from '@/api/client'

/** All temperature log entries loaded from the server. */
const logs = ref<TemperatureLog[]>([])
/** Whether logs are still being fetched. */
const loading = ref(true)
/** Whether the new temperature recording form is visible. */
const showForm = ref(false)
/** Error message from the last submission attempt. */
const error = ref('')

/** Bound location input value for the recording form. */
const location = ref('')
/** Bound temperature input value (degrees Celsius). */
const temperature = ref<number | null>(null)
/** Lower acceptable threshold for the recording (degrees Celsius). */
const minThreshold = ref(-2)
/** Upper acceptable threshold for the recording (degrees Celsius). */
const maxThreshold = ref(4)
/** Optional comment for the recording. */
const comment = ref('')

onMounted(async () => {
  try {
    logs.value = await temperatureApi.list()
  } finally {
    loading.value = false
  }
})

/**
 * Validates and submits the temperature recording form.
 * On success prepends the new log to the list and resets the form.
 */
async function submit() {
  error.value = ''
  if (!location.value || temperature.value === null) {
    error.value = 'Location and temperature are required'
    return
  }
  try {
    const data: CreateTemperatureLogRequest = {
      location: location.value,
      temperature: temperature.value,
      minThreshold: minThreshold.value,
      maxThreshold: maxThreshold.value,
      comment: comment.value || undefined,
    }
    const created = await temperatureApi.create(data)
    logs.value.unshift(created)
    showForm.value = false
    location.value = ''
    temperature.value = null
    comment.value = ''
  } catch (err: unknown) {
    error.value = err instanceof HttpError ? err.message : 'Failed to log temperature'
  }
}

/**
 * Determines the CSS class for a temperature status badge.
 * @param status - Temperature status string (NORMAL, WARNING, CRITICAL)
 * @returns CSS class name for the status badge
 */
function statusClass(status: string) {
  if (status === 'NORMAL') return 'success'
  if (status === 'WARNING') return 'warning'
  return 'danger'
}

/**
 * Formats an ISO-8601 timestamp to a locale-specific date/time string.
 * @param iso - ISO-8601 date string
 * @returns Formatted date/time string
 */
function formatDate(iso: string) {
  return new Date(iso).toLocaleString()
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>Temperature Logs</h1>
      <button class="btn btn-primary" @click="showForm = !showForm">
        {{ showForm ? 'Cancel' : 'Log Temperature' }}
      </button>
    </div>

    <div v-if="showForm" class="card log-form">
      <h2>Record Temperature</h2>
      <div v-if="error" class="alert-error">{{ error }}</div>
      <form @submit.prevent="submit">
        <div class="form-row">
          <div class="form-group flex-1">
            <label class="form-label">Location</label>
            <input v-model="location" class="form-input" placeholder="e.g., Fridge A, Freezer 1" required />
          </div>
          <div class="form-group">
            <label class="form-label">Temperature (&deg;C)</label>
            <input v-model.number="temperature" type="number" step="0.1" class="form-input" required />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Min Threshold (&deg;C)</label>
            <input v-model.number="minThreshold" type="number" step="0.1" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Max Threshold (&deg;C)</label>
            <input v-model.number="maxThreshold" type="number" step="0.1" class="form-input" />
          </div>
          <div class="form-group flex-1">
            <label class="form-label">Comment (optional)</label>
            <input v-model="comment" class="form-input" />
          </div>
        </div>
        <button type="submit" class="btn btn-primary">Record</button>
      </form>
    </div>

    <div v-if="loading" class="loading"><div class="spinner" /></div>

    <div v-else-if="logs.length === 0" class="empty-state">
      <h3>No temperature logs</h3>
      <p>Start logging temperatures to track compliance.</p>
    </div>

    <div v-else class="card table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Location</th>
            <th>Temp (&deg;C)</th>
            <th>Range</th>
            <th>Status</th>
            <th>Recorded By</th>
            <th>Date</th>
            <th>Comment</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in logs" :key="log.id">
            <td>{{ log.location }}</td>
            <td><strong>{{ log.temperature.toFixed(1) }}</strong></td>
            <td class="text-sm text-muted">{{ log.minThreshold }}&deg; &ndash; {{ log.maxThreshold }}&deg;</td>
            <td><span class="status-badge" :class="statusClass(log.status)">{{ log.status }}</span></td>
            <td>{{ log.recordedByUsername }}</td>
            <td>{{ formatDate(log.recordedAt) }}</td>
            <td>{{ log.comment || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.log-form {
  margin-bottom: 24px;
}
.log-form h2 {
  margin-bottom: 16px;
}
.alert-error {
  padding: 10px 14px;
  background: var(--danger-bg);
  color: var(--danger);
  border-radius: var(--radius);
  font-size: 14px;
  margin-bottom: 16px;
}
.form-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.flex-1 {
  flex: 1;
  min-width: 180px;
}
.form-row .form-group {
  margin-bottom: 0;
  min-width: 140px;
}
</style>
