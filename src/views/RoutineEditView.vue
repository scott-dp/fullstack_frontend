<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { routineApi } from '@/api/routines'
import { HttpError } from '@/api/client'

const route = useRoute()
const router = useRouter()
const error = ref('')
const saving = ref(false)
const loading = ref(true)
const id = computed(() => Number(route.params.id))
const { t } = useI18n()

const form = ref({
  name: '',
  moduleType: '',
  category: '',
  description: '',
  purpose: '',
  responsibleRole: '',
  frequencyType: '',
  stepsText: '',
  whatIsDeviationText: '',
  correctiveActionText: '',
  requiredEvidenceText: '',
  reviewIntervalDays: null as number | null,
})

const matCategories = [
  { value: 'HYGIENE', label: 'Hygiene' },
  { value: 'CLEANING', label: 'Cleaning' },
  { value: 'TEMPERATURE', label: 'Temperature' },
  { value: 'TRACEABILITY', label: 'Traceability' },
  { value: 'ALLERGENS', label: 'Allergens' },
  { value: 'HACCP', label: 'HACCP' },
]

const alkoholCategories = [
  { value: 'AGE_CONTROL', label: 'Age Control' },
  { value: 'INTOXICATION', label: 'Intoxication' },
  { value: 'CLOSING', label: 'Closing' },
  { value: 'BYO_CONTROL', label: 'BYO Control' },
  { value: 'LICENSE_CONDITIONS', label: 'License Conditions' },
  { value: 'SECURITY', label: 'Security' },
]

onMounted(async () => {
  try {
    const routine = await routineApi.get(id.value)
    form.value = {
      name: routine.name,
      moduleType: routine.moduleType,
      category: routine.category,
      description: routine.description || '',
      purpose: routine.purpose || '',
      responsibleRole: routine.responsibleRole,
      frequencyType: routine.frequencyType,
      stepsText: routine.stepsText || '',
      whatIsDeviationText: routine.whatIsDeviationText || '',
      correctiveActionText: routine.correctiveActionText || '',
      requiredEvidenceText: routine.requiredEvidenceText || '',
      reviewIntervalDays: routine.reviewIntervalDays,
    }
  } catch (err: unknown) {
    error.value = err instanceof HttpError ? err.message : t('Failed to load routine')
  } finally {
    loading.value = false
  }
})

async function handleSubmit() {
  error.value = ''
  if (!form.value.name.trim()) {
    error.value = t('Name is required')
    return
  }

  saving.value = true
  try {
    await routineApi.update(id.value, {
      ...form.value,
      reviewIntervalDays: form.value.reviewIntervalDays || undefined,
    })
    router.push(`/app/routines/${id.value}`)
  } catch (err: unknown) {
    error.value = err instanceof HttpError ? err.message : t('Failed to update routine')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>{{ t('Edit Routine') }}</h1>
    </div>

    <div v-if="loading" class="loading"><div class="spinner" /></div>

    <form v-else class="card routine-form" @submit.prevent="handleSubmit">
      <div v-if="error" class="alert-error">{{ error }}</div>

      <div class="form-group">
        <label class="form-label">{{ t('Name') }} *</label>
        <input v-model="form.name" class="form-input" required maxlength="255" />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">{{ t('Module') }} *</label>
          <select v-model="form.moduleType" class="form-select">
            <option value="IK_MAT">{{ t('IK-Mat (Food)') }}</option>
            <option value="IK_ALKOHOL">{{ t('IK-Alkohol') }}</option>
            <option value="SHARED">{{ t('Shared') }}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">{{ t('Category') }} *</label>
          <select v-model="form.category" class="form-select">
            <optgroup :label="t('IK-Mat')">
              <option v-for="c in matCategories" :key="c.value" :value="c.value">{{ t(c.label) }}</option>
            </optgroup>
            <optgroup :label="t('IK-Alkohol')">
              <option v-for="c in alkoholCategories" :key="c.value" :value="c.value">{{ t(c.label) }}</option>
            </optgroup>
            <option value="OTHER">{{ t('Other') }}</option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">{{ t('Responsible Role') }} *</label>
          <select v-model="form.responsibleRole" class="form-select">
            <option value="ADMIN">{{ t('Admin') }}</option>
            <option value="MANAGER">{{ t('Manager') }}</option>
            <option value="STAFF">{{ t('Staff') }}</option>
            <option value="ALL">{{ t('All') }}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">{{ t('Frequency') }} *</label>
          <select v-model="form.frequencyType" class="form-select">
            <option value="NONE">{{ t('None') }}</option>
            <option value="DAILY">{{ t('Daily') }}</option>
            <option value="WEEKLY">{{ t('Weekly') }}</option>
            <option value="MONTHLY">{{ t('Monthly') }}</option>
            <option value="SHIFT_BASED">{{ t('Shift-Based') }}</option>
            <option value="EVENT_BASED">{{ t('Event-Based') }}</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">{{ t('Description') }}</label>
        <textarea v-model="form.description" class="form-textarea" rows="2" maxlength="2000" />
      </div>

      <div class="form-group">
        <label class="form-label">{{ t('Purpose') }}</label>
        <textarea v-model="form.purpose" class="form-textarea" rows="2" maxlength="1000" />
      </div>

      <div class="form-group">
        <label class="form-label">{{ t('Steps') }}</label>
        <textarea v-model="form.stepsText" class="form-textarea" rows="4" maxlength="4000" />
      </div>

      <div class="form-group">
        <label class="form-label">{{ t('What counts as a deviation?') }}</label>
        <textarea v-model="form.whatIsDeviationText" class="form-textarea" rows="2" maxlength="2000" />
      </div>

      <div class="form-group">
        <label class="form-label">{{ t('Corrective action') }}</label>
        <textarea v-model="form.correctiveActionText" class="form-textarea" rows="2" maxlength="2000" />
      </div>

      <div class="form-group">
        <label class="form-label">{{ t('Required evidence') }}</label>
        <textarea v-model="form.requiredEvidenceText" class="form-textarea" rows="2" maxlength="2000" />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">{{ t('Review Interval (days)') }}</label>
          <input v-model.number="form.reviewIntervalDays" type="number" class="form-input" min="1" max="365" />
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="router.push(`/app/routines/${id}`)">{{ t('Cancel') }}</button>
        <button type="submit" class="btn btn-primary" :disabled="saving">
          {{ saving ? t('Saving...') : t('Save Changes') }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.routine-form {
  max-width: 800px;
}
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
}
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
