<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { deviationApi, type Deviation } from '@/api/deviations'
import { userApi, type UserSummary } from '@/api/users'
import { HttpError } from '@/api/client'

const route = useRoute()
const auth = useAuthStore()
const deviationId = Number(route.params.id)

const deviation = ref<Deviation | null>(null)
const users = ref<UserSummary[]>([])
const loading = ref(true)
const newComment = ref('')
const commentError = ref('')
const updateError = ref('')
const submittingComment = ref(false)

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

async function updateStatus(newStatus: string) {
  updateError.value = ''
  try {
    deviation.value = await deviationApi.update(deviationId, { status: newStatus })
  } catch (err: unknown) {
    updateError.value = err instanceof HttpError ? err.message : 'Update failed'
  }
}

async function assign(userId: number | undefined) {
  updateError.value = ''
  try {
    deviation.value = await deviationApi.update(deviationId, { assignedToId: userId })
  } catch (err: unknown) {
    updateError.value = err instanceof HttpError ? err.message : 'Assignment failed'
  }
}

async function addComment() {
  if (!newComment.value.trim()) return
  commentError.value = ''
  submittingComment.value = true
  try {
    const comment = await deviationApi.addComment(deviationId, newComment.value)
    deviation.value?.comments.push(comment)
    newComment.value = ''
  } catch (err: unknown) {
    commentError.value = err instanceof HttpError ? err.message : 'Failed to add comment'
  } finally {
    submittingComment.value = false
  }
}

function severityClass(s: string) {
  if (s === 'CRITICAL' || s === 'HIGH') return 'danger'
  if (s === 'MEDIUM') return 'warning'
  return 'info'
}

function statusClass(s: string) {
  if (s === 'CLOSED' || s === 'RESOLVED') return 'success'
  if (s === 'IN_PROGRESS') return 'info'
  return 'warning'
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString()
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1 v-if="deviation">{{ deviation.title }}</h1>
      <router-link to="/deviations" class="btn btn-secondary">Back</router-link>
    </div>

    <div v-if="loading" class="loading"><div class="spinner" /></div>

    <template v-else-if="deviation">
      <div class="detail-grid">
        <div class="card detail-main">
          <div class="meta-row">
            <span class="status-badge" :class="severityClass(deviation.severity)">{{ deviation.severity }}</span>
            <span class="status-badge" :class="statusClass(deviation.status)">{{ deviation.status.replace('_', ' ') }}</span>
            <span class="status-badge" :class="deviation.category === 'FOOD' ? 'success' : 'warning'">
              {{ deviation.category === 'FOOD' ? 'IK-Mat' : 'IK-Alkohol' }}
            </span>
          </div>
          <p class="description">{{ deviation.description }}</p>
          <div class="info-grid">
            <div><span class="info-label">Reported by</span><span>{{ deviation.reportedByUsername }}</span></div>
            <div><span class="info-label">Assigned to</span><span>{{ deviation.assignedToUsername || 'Unassigned' }}</span></div>
            <div><span class="info-label">Created</span><span>{{ formatDate(deviation.createdAt) }}</span></div>
            <div v-if="deviation.resolvedAt"><span class="info-label">Resolved</span><span>{{ formatDate(deviation.resolvedAt) }} by {{ deviation.resolvedByUsername }}</span></div>
          </div>

          <!-- Manager/Admin actions -->
          <div v-if="auth.hasManageAccess" class="actions-section">
            <div v-if="updateError" class="alert-error">{{ updateError }}</div>
            <div class="action-row">
              <label class="form-label">Update Status</label>
              <div class="action-buttons">
                <button v-if="deviation.status !== 'IN_PROGRESS'" class="btn btn-sm btn-secondary" @click="updateStatus('IN_PROGRESS')">In Progress</button>
                <button v-if="deviation.status !== 'RESOLVED'" class="btn btn-sm btn-primary" @click="updateStatus('RESOLVED')">Resolve</button>
                <button v-if="deviation.status !== 'CLOSED'" class="btn btn-sm btn-secondary" @click="updateStatus('CLOSED')">Close</button>
                <button v-if="deviation.status !== 'OPEN'" class="btn btn-sm btn-secondary" @click="updateStatus('OPEN')">Reopen</button>
              </div>
            </div>
            <div class="action-row">
              <label class="form-label">Assign To</label>
              <select class="form-select" @change="assign(Number(($event.target as HTMLSelectElement).value) || undefined)">
                <option value="">Unassigned</option>
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
          <div v-if="deviation.comments.length === 0" class="text-muted text-sm">No comments yet.</div>
          <div v-for="c in deviation.comments" :key="c.id" class="comment">
            <div class="comment-header">
              <strong>{{ c.authorUsername }}</strong>
              <span class="text-muted text-sm">{{ formatDate(c.createdAt) }}</span>
            </div>
            <p>{{ c.content }}</p>
          </div>
          <form @submit.prevent="addComment" class="comment-form">
            <div v-if="commentError" class="alert-error">{{ commentError }}</div>
            <textarea v-model="newComment" class="form-textarea" rows="2" placeholder="Add a comment..." required />
            <button type="submit" class="btn btn-primary btn-sm" :disabled="submittingComment">
              {{ submittingComment ? 'Posting...' : 'Post Comment' }}
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
