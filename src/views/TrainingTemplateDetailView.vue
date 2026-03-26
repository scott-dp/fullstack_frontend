<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { trainingApi, type TrainingTemplate } from '@/api/trainings'
import { useAuthStore } from '@/stores/auth'
import { HttpError } from '@/api/client'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const template = ref<TrainingTemplate | null>(null)
const loading = ref(true)
const error = ref('')

const templateId = computed(() => Number(route.params.id))

onMounted(async () => {
  try {
    template.value = await trainingApi.getTemplate(templateId.value)
  } catch (err: unknown) {
    error.value = err instanceof HttpError ? err.message : 'Failed to load training template'
  } finally {
    loading.value = false
  }
})

function moduleLabel(mt: string) {
  if (mt === 'IK_MAT') return 'IK-Mat'
  if (mt === 'IK_ALKOHOL') return 'IK-Alkohol'
  return 'Shared'
}

function prettyEnum(value: string) {
  return value.replace(/_/g, ' ')
}
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <h1>{{ template?.title || 'Training Template' }}</h1>
        <p v-if="template" class="text-muted">
          {{ moduleLabel(template.moduleType) }} · {{ prettyEnum(template.category) }}
        </p>
      </div>
      <div class="actions">
        <button type="button" class="btn btn-secondary" @click="router.push('/app/training')">Back</button>
        <router-link
          v-if="auth.hasManageAccess && template"
          :to="`/app/training/templates/${template.id}/assign`"
          class="btn btn-primary"
        >
          Assign Training
        </router-link>
      </div>
    </div>

    <div v-if="loading" class="loading"><div class="spinner" /></div>

    <div v-else-if="error" class="card">
      <div class="alert-error">{{ error }}</div>
    </div>

    <div v-else-if="template" class="template-layout">
      <section class="card">
        <div class="badges">
          <span class="status-badge info">{{ moduleLabel(template.moduleType) }}</span>
          <span class="status-badge">{{ prettyEnum(template.requiredForRole) }}</span>
          <span v-if="template.isMandatory" class="status-badge danger">Mandatory</span>
          <span class="status-badge" :class="template.active ? 'success' : 'warning'">
            {{ template.active ? 'Active' : 'Inactive' }}
          </span>
        </div>

        <div class="section">
          <h3>Description</h3>
          <p class="text-muted">{{ template.description || 'No description provided.' }}</p>
        </div>

        <div class="section">
          <h3>Training Content</h3>
          <p class="content">{{ template.contentText || 'No training content added yet.' }}</p>
        </div>
      </section>

      <aside class="card meta-card">
        <h3>Template Details</h3>
        <dl class="meta-list">
          <div>
            <dt>Category</dt>
            <dd>{{ prettyEnum(template.category) }}</dd>
          </div>
          <div>
            <dt>Validity</dt>
            <dd>{{ template.validityDays ? `${template.validityDays} days` : 'No expiry' }}</dd>
          </div>
          <div>
            <dt>Acknowledgment</dt>
            <dd>{{ template.acknowledgmentRequired ? 'Required' : 'Not required' }}</dd>
          </div>
          <div>
            <dt>Linked Routine</dt>
            <dd>{{ template.linkedRoutineId ?? 'None' }}</dd>
          </div>
          <div>
            <dt>Created</dt>
            <dd>{{ new Date(template.createdAt).toLocaleString() }}</dd>
          </div>
          <div>
            <dt>Updated</dt>
            <dd>{{ new Date(template.updatedAt).toLocaleString() }}</dd>
          </div>
        </dl>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.template-layout {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(260px, 1fr);
  gap: 16px;
}

.badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.section + .section {
  margin-top: 20px;
}

.content {
  white-space: pre-wrap;
  line-height: 1.6;
}

.meta-card h3 {
  margin-bottom: 12px;
}

.meta-list {
  display: grid;
  gap: 12px;
}

.meta-list dt {
  font-size: 12px;
  color: var(--text);
  margin-bottom: 4px;
}

.meta-list dd {
  margin: 0;
  font-weight: 600;
}

.alert-error {
  padding: 10px 14px;
  background: var(--danger-bg);
  color: var(--danger);
  border-radius: var(--radius);
}

@media (max-width: 900px) {
  .template-layout {
    grid-template-columns: 1fr;
  }
}
</style>
