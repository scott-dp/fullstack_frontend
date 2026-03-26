<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { routineApi, type Routine, type RoutineReview } from '@/api/routines'
import { useAuthStore } from '@/stores/auth'
import { HttpError } from '@/api/client'

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
    error.value = err instanceof HttpError ? err.message : 'Failed to load routine'
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
    error.value = err instanceof HttpError ? err.message : 'Failed to review routine'
  } finally {
    reviewing.value = false
  }
}

async function handleArchive() {
  archiving.value = true
  try {
    routine.value = await routineApi.archive(id.value)
  } catch (err: unknown) {
    error.value = err instanceof HttpError ? err.message : 'Failed to archive routine'
  } finally {
    archiving.value = false
  }
}

async function handleUnarchive() {
  archiving.value = true
  try {
    routine.value = await routineApi.unarchive(id.value)
  } catch (err: unknown) {
    error.value = err instanceof HttpError ? err.message : 'Failed to unarchive routine'
  } finally {
    archiving.value = false
  }
}

async function handleDelete() {
  if (!window.confirm('Delete this routine? This cannot be undone.')) return
  deleting.value = true
  try {
    await routineApi.delete(id.value)
    router.push('/app/routines')
  } catch (err: unknown) {
    error.value = err instanceof HttpError ? err.message : 'Failed to delete routine'
  } finally {
    deleting.value = false
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString()
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString()
}

function moduleLabel(mt: string) {
  if (mt === 'IK_MAT') return 'IK-Mat'
  if (mt === 'IK_ALKOHOL') return 'IK-Alkohol'
  return 'Shared'
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>Routine Details</h1>
      <div v-if="routine && auth.hasManageAccess" style="display: flex; gap: 8px;">
        <router-link :to="`/app/routines/${id}/edit`" class="btn btn-secondary">Edit</router-link>
        <button v-if="routine.active" class="btn btn-warning" :disabled="archiving" @click="handleArchive">
          {{ archiving ? 'Archiving...' : 'Archive' }}
        </button>
        <button v-else class="btn btn-primary" :disabled="archiving" @click="handleUnarchive">
          {{ archiving ? 'Restoring...' : 'Unarchive' }}
        </button>
        <button class="btn btn-danger" :disabled="deleting" @click="handleDelete">
          {{ deleting ? 'Deleting...' : 'Delete' }}
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
            <span class="status-badge">{{ routine.category.replace(/_/g, ' ') }}</span>
            <span class="status-badge" :class="routine.active ? 'success' : 'warning'">
              {{ routine.active ? 'Active' : 'Archived' }}
            </span>
            <span v-if="isOverdueForReview" class="status-badge danger">Review overdue</span>
            <span class="text-muted text-sm">v{{ routine.versionNumber }}</span>
          </div>

          <div class="detail-fields">
            <div class="detail-field">
              <span class="field-label">Responsible</span>
              <span>{{ routine.responsibleRole }}</span>
            </div>
            <div class="detail-field">
              <span class="field-label">Frequency</span>
              <span>{{ routine.frequencyType.replace(/_/g, ' ') }}</span>
            </div>
            <div class="detail-field">
              <span class="field-label">Review Interval</span>
              <span>{{ routine.reviewIntervalDays ? routine.reviewIntervalDays + ' days' : 'Not set' }}</span>
            </div>
            <div class="detail-field">
              <span class="field-label">Last Reviewed</span>
              <span>{{ routine.lastReviewedAt ? formatDate(routine.lastReviewedAt) : 'Never' }}</span>
            </div>
            <div class="detail-field">
              <span class="field-label">Created By</span>
              <span>{{ routine.createdByUsername || '-' }}</span>
            </div>
            <div class="detail-field">
              <span class="field-label">Created</span>
              <span>{{ formatDate(routine.createdAt) }}</span>
            </div>
          </div>

          <div v-if="routine.description" class="detail-section">
            <h3>Description</h3>
            <p class="preformatted">{{ routine.description }}</p>
          </div>

          <div v-if="routine.purpose" class="detail-section">
            <h3>Purpose</h3>
            <p class="preformatted">{{ routine.purpose }}</p>
          </div>

          <div v-if="routine.stepsText" class="detail-section">
            <h3>Steps</h3>
            <p class="preformatted">{{ routine.stepsText }}</p>
          </div>

          <div v-if="routine.whatIsDeviationText" class="detail-section">
            <h3>What Counts as a Deviation</h3>
            <p class="preformatted">{{ routine.whatIsDeviationText }}</p>
          </div>

          <div v-if="routine.correctiveActionText" class="detail-section">
            <h3>Corrective Action</h3>
            <p class="preformatted">{{ routine.correctiveActionText }}</p>
          </div>

          <div v-if="routine.requiredEvidenceText" class="detail-section">
            <h3>Required Evidence</h3>
            <p class="preformatted">{{ routine.requiredEvidenceText }}</p>
          </div>
        </div>

        <div class="sidebar-panel">
          <div v-if="auth.hasManageAccess && routine.active" class="card review-card">
            <h3>Review Routine</h3>
            <div class="form-group">
              <textarea v-model="reviewNotes" class="form-textarea" rows="3" placeholder="Review notes (optional)..." />
            </div>
            <button class="btn btn-primary" :disabled="reviewing" @click="handleReview">
              {{ reviewing ? 'Submitting...' : 'Submit Review' }}
            </button>
          </div>

          <div class="card">
            <h3>Review History</h3>
            <div v-if="reviews.length === 0" class="text-muted text-sm" style="padding: 8px 0;">
              No reviews yet.
            </div>
            <div v-for="rev in reviews" :key="rev.id" class="review-item">
              <div class="review-meta">
                <strong>{{ rev.reviewedByUsername }}</strong>
                <span class="text-muted text-sm">{{ formatDateTime(rev.reviewedAt) }}</span>
              </div>
              <p v-if="rev.notes" class="text-sm">{{ rev.notes }}</p>
              <p v-if="rev.nextReviewAt" class="text-muted text-sm">Next review: {{ formatDate(rev.nextReviewAt) }}</p>
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
