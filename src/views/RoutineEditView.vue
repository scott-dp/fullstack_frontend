<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { routineApi, type Routine } from '@/api/routines'
import { checklistApi, type ChecklistTemplate } from '@/api/checklists'
import { HttpError } from '@/api/client'

const route = useRoute()
const router = useRouter()
const error = ref('')
const saving = ref(false)
const loading = ref(true)
const templates = ref<ChecklistTemplate[]>([])
const id = computed(() => Number(route.params.id))

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
  linkedChecklistTemplateId: null as number | null,
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
    const [routine, tpls] = await Promise.all([
      routineApi.get(id.value),
      checklistApi.listTemplates().catch(() => [] as ChecklistTemplate[]),
    ])
    templates.value = tpls
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
      linkedChecklistTemplateId: routine.linkedChecklistTemplateId,
      reviewIntervalDays: routine.reviewIntervalDays,
    }
  } catch (err: unknown) {
    error.value = err instanceof HttpError ? err.message : 'Failed to load routine'
  } finally {
    loading.value = false
  }
})

async function handleSubmit() {
  error.value = ''
  if (!form.value.name.trim()) {
    error.value = 'Name is required'
    return
  }

  saving.value = true
  try {
    await routineApi.update(id.value, {
      ...form.value,
      linkedChecklistTemplateId: form.value.linkedChecklistTemplateId || undefined,
      reviewIntervalDays: form.value.reviewIntervalDays || undefined,
    })
    router.push(`/app/routines/${id.value}`)
  } catch (err: unknown) {
    error.value = err instanceof HttpError ? err.message : 'Failed to update routine'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>Edit Routine</h1>
    </div>

    <div v-if="loading" class="loading"><div class="spinner" /></div>

    <form v-else class="card routine-form" @submit.prevent="handleSubmit">
      <div v-if="error" class="alert-error">{{ error }}</div>

      <div class="form-group">
        <label class="form-label">Name *</label>
        <input v-model="form.name" class="form-input" required maxlength="255" />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Module *</label>
          <select v-model="form.moduleType" class="form-select">
            <option value="IK_MAT">IK-Mat (Food)</option>
            <option value="IK_ALKOHOL">IK-Alkohol</option>
            <option value="SHARED">Shared</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Category *</label>
          <select v-model="form.category" class="form-select">
            <optgroup label="IK-Mat">
              <option v-for="c in matCategories" :key="c.value" :value="c.value">{{ c.label }}</option>
            </optgroup>
            <optgroup label="IK-Alkohol">
              <option v-for="c in alkoholCategories" :key="c.value" :value="c.value">{{ c.label }}</option>
            </optgroup>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Responsible Role *</label>
          <select v-model="form.responsibleRole" class="form-select">
            <option value="ADMIN">Admin</option>
            <option value="MANAGER">Manager</option>
            <option value="STAFF">Staff</option>
            <option value="ALL">All</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Frequency *</label>
          <select v-model="form.frequencyType" class="form-select">
            <option value="NONE">None</option>
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
            <option value="MONTHLY">Monthly</option>
            <option value="SHIFT_BASED">Shift-Based</option>
            <option value="EVENT_BASED">Event-Based</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Description</label>
        <textarea v-model="form.description" class="form-textarea" rows="2" maxlength="2000" />
      </div>

      <div class="form-group">
        <label class="form-label">Purpose</label>
        <textarea v-model="form.purpose" class="form-textarea" rows="2" maxlength="1000" />
      </div>

      <div class="form-group">
        <label class="form-label">Steps</label>
        <textarea v-model="form.stepsText" class="form-textarea" rows="4" maxlength="4000" />
      </div>

      <div class="form-group">
        <label class="form-label">What counts as a deviation?</label>
        <textarea v-model="form.whatIsDeviationText" class="form-textarea" rows="2" maxlength="2000" />
      </div>

      <div class="form-group">
        <label class="form-label">Corrective action</label>
        <textarea v-model="form.correctiveActionText" class="form-textarea" rows="2" maxlength="2000" />
      </div>

      <div class="form-group">
        <label class="form-label">Required evidence</label>
        <textarea v-model="form.requiredEvidenceText" class="form-textarea" rows="2" maxlength="2000" />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Linked Checklist Template</label>
          <select v-model="form.linkedChecklistTemplateId" class="form-select">
            <option :value="null">None</option>
            <option v-for="t in templates" :key="t.id" :value="t.id">{{ t.title }}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Review Interval (days)</label>
          <input v-model.number="form.reviewIntervalDays" type="number" class="form-input" min="1" max="365" />
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="router.push(`/app/routines/${id}`)">Cancel</button>
        <button type="submit" class="btn btn-primary" :disabled="saving">
          {{ saving ? 'Saving...' : 'Save Changes' }}
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
