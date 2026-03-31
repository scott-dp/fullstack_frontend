<!-- Create and edit form for reusable training templates used in staff onboarding. -->
<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { trainingApi } from '@/api/operations/trainings.ts'
import { getErrorMessage } from '@/api/core/client.ts'

const router = useRouter()
const error = ref('')
const saving = ref(false)
const { t } = useI18n()

const form = ref({
  title: '',
  moduleType: 'IK_MAT',
  category: 'FOOD_HYGIENE',
  description: '',
  contentText: '',
  requiredForRole: 'ALL',
  isMandatory: false,
  validityDays: null as number | null,
  acknowledgmentRequired: true,
})

const categories = [
  { value: 'FOOD_HYGIENE', label: 'Food Hygiene' },
  { value: 'ALLERGENS', label: 'Allergens' },
  { value: 'HACCP_AWARENESS', label: 'HACCP Awareness' },
  { value: 'AGE_CONTROL', label: 'Age Control' },
  { value: 'INTOXICATION_HANDLING', label: 'Intoxication Handling' },
  { value: 'LICENSE_RULES', label: 'License Rules' },
  { value: 'RESPONSIBLE_HOSTING', label: 'Responsible Hosting' },
  { value: 'CUSTOM', label: 'Custom' },
]

async function handleSubmit() {
  error.value = ''
  if (!form.value.title.trim()) {
    error.value = t('Title is required')
    return
  }
  saving.value = true
  try {
    await trainingApi.createTemplate({
      ...form.value,
      validityDays: form.value.validityDays || undefined,
    })
    router.push('/app/training')
  } catch (err: unknown) {
    error.value = getErrorMessage(err, {
      defaultMessage: t('Failed to create template'),
      byStatus: {
        400: t('Please check the training template details and try again'),
        403: t('You do not have permission to create training templates'),
      },
    })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>{{ t('New Training Template') }}</h1>
    </div>

    <form class="card training-form" @submit.prevent="handleSubmit">
      <div v-if="error" class="alert-error">{{ error }}</div>

      <div class="form-group">
        <label class="form-label">{{ t('Title') }} *</label>
        <input v-model="form.title" class="form-input" required maxlength="255" :placeholder="t('e.g. Basic food hygiene')" />
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
            <option v-for="c in categories" :key="c.value" :value="c.value">{{ t(c.label) }}</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">{{ t('Description') }}</label>
        <textarea v-model="form.description" class="form-textarea" rows="2" maxlength="2000" />
      </div>

      <div class="form-group">
        <label class="form-label">{{ t('Training Content') }}</label>
        <textarea v-model="form.contentText" class="form-textarea" rows="6" maxlength="4000" :placeholder="t('Full training material text...')" />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">{{ t('Required For') }}</label>
          <select v-model="form.requiredForRole" class="form-select">
            <option value="ALL">{{ t('All Staff') }}</option>
            <option value="ADMIN">{{ t('Admin') }}</option>
            <option value="MANAGER">{{ t('Manager') }}</option>
            <option value="STAFF">{{ t('Staff') }}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">{{ t('Validity (days)') }}</label>
          <input v-model.number="form.validityDays" type="number" class="form-input" min="1" max="3650" :placeholder="t('e.g. 365')" />
        </div>
      </div>

      <div class="form-row checkbox-row">
        <label class="checkbox-label">
          <input v-model="form.isMandatory" type="checkbox" />
          {{ t('Mandatory training') }}
        </label>
        <label class="checkbox-label">
          <input v-model="form.acknowledgmentRequired" type="checkbox" />
          {{ t('Requires acknowledgment') }}
        </label>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="router.push('/app/training')">{{ t('Cancel') }}</button>
        <button type="submit" class="btn btn-primary" :disabled="saving">
          {{ saving ? t('Creating...') : t('Create Template') }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.training-form {
  max-width: 800px;
}
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.checkbox-row {
  display: flex;
  gap: 24px;
  margin: 8px 0;
}
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  cursor: pointer;
}
.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
}
@media (max-width: 768px) {
  .form-row { grid-template-columns: 1fr; }
}
</style>
