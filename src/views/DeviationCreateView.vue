<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { deviationApi } from '@/api/deviations'
import { HttpError } from '@/api/client'

const router = useRouter()
const title = ref('')
const description = ref('')
const category = ref('FOOD')
const severity = ref('MEDIUM')
const error = ref('')
const submitting = ref(false)

async function submit() {
  error.value = ''
  submitting.value = true
  try {
    await deviationApi.create({
      title: title.value,
      description: description.value,
      category: category.value,
      severity: severity.value,
    })
    router.push('/deviations')
  } catch (err: unknown) {
    error.value = err instanceof HttpError ? err.message : 'Failed to create deviation'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>Report Deviation</h1>
      <router-link to="/deviations" class="btn btn-secondary">Back</router-link>
    </div>

    <div class="card">
      <div v-if="error" class="alert-error">{{ error }}</div>
      <form @submit.prevent="submit">
        <div class="form-group">
          <label class="form-label">Title</label>
          <input v-model="title" class="form-input" required maxlength="255" placeholder="Brief description of the issue" />
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea v-model="description" class="form-textarea" required maxlength="2000" rows="4" placeholder="Detailed description of what happened, where, and any immediate actions taken" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Category</label>
            <select v-model="category" class="form-select">
              <option value="FOOD">IK-Mat (Food)</option>
              <option value="ALCOHOL">IK-Alkohol</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Severity</label>
            <select v-model="severity" class="form-select">
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
        </div>
        <button type="submit" class="btn btn-primary" :disabled="submitting">
          {{ submitting ? 'Submitting...' : 'Report Deviation' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
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
}
.form-row .form-group {
  min-width: 180px;
}
</style>
