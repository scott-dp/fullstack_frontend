<!-- Form for reporting a new alcohol-related incident and optionally assigning follow-up. -->
<script setup lang="ts">
/**
 * Alcohol Incident creation view presenting a form to report a new
 * alcohol-related incident with type, severity, description, and other details.
 * Redirects to the incidents list on successful submission.
 */
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { alcoholIncidentApi } from '@/api/operations/alcoholIncidents.ts'
import { getErrorMessage } from '@/api/core/client.ts'
import { userApi, type UserSummary } from '@/api/auth/users.ts'
import { useAuthStore } from '@/stores/auth.ts'

const router = useRouter()
const auth = useAuthStore()
/** Bound occurred-at datetime input value. */
const occurredAt = ref(new Date().toISOString().slice(0, 16))
/** Bound shift label input value. */
const shiftLabel = ref('')
/** Bound location area input value. */
const locationArea = ref('')
/** Selected incident type. */
const incidentType = ref('AGE_DOUBT_REFUSAL')
/** Selected severity level. */
const severity = ref('MEDIUM')
/** Bound description textarea value. */
const description = ref('')
/** Bound immediate action taken textarea value. */
const immediateActionTaken = ref('')
/** Whether follow-up is required. */
const followUpRequired = ref(false)
/** Available assignees for managers/admins. */
const assignees = ref<UserSummary[]>([])
/** Selected assignee ID. */
const assignedToId = ref<number | null>(null)
/** Error message from the last submission attempt. */
const error = ref('')
/** Whether the form is currently being submitted. */
const submitting = ref(false)
const { t } = useI18n()

onMounted(async () => {
  if (!auth.hasManageAccess) {
    return
  }

  try {
    assignees.value = await userApi.list()
  } catch {
    assignees.value = []
  }
})

/**
 * Submits the incident report to the server.
 * On success navigates back to the incidents list.
 */
async function submit() {
  error.value = ''
  submitting.value = true
  try {
    await alcoholIncidentApi.create({
      occurredAt: occurredAt.value + ':00',
      shiftLabel: shiftLabel.value || undefined,
      locationArea: locationArea.value || undefined,
      incidentType: incidentType.value,
      severity: severity.value,
      description: description.value,
      immediateActionTaken: immediateActionTaken.value || undefined,
      followUpRequired: followUpRequired.value,
      assignedToId: assignedToId.value ?? undefined,
    })
    router.push('/app/alcohol-incidents')
  } catch (err: unknown) {
    error.value = getErrorMessage(err, {
      defaultMessage: t('Failed to create incident'),
      byStatus: {
        400: t('Could not create incident. Check the required fields and try again.'),
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
      <h1>{{ t('Report Alcohol Incident') }}</h1>
      <router-link to="/app/alcohol-incidents" class="btn btn-secondary">{{ t('Back') }}</router-link>
    </div>

    <div class="card">
      <div v-if="error" class="alert-error">{{ error }}</div>
      <form @submit.prevent="submit">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">{{ t('When did it occur?') }}</label>
            <input v-model="occurredAt" type="datetime-local" class="form-input" required />
          </div>
          <div class="form-group">
            <label class="form-label">{{ t('Shift') }}</label>
            <input v-model="shiftLabel" class="form-input" :placeholder="t('e.g. Evening Shift')" />
          </div>
          <div class="form-group">
            <label class="form-label">{{ t('Location / Area') }}</label>
            <input v-model="locationArea" class="form-input" :placeholder="t('e.g. Bar Area')" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">{{ t('Incident Type') }}</label>
            <select v-model="incidentType" class="form-select" required>
              <option value="AGE_DOUBT_REFUSAL">{{ t('Age Doubt Refusal') }}</option>
              <option value="UNDERAGE_ATTEMPT">{{ t('Underage Attempt') }}</option>
              <option value="INTOXICATION_REFUSAL">{{ t('Intoxication Refusal') }}</option>
              <option value="GUEST_REMOVED">{{ t('Guest Removed') }}</option>
              <option value="SUSPECTED_FAKE_ID">{{ t('Suspected Fake ID') }}</option>
              <option value="BROUGHT_IN_ALCOHOL">{{ t('Brought In Alcohol') }}</option>
              <option value="ALCOHOL_TAKEN_OUTSIDE_LICENSED_AREA">{{ t('Alcohol Taken Outside Licensed Area') }}</option>
              <option value="SERVICE_AFTER_CLOSING_RISK">{{ t('Service After Closing Risk') }}</option>
              <option value="OTHER">{{ t('Other') }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">{{ t('Severity') }}</label>
            <select v-model="severity" class="form-select" required>
              <option value="LOW">{{ t('Low') }}</option>
              <option value="MEDIUM">{{ t('Medium') }}</option>
              <option value="HIGH">{{ t('High') }}</option>
              <option value="CRITICAL">{{ t('Critical') }}</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">{{ t('Description') }}</label>
          <textarea v-model="description" class="form-textarea" required maxlength="2000" rows="4" :placeholder="t('Describe what happened, where, and the circumstances')" />
        </div>
        <div class="form-group">
          <label class="form-label">{{ t('Immediate Action Taken') }}</label>
          <textarea v-model="immediateActionTaken" class="form-textarea" maxlength="2000" rows="2" :placeholder="t('What was done immediately in response?')" />
        </div>
        <div class="form-group checkbox-group">
          <label class="checkbox-label">
            <input v-model="followUpRequired" type="checkbox" />
            {{ t('Follow-up required') }}
          </label>
        </div>
        <div v-if="auth.hasManageAccess" class="form-group">
          <label class="form-label">{{ t('Assign To') }}</label>
          <select v-model="assignedToId" class="form-select">
            <option :value="null">{{ t('Unassigned') }}</option>
            <option v-for="user in assignees" :key="user.id" :value="user.id">
              {{ [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username }}
            </option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary" :disabled="submitting">
          {{ submitting ? t('Submitting...') : t('Report Incident') }}
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
  flex: 1;
}
.checkbox-group {
  margin-bottom: 16px;
}
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  cursor: pointer;
}
</style>
