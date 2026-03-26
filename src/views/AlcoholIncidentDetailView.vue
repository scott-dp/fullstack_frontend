<script setup lang="ts">
/**
 * Alcohol Incident detail view showing full information about a single incident,
 * including metadata, status management actions (for managers/admins),
 * and closing capability.
 */
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { alcoholIncidentApi, type AlcoholIncident } from '@/api/alcoholIncidents'
import { HttpError } from '@/api/client'

const route = useRoute()
const auth = useAuthStore()
/** Incident ID parsed from the route params. */
const incidentId = Number(route.params.id)

/** The loaded incident, null until fetched. */
const incident = ref<AlcoholIncident | null>(null)
/** Whether the incident data is still being loaded. */
const loading = ref(true)
/** Error message from a failed status update. */
const updateError = ref('')
/** Whether the close dialog is visible. */
const showCloseDialog = ref(false)
/** Bound close notes textarea value. */
const closeNotes = ref('')
/** Whether a close action is currently being submitted. */
const closing = ref(false)

onMounted(async () => {
  try {
    incident.value = await alcoholIncidentApi.get(incidentId)
  } finally {
    loading.value = false
  }
})

/**
 * Transitions the incident to a new workflow status.
 * @param newStatus - Target status (OPEN, UNDER_REVIEW, CLOSED)
 */
async function updateStatus(newStatus: string) {
  updateError.value = ''
  try {
    incident.value = await alcoholIncidentApi.update(incidentId, { status: newStatus })
  } catch (err: unknown) {
    updateError.value = err instanceof HttpError ? err.message : 'Update failed'
  }
}

/** Closes the incident with optional notes. */
async function closeIncident() {
  updateError.value = ''
  closing.value = true
  try {
    incident.value = await alcoholIncidentApi.close(incidentId, closeNotes.value)
    showCloseDialog.value = false
    closeNotes.value = ''
  } catch (err: unknown) {
    updateError.value = err instanceof HttpError ? err.message : 'Failed to close incident'
  } finally {
    closing.value = false
  }
}

/**
 * Determines the CSS class for a severity badge.
 * @param s - Severity level (LOW, MEDIUM, HIGH, CRITICAL)
 * @returns CSS class name for the severity badge
 */
function severityClass(s: string) {
  if (s === 'CRITICAL' || s === 'HIGH') return 'danger'
  if (s === 'MEDIUM') return 'warning'
  return 'info'
}

/**
 * Determines the CSS class for a status badge.
 * @param s - Incident status (OPEN, UNDER_REVIEW, CLOSED)
 * @returns CSS class name for the status badge
 */
function statusClass(s: string) {
  if (s === 'CLOSED') return 'success'
  if (s === 'UNDER_REVIEW') return 'info'
  return 'warning'
}

/**
 * Formats an incident type enum to a human-readable label.
 * @param t - Incident type enum
 * @returns Formatted label
 */
function formatType(t: string) {
  return t.replace(/_/g, ' ')
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
      <h1 v-if="incident">{{ formatType(incident.incidentType) }}</h1>
      <router-link to="/app/alcohol-incidents" class="btn btn-secondary">Back</router-link>
    </div>

    <div v-if="loading" class="loading"><div class="spinner" /></div>

    <template v-else-if="incident">
      <div class="detail-grid">
        <div class="card detail-main">
          <div class="meta-row">
            <span class="status-badge" :class="severityClass(incident.severity)">{{ incident.severity }}</span>
            <span class="status-badge" :class="statusClass(incident.status)">{{ incident.status.replace('_', ' ') }}</span>
            <span v-if="incident.followUpRequired" class="status-badge warning">Follow-up Required</span>
          </div>
          <p class="description">{{ incident.description }}</p>

          <div v-if="incident.immediateActionTaken" class="action-taken">
            <h3>Immediate Action Taken</h3>
            <p>{{ incident.immediateActionTaken }}</p>
          </div>

          <div class="info-grid">
            <div><span class="info-label">Occurred At</span><span>{{ formatDate(incident.occurredAt) }}</span></div>
            <div><span class="info-label">Reported By</span><span>{{ incident.reportedByUsername }}</span></div>
            <div><span class="info-label">Assigned To</span><span>{{ incident.assignedToUsername || 'Unassigned' }}</span></div>
            <div v-if="incident.shiftLabel"><span class="info-label">Shift</span><span>{{ incident.shiftLabel }}</span></div>
            <div v-if="incident.locationArea"><span class="info-label">Location</span><span>{{ incident.locationArea }}</span></div>
            <div><span class="info-label">Created</span><span>{{ formatDate(incident.createdAt) }}</span></div>
            <div v-if="incident.closedAt">
              <span class="info-label">Closed</span>
              <span>{{ formatDate(incident.closedAt) }} by {{ incident.closedByUsername }}</span>
            </div>
            <div v-if="incident.linkedDeviationId">
              <span class="info-label">Linked Deviation</span>
              <router-link :to="`/app/deviations/${incident.linkedDeviationId}`">#{{ incident.linkedDeviationId }}</router-link>
            </div>
          </div>

          <!-- Manager/Admin actions -->
          <div v-if="auth.hasManageAccess && incident.status !== 'CLOSED'" class="actions-section">
            <div v-if="updateError" class="alert-error">{{ updateError }}</div>
            <div class="action-row">
              <label class="form-label">Update Status</label>
              <div class="action-buttons">
                <button v-if="incident.status !== 'UNDER_REVIEW'" class="btn btn-sm btn-secondary" @click="updateStatus('UNDER_REVIEW')">Under Review</button>
                <button v-if="incident.status !== 'OPEN'" class="btn btn-sm btn-secondary" @click="updateStatus('OPEN')">Reopen</button>
                <button class="btn btn-sm btn-primary" @click="showCloseDialog = true">Close Incident</button>
              </div>
            </div>
          </div>

          <!-- Close dialog -->
          <div v-if="showCloseDialog" class="close-dialog card">
            <h3>Close Incident</h3>
            <div class="form-group">
              <label class="form-label">Closing Notes (optional)</label>
              <textarea v-model="closeNotes" class="form-textarea" rows="3" placeholder="Any final notes or summary..." />
            </div>
            <div class="action-buttons">
              <button class="btn btn-sm btn-secondary" @click="showCloseDialog = false">Cancel</button>
              <button class="btn btn-sm btn-primary" :disabled="closing" @click="closeIncident">
                {{ closing ? 'Closing...' : 'Confirm Close' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.detail-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
.meta-row {
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.description {
  color: var(--text-h);
  margin-bottom: 16px;
  line-height: 1.6;
  white-space: pre-wrap;
}
.action-taken {
  margin-bottom: 16px;
  padding: 12px;
  background: var(--accent-bg);
  border-radius: var(--radius);
}
.action-taken h3 {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text);
  margin-bottom: 6px;
}
.action-taken p {
  color: var(--text-h);
  white-space: pre-wrap;
}
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}
.info-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text);
  margin-bottom: 2px;
}
.actions-section {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}
.alert-error {
  padding: 10px 14px;
  background: var(--danger-bg);
  color: var(--danger);
  border-radius: var(--radius);
  font-size: 14px;
  margin-bottom: 12px;
}
.action-row {
  margin-bottom: 12px;
}
.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 4px;
}
.close-dialog {
  margin-top: 16px;
  padding: 16px;
  border: 1px solid var(--border);
}
.close-dialog h3 {
  margin-bottom: 12px;
}
</style>
