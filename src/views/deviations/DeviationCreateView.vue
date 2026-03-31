<!-- Form for reporting a new compliance deviation in food or alcohol operations. -->
<script setup lang="ts">
/**
 * Deviation creation view presenting a form to report a new
 * non-compliance deviation with title, description, category, and severity.
 * Redirects to the deviations list on successful submission.
 */
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { deviationApi } from '@/api/operations/deviations.ts'
import { getErrorMessage } from '@/api/core/client.ts'

const router = useRouter()
/** Bound title input value. */
const title = ref('')
/** Bound description textarea value. */
const description = ref('')
/** Selected compliance category (FOOD or ALCOHOL). */
const category = ref('FOOD')
/** Selected severity level (LOW, MEDIUM, HIGH, CRITICAL). */
const severity = ref('MEDIUM')
/** Error message from the last submission attempt. */
const error = ref('')
/** Whether the form is currently being submitted. */
const submitting = ref(false)
const { t } = useI18n()

/**
 * Submits the deviation report to the server.
 * On success navigates back to the deviations list.
 */
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
    router.push('/app/deviations')
  } catch (err: unknown) {
    error.value = getErrorMessage(err, {
      defaultMessage: t('Failed to create deviation'),
      byStatus: {
        400: t('Could not create deviation. Check the required fields and try again.'),
      },
    })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>{{ t('Report Deviation') }}</h1>
      <router-link to="/app/deviations" class="btn btn-secondary">{{ t('Back') }}</router-link>
    </div>

    <div class="card">
      <div v-if="error" class="alert-error">{{ error }}</div>
      <form @submit.prevent="submit">
        <div class="form-group">
          <label class="form-label">{{ t('Title') }}</label>
          <input v-model="title" class="form-input" required maxlength="255" :placeholder="t('Brief description of the issue')" />
        </div>
        <div class="form-group">
          <label class="form-label">{{ t('Description') }}</label>
          <textarea v-model="description" class="form-textarea" required maxlength="2000" rows="4" :placeholder="t('Detailed description of what happened, where, and any immediate actions taken')" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">{{ t('Category') }}</label>
            <select v-model="category" class="form-select">
              <option value="FOOD">{{ t('IK-Mat (Food)') }}</option>
              <option value="ALCOHOL">{{ t('IK-Alkohol') }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">{{ t('Severity') }}</label>
            <select v-model="severity" class="form-select">
              <option value="LOW">{{ t('Low') }}</option>
              <option value="MEDIUM">{{ t('Medium') }}</option>
              <option value="HIGH">{{ t('High') }}</option>
              <option value="CRITICAL">{{ t('Critical') }}</option>
            </select>
          </div>
        </div>
        <button type="submit" class="btn btn-primary" :disabled="submitting">
          {{ submitting ? t('Submitting...') : t('Report Deviation') }}
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
