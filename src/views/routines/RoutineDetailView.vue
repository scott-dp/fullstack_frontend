<!-- Routine detail page showing ownership, review history, and archive controls. -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { routineApi, type Routine, type RoutineReview } from '@/api/operations/routines.ts'
import { useAuthStore } from '@/stores/auth.ts'
import { getErrorMessage } from '@/api/core/client.ts'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const routine = ref<Routine | null>(null)
const reviews = ref<RoutineReview[]>([])
const loading = ref(true)
const error = ref('')
const reviewNotes = ref('')
const reviewing = ref(false)
const archiving = ref(false)
const deleting = ref(false)
const { t, locale } = useI18n()

const id = computed(() => Number(route.params.id))

const isOverdueForReview = computed(() => {
  if (!routine.value || !routine.value.reviewIntervalDays || !routine.value.active) return false
  if (!routine.value.lastReviewedAt) return true
  const lastReview = new Date(routine.value.lastReviewedAt)
  const dueDate = new Date(lastReview.getTime() + routine.value.reviewIntervalDays * 86400000)
  return dueDate < new Date()
})

onMounted(async () => {
  try {
    const [r, h] = await Promise.all([
      routineApi.get(id.value),
      routineApi.history(id.value),
    ])
    routine.value = r
    reviews.value = h
  } catch (err: unknown) {
    error.value = getErrorMessage(err, {
      defaultMessage: t('Failed to load routine'),
      byStatus: {
        400: t('The routine could not be loaded.'),
      },
    })
  } finally {
    loading.value = false
  }
})

async function handleReview() {
  reviewing.value = true
  error.value = ''
  try {
    const review = await routineApi.review(id.value, reviewNotes.value)
    reviews.value.unshift(review)
    routine.value = await routineApi.get(id.value)
    reviewNotes.value = ''
  } catch (err: unknown) {
    error.value = getErrorMessage(err, {
      defaultMessage: t('Failed to review routine'),
      byStatus: {
        400: t('The routine review could not be submitted.'),
        403: t('You do not have permission to review this routine.'),
      },
    })
  } finally {
    reviewing.value = false
  }
}

async function handleArchive() {
  archiving.value = true
  try {
    routine.value = await routineApi.archive(id.value)
  } catch (err: unknown) {
    error.value = getErrorMessage(err, {
      defaultMessage: t('Failed to archive routine'),
      byStatus: {
        400: t('The routine could not be archived.'),
        403: t('You do not have permission to archive this routine.'),
      },
    })
  } finally {
    archiving.value = false
  }
}

async function handleUnarchive() {
  archiving.value = true
  try {
    routine.value = await routineApi.unarchive(id.value)
  } catch (err: unknown) {
    error.value = getErrorMessage(err, {
      defaultMessage: t('Failed to unarchive routine'),
      byStatus: {
        400: t('The routine could not be restored.'),
        403: t('You do not have permission to restore this routine.'),
      },
    })
  } finally {
    archiving.value = false
  }
}

