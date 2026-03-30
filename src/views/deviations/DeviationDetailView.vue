<script setup lang="ts">
/**
 * Deviation detail view showing full information about a single deviation,
 * including metadata, status management actions (for managers/admins),
 * user assignment, and a threaded comment section.
 */
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.ts'
import { deviationApi, type Deviation } from '@/api/operations/deviations.ts'
import { userApi, type UserSummary } from '@/api/auth/users.ts'
import { getErrorMessage } from '@/api/core/client.ts'

const route = useRoute()
const auth = useAuthStore()
/** Deviation ID parsed from the route params. */
const deviationId = Number(route.params.id)

/** The loaded deviation, null until fetched. */
const deviation = ref<Deviation | null>(null)
/** List of users available for assignment (loaded for managers/admins). */
const users = ref<UserSummary[]>([])
/** Whether the deviation data is still being loaded. */
const loading = ref(true)
/** Bound textarea value for a new comment. */
const newComment = ref('')
/** Error message from a failed comment submission. */
const commentError = ref('')
/** Error message from a failed status or assignment update. */
const updateError = ref('')
/** Whether a comment is currently being submitted. */
const submittingComment = ref(false)
const { t, locale } = useI18n()

onMounted(async () => {
  try {
    deviation.value = await deviationApi.get(deviationId)
    if (auth.hasManageAccess) {
      users.value = await userApi.list()
    }
  } finally {
    loading.value = false
  }
})

/**
 * Transitions the deviation to a new workflow status.
 * @param newStatus - Target status (OPEN, IN_PROGRESS, RESOLVED, CLOSED)
 */
async function updateStatus(newStatus: string) {
  updateError.value = ''
  try {
    deviation.value = await deviationApi.update(deviationId, { status: newStatus })
  } catch (err: unknown) {
    updateError.value = getErrorMessage(err, {
      defaultMessage: t('Update failed'),
      byStatus: {
        400: t('The deviation could not be updated.'),
        403: t('You do not have permission to update this deviation.'),
      },
    })
  }
}

/**
 * Assigns or unassigns the deviation to a user.
 * @param userId - User ID to assign, or undefined to unassign
 */
async function assign(userId: number | undefined) {
  updateError.value = ''
  try {
    deviation.value = await deviationApi.update(deviationId, { assignedToId: userId })
  } catch (err: unknown) {
    updateError.value = getErrorMessage(err, {
      defaultMessage: t('Assignment failed'),
      byStatus: {
        400: t('The deviation could not be assigned to that user.'),
        403: t('You do not have permission to assign this deviation.'),
      },
    })
  }
}

