<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { trainingApi, type TrainingTemplate } from '@/api/trainings'
import { userApi, type UserSummary } from '@/api/users'
import { HttpError } from '@/api/client'

const route = useRoute()
const router = useRouter()
const templateId = computed(() => Number(route.params.id))

const template = ref<TrainingTemplate | null>(null)
const users = ref<UserSummary[]>([])
const selectedUserIds = ref<number[]>([])
const dueAt = ref('')
const loading = ref(true)
const assigning = ref(false)
const error = ref('')
const success = ref('')
const { t } = useI18n()

onMounted(async () => {
  try {
    const [t, u] = await Promise.all([
      trainingApi.getTemplate(templateId.value),
      userApi.list(),
    ])
    template.value = t
    users.value = u
  } catch (err: unknown) {
    error.value = err instanceof HttpError ? err.message : t('Failed to load data')
  } finally {
    loading.value = false
  }
})

function toggleUser(id: number) {
  const idx = selectedUserIds.value.indexOf(id)
  if (idx >= 0) {
    selectedUserIds.value.splice(idx, 1)
  } else {
    selectedUserIds.value.push(id)
  }
}

function selectAll() {
  selectedUserIds.value = users.value.map(u => u.id)
}

function deselectAll() {
  selectedUserIds.value = []
}

async function handleAssign() {
  if (selectedUserIds.value.length === 0) {
    error.value = t('Select at least one user')
    return
  }
  error.value = ''
  success.value = ''
  assigning.value = true
  try {
    await trainingApi.assign(templateId.value, selectedUserIds.value, dueAt.value || undefined)
    success.value = t('Training assigned to {count} user(s)', { count: selectedUserIds.value.length })
    selectedUserIds.value = []
  } catch (err: unknown) {
    error.value = err instanceof HttpError ? err.message : t('Failed to assign training')
  } finally {
    assigning.value = false
  }
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>{{ t('Assign Training') }}</h1>
    </div>

    <div v-if="loading" class="loading"><div class="spinner" /></div>

    <template v-else-if="template">
      <div class="card" style="margin-bottom: 16px;">
        <h2>{{ template.title }}</h2>
        <p v-if="template.description" class="text-muted">{{ template.description }}</p>
      </div>

      <div class="card assign-form">
        <div v-if="error" class="alert-error">{{ error }}</div>
        <div v-if="success" class="alert-success">{{ success }}</div>

        <h3>{{ t('Select Users') }}</h3>
        <div class="user-actions">
          <button class="btn btn-sm btn-secondary" @click="selectAll">{{ t('Select All') }}</button>
          <button class="btn btn-sm btn-secondary" @click="deselectAll">{{ t('Deselect All') }}</button>
          <span class="text-muted text-sm">{{ t('{count} selected', { count: selectedUserIds.length }) }}</span>
        </div>

        <div class="user-list">
          <label v-for="u in users" :key="u.id" class="user-item" :class="{ selected: selectedUserIds.includes(u.id) }">
            <input type="checkbox" :checked="selectedUserIds.includes(u.id)" @change="toggleUser(u.id)" />
            <span>{{ u.username }}</span>
            <span v-if="u.firstName || u.lastName" class="text-muted text-sm">
              {{ [u.firstName, u.lastName].filter(Boolean).join(' ') }}
            </span>
          </label>
        </div>

        <div class="form-group" style="margin-top: 16px;">
          <label class="form-label">{{ t('Due Date (optional)') }}</label>
          <input v-model="dueAt" type="date" class="form-input" style="max-width: 200px;" />
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="router.push('/app/training')">{{ t('Cancel') }}</button>
          <button class="btn btn-primary" :disabled="assigning || selectedUserIds.length === 0" @click="handleAssign">
            {{ assigning ? t('Assigning...') : t('Assign to {count} user(s)', { count: selectedUserIds.length }) }}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.assign-form h3 {
  margin-bottom: 12px;
}
.user-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
}
.user-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 300px;
  overflow-y: auto;
}
.user-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}
.user-item:hover {
  background: var(--accent-bg);
}
.user-item.selected {
  background: var(--accent-bg);
}
.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 16px;
}
.alert-success {
  padding: 10px 14px;
  background: var(--success-bg);
  color: var(--success);
  border-radius: var(--radius);
  font-size: 14px;
  margin-bottom: 16px;
}
</style>