async function handleDelete() {
  if (!window.confirm(t('Delete this routine? This cannot be undone.'))) return
  deleting.value = true
  try {
    await routineApi.delete(id.value)
    router.push('/app/routines')
  } catch (err: unknown) {
    error.value = getErrorMessage(err, {
      defaultMessage: t('Failed to delete routine'),
      byStatus: {
        400: t('The routine could not be deleted.'),
        403: t('You do not have permission to delete this routine.'),
      },
    })
  } finally {
    deleting.value = false
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(locale.value)
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(locale.value)
}

function moduleLabel(mt: string) {
  if (mt === 'IK_MAT') return t('IK-Mat')
  if (mt === 'IK_ALKOHOL') return t('IK-Alkohol')
  return t('Shared')
}

function categoryLabel(category: string) {
  const labels: Record<string, string> = {
    HYGIENE: t('Hygiene'),
    CLEANING: t('Cleaning'),
    TEMPERATURE: t('Temperature'),
    TRACEABILITY: t('Traceability'),
    ALLERGENS: t('Allergens'),
    HACCP: t('HACCP'),
    AGE_CONTROL: t('Age Control'),
    INTOXICATION: t('Intoxication'),
    CLOSING: t('Closing'),
    BYO_CONTROL: t('BYO Control'),
    LICENSE_CONDITIONS: t('License Conditions'),
    SECURITY: t('Security'),
    OTHER: t('Other'),
  }
  return labels[category] ?? category.replace(/_/g, ' ')
}

function responsibleLabel(role: string) {
  const labels: Record<string, string> = {
    ADMIN: t('Admin'),
    MANAGER: t('Manager'),
    STAFF: t('Staff'),
    ALL: t('All'),
  }
  return labels[role] ?? role
}

function frequencyLabel(frequency: string) {
  const labels: Record<string, string> = {
    NONE: t('None'),
    DAILY: t('Daily'),
    WEEKLY: t('Weekly'),
    MONTHLY: t('Monthly'),
    SHIFT_BASED: t('Shift-Based'),
    EVENT_BASED: t('Event-Based'),
  }
  return labels[frequency] ?? frequency.replace(/_/g, ' ')
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>{{ t('Routine Details') }}</h1>
      <div v-if="routine && auth.hasManageAccess" style="display: flex; gap: 8px;">
        <router-link :to="`/app/routines/${id}/edit`" class="btn btn-secondary">{{ t('Edit') }}</router-link>
        <button v-if="routine.active" class="btn btn-warning" :disabled="archiving" @click="handleArchive">
          {{ archiving ? t('Archiving...') : t('Archive') }}
        </button>
        <button v-else class="btn btn-primary" :disabled="archiving" @click="handleUnarchive">
          {{ archiving ? t('Restoring...') : t('Unarchive') }}
        </button>
        <button class="btn btn-danger" :disabled="deleting" @click="handleDelete">
          {{ deleting ? t('Deleting...') : t('Delete') }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading"><div class="spinner" /></div>

    <div v-else-if="error && !routine" class="alert-error">{{ error }}</div>

    <template v-else-if="routine">
      <div v-if="error" class="alert-error" style="margin-bottom: 16px;">{{ error }}</div>

      <div class="detail-grid">
        <div class="card detail-card">
          <h2>{{ routine.name }}</h2>
          <div class="meta-badges">
            <span class="status-badge info">{{ moduleLabel(routine.moduleType) }}</span>
            <span class="status-badge">{{ categoryLabel(routine.category) }}</span>
            <span class="status-badge" :class="routine.active ? 'success' : 'warning'">
              {{ routine.active ? t('Active') : t('Archived') }}
            </span>
            <span v-if="isOverdueForReview" class="status-badge danger">{{ t('Review overdue') }}</span>
            <span class="text-muted text-sm">v{{ routine.versionNumber }}</span>
          </div>

          <div class="detail-fields">
            <div class="detail-field">
              <span class="field-label">{{ t('Responsible') }}</span>
              <span>{{ responsibleLabel(routine.responsibleRole) }}</span>
            </div>
            <div class="detail-field">
              <span class="field-label">{{ t('Frequency') }}</span>
              <span>{{ frequencyLabel(routine.frequencyType) }}</span>
            </div>
            <div class="detail-field">
              <span class="field-label">{{ t('Review Interval') }}</span>
              <span>{{ routine.reviewIntervalDays ? routine.reviewIntervalDays + ' ' + t('days') : t('Not set') }}</span>
            </div>
            <div class="detail-field">
              <span class="field-label">{{ t('Last Reviewed') }}</span>
              <span>{{ routine.lastReviewedAt ? formatDate(routine.lastReviewedAt) : t('Never') }}</span>
            </div>
            <div class="detail-field">
              <span class="field-label">{{ t('Created By') }}</span>
              <span>{{ routine.createdByUsername || '-' }}</span>
            </div>
            <div class="detail-field">
              <span class="field-label">{{ t('Created') }}</span>
              <span>{{ formatDate(routine.createdAt) }}</span>
            </div>
          </div>

          <div v-if="routine.description" class="detail-section">
            <h3>{{ t('Description') }}</h3>
            <p class="preformatted">{{ routine.description }}</p>
          </div>

          <div v-if="routine.purpose" class="detail-section">
            <h3>{{ t('Purpose') }}</h3>
            <p class="preformatted">{{ routine.purpose }}</p>
          </div>

          <div v-if="routine.stepsText" class="detail-section">
            <h3>{{ t('Steps') }}</h3>
            <p class="preformatted">{{ routine.stepsText }}</p>
          </div>

          <div v-if="routine.whatIsDeviationText" class="detail-section">
            <h3>{{ t('What Counts as a Deviation') }}</h3>
            <p class="preformatted">{{ routine.whatIsDeviationText }}</p>
          </div>

          <div v-if="routine.correctiveActionText" class="detail-section">
            <h3>{{ t('Corrective Action') }}</h3>
            <p class="preformatted">{{ routine.correctiveActionText }}</p>
          </div>

          <div v-if="routine.requiredEvidenceText" class="detail-section">
            <h3>{{ t('Required Evidence') }}</h3>
            <p class="preformatted">{{ routine.requiredEvidenceText }}</p>
          </div>
        </div>

        <div class="sidebar-panel">
          <div v-if="auth.hasManageAccess && routine.active" class="card review-card">
            <h3>{{ t('Review Routine') }}</h3>
            <div class="form-group">
              <textarea v-model="reviewNotes" class="form-textarea" rows="3" :placeholder="t('Review notes (optional)...')" />
            </div>
            <button class="btn btn-primary" :disabled="reviewing" @click="handleReview">
              {{ reviewing ? t('Submitting...') : t('Submit Review') }}
            </button>
          </div>

          <div class="card">
            <h3>{{ t('Review History') }}</h3>
            <div v-if="reviews.length === 0" class="text-muted text-sm" style="padding: 8px 0;">
              {{ t('No reviews yet.') }}
            </div>
            <div v-for="rev in reviews" :key="rev.id" class="review-item">
              <div class="review-meta">
                <strong>{{ rev.reviewedByUsername }}</strong>
                <span class="text-muted text-sm">{{ formatDateTime(rev.reviewedAt) }}</span>
              </div>
              <p v-if="rev.notes" class="text-sm">{{ rev.notes }}</p>
              <p v-if="rev.nextReviewAt" class="text-muted text-sm">{{ t('Next review:') }} {{ formatDate(rev.nextReviewAt) }}</p>
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
  grid-template-columns: 1fr 340px;
  gap: 20px;
  align-items: start;
}
.meta-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
  margin: 12px 0 20px;
}
.detail-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 24px;
  margin-bottom: 20px;
}
.detail-field {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.field-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.detail-section {
  margin-bottom: 16px;
}
.detail-section h3 {
  font-size: 14px;
  margin-bottom: 6px;
  color: var(--text-h);
}
.preformatted {
  white-space: pre-wrap;
  font-size: 14px;
  line-height: 1.6;
}
.sidebar-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.review-card h3 {
  margin-bottom: 12px;
}
.review-item {
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
}
.review-item:last-child {
  border-bottom: none;
}
.review-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.btn-danger {
  background: var(--danger);
  color: white;
  border: none;
}
.btn-warning {
  background: var(--warning, #b45309);
  color: white;
  border: none;
}
.btn-danger:hover {
  opacity: 0.9;
}
.btn-warning:hover {
  opacity: 0.9;
}
@media (max-width: 768px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
  .detail-fields {
    grid-template-columns: 1fr;
  }
}
</style>