/** Submits a new comment on the deviation and appends it to the local list. */
async function addComment() {
  if (!newComment.value.trim()) return
  commentError.value = ''
  submittingComment.value = true
  try {
    const comment = await deviationApi.addComment(deviationId, newComment.value)
    deviation.value?.comments.push(comment)
    newComment.value = ''
  } catch (err: unknown) {
    commentError.value = getErrorMessage(err, {
      defaultMessage: t('Failed to add comment'),
      byStatus: {
        400: t('Your comment could not be added.'),
      },
    })
  } finally {
    submittingComment.value = false
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
 * @param s - Deviation status (OPEN, IN_PROGRESS, RESOLVED, CLOSED)
 * @returns CSS class name for the status badge
 */
function statusClass(s: string) {
  if (s === 'CLOSED' || s === 'RESOLVED') return 'success'
  if (s === 'IN_PROGRESS') return 'info'
  return 'warning'
}

/**
 * Formats an ISO-8601 timestamp to a locale-specific date/time string.
 * @param iso - ISO-8601 date string
 * @returns Formatted date/time string
 */
function formatDate(iso: string) {
  return new Date(iso).toLocaleString(locale.value)
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    OPEN: t('Open'),
    IN_PROGRESS: t('In Progress'),
    RESOLVED: t('Resolved'),
    CLOSED: t('Closed'),
  }
  return labels[status] ?? status
}

function severityLabel(severity: string) {
  const labels: Record<string, string> = {
    LOW: t('Low'),
    MEDIUM: t('Medium'),
    HIGH: t('High'),
    CRITICAL: t('Critical'),
  }
  return labels[severity] ?? severity
}

function categoryLabel(category: string) {
  return category === 'FOOD' ? t('IK-Mat') : t('IK-Alkohol')
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1 v-if="deviation">{{ deviation.title }}</h1>
      <router-link to="/app/deviations" class="btn btn-secondary">{{ t('Back') }}</router-link>
    </div>

    <div v-if="loading" class="loading"><div class="spinner" /></div>

    <template v-else-if="deviation">
      <div class="detail-grid">
        <div class="card detail-main">
          <div class="meta-row">
            <span class="status-badge" :class="severityClass(deviation.severity)">{{ severityLabel(deviation.severity) }}</span>
            <span class="status-badge" :class="statusClass(deviation.status)">{{ statusLabel(deviation.status) }}</span>
            <span class="status-badge" :class="deviation.category === 'FOOD' ? 'success' : 'warning'">
              {{ categoryLabel(deviation.category) }}
            </span>
          </div>
          <p class="description">{{ deviation.description }}</p>
          <div class="info-grid">
            <div><span class="info-label">{{ t('Reported by') }}</span><span>{{ deviation.reportedByUsername }}</span></div>
            <div><span class="info-label">{{ t('Assigned to') }}</span><span>{{ deviation.assignedToUsername || t('Unassigned') }}</span></div>
            <div><span class="info-label">{{ t('Created') }}</span><span>{{ formatDate(deviation.createdAt) }}</span></div>
            <div v-if="deviation.resolvedAt"><span class="info-label">{{ t('Resolved') }}</span><span>{{ formatDate(deviation.resolvedAt) }} {{ t('by') }} {{ deviation.resolvedByUsername }}</span></div>
          </div>

          <!-- Manager/Admin actions -->
          <div v-if="auth.hasManageAccess" class="actions-section">
            <div v-if="updateError" class="alert-error">{{ updateError }}</div>
            <div class="action-row">
              <label class="form-label">{{ t('Update Status') }}</label>
              <div class="action-buttons">
                <button v-if="deviation.status !== 'IN_PROGRESS'" class="btn btn-sm btn-secondary" @click="updateStatus('IN_PROGRESS')">{{ t('In Progress') }}</button>
                <button v-if="deviation.status !== 'RESOLVED'" class="btn btn-sm btn-primary" @click="updateStatus('RESOLVED')">{{ t('Resolve') }}</button>
                <button v-if="deviation.status !== 'CLOSED'" class="btn btn-sm btn-secondary" @click="updateStatus('CLOSED')">{{ t('Close') }}</button>
                <button v-if="deviation.status !== 'OPEN'" class="btn btn-sm btn-secondary" @click="updateStatus('OPEN')">{{ t('Reopen') }}</button>
              </div>
            </div>
            <div class="action-row">
              <label class="form-label">{{ t('Assign To') }}</label>
              <select class="form-select" @change="assign(Number(($event.target as HTMLSelectElement).value) || undefined)">
                <option value="">{{ t('Unassigned') }}</option>
                <option v-for="u in users" :key="u.id" :value="u.id" :selected="u.username === deviation.assignedToUsername">
                  {{ u.firstName ? u.firstName + ' ' + u.lastName : u.username }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Comments -->
        <div class="card comments-section">
          <h2>Comments ({{ deviation.comments.length }})</h2>
          <div v-if="deviation.comments.length === 0" class="text-muted text-sm">{{ t('No comments yet.') }}</div>
          <div v-for="c in deviation.comments" :key="c.id" class="comment">
            <div class="comment-header">
              <strong>{{ c.authorUsername }}</strong>
              <span class="text-muted text-sm">{{ formatDate(c.createdAt) }}</span>
            </div>
            <p>{{ c.content }}</p>
          </div>
          <form @submit.prevent="addComment" class="comment-form">
            <div v-if="commentError" class="alert-error">{{ commentError }}</div>
            <textarea v-model="newComment" class="form-textarea" rows="2" :placeholder="t('Add a comment...')" required />
            <button type="submit" class="btn btn-primary btn-sm" :disabled="submittingComment">
              {{ submittingComment ? t('Posting...') : t('Post Comment') }}
            </button>
          </form>
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
.comments-section h2 {
  margin-bottom: 16px;
}
.comment {
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
}
.comment:last-of-type {
  border-bottom: none;
}
.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.comment p {
  color: var(--text-h);
  white-space: pre-wrap;
}
.comment-form {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
}
.comment-form .form-textarea {
  width: 100%;
}
</style>
