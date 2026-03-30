<script setup lang="ts">
/**
 * Checklists view listing all checklist templates with category filtering.
 * Managers and admins can create new templates via an inline form.
 * Each template card links to its completion page.
 */
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth.ts'
import { checklistApi, type ChecklistTemplate, type CreateTemplateRequest } from '@/api/operations/checklists.ts'
import { getErrorMessage } from '@/api/core/client.ts'

const auth = useAuthStore()
/** All checklist templates loaded from the server. */
const templates = ref<ChecklistTemplate[]>([])
/** Whether templates are still being fetched. */
const loading = ref(true)
/** Currently selected category filter value, empty string for all. */
const categoryFilter = ref('')
/** Whether the template creation form is visible. */
const showCreateForm = ref(false)
/** Error message from the last create attempt. */
const error = ref('')
const { t } = useI18n()

/** New template title (create form). */
const newTitle = ref('')
/** New template description (create form). */
const newDescription = ref('')
/** New template frequency (create form). */
const newFrequency = ref('DAILY')
/** New template category (create form). */
const newCategory = ref('FOOD')
/** New template items list (create form). */
const newItems = ref<{ description: string; requiresComment: boolean }[]>([
  { description: '', requiresComment: false },
])

/** Templates filtered by the selected category. */
const filtered = computed(() => {
  if (!categoryFilter.value) return templates.value
  return templates.value.filter((t: ChecklistTemplate) => t.category === categoryFilter.value)
})

onMounted(async () => {
  try {
    templates.value = await checklistApi.listTemplates()
  } finally {
    loading.value = false
  }
})

/** Appends a blank item row to the create form. */
function addItem() {
  newItems.value.push({ description: '', requiresComment: false })
}

/**
 * Removes an item row from the create form by index.
 * Prevents removal of the last remaining item.
 * @param index - Zero-based index of the item to remove
 */
function removeItem(index: number) {
  if (newItems.value.length > 1) {
    newItems.value.splice(index, 1)
  }
}

/**
 * Validates and submits the create template form.
 * On success prepends the new template to the list and resets the form.
 */
async function createTemplate() {
  error.value = ''
  const validItems = newItems.value.filter((i: { description: string; requiresComment: boolean }) => i.description.trim())
  if (!newTitle.value.trim() || validItems.length === 0) {
    error.value = t('Title and at least one item are required')
    return
  }
  try {
    const request: CreateTemplateRequest = {
      title: newTitle.value,
      description: newDescription.value || undefined,
      frequency: newFrequency.value,
      category: newCategory.value,
      items: validItems.map((item, i) => ({
        description: item.description,
        sortOrder: i,
        requiresComment: item.requiresComment,
      })),
    }
    const created = await checklistApi.createTemplate(request)
    templates.value.unshift(created)
    showCreateForm.value = false
    newTitle.value = ''
    newDescription.value = ''
    newItems.value = [{ description: '', requiresComment: false }]
  } catch (err: unknown) {
    error.value = getErrorMessage(err, {
      defaultMessage: t('Failed to create template'),
      byStatus: {
        400: t('Please check the template details and try again'),
        403: t('You do not have permission to create checklist templates'),
      },
    })
  }
}

/**
 * Converts a frequency enum value to a human-readable label.
 * @param f - Frequency string (e.g. "DAILY")
 * @returns Title-cased label (e.g. "Daily")
 */
function frequencyLabel(f: string) {
  const labels: Record<string, string> = {
    DAILY: t('Daily'),
    WEEKLY: t('Weekly'),
    MONTHLY: t('Monthly'),
  }
  return labels[f] ?? f
}

/**
 * Converts a category enum value to its Norwegian display label.
 * @param c - Category string (FOOD or ALCOHOL)
 * @returns Display label ("IK-Mat" or "IK-Alkohol")
 */
function categoryLabel(c: string) {
  return c === 'FOOD' ? t('IK-Mat') : t('IK-Alkohol')
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>{{ t('Checklists') }}</h1>
      <button v-if="auth.hasManageAccess" class="btn btn-primary" @click="showCreateForm = !showCreateForm">
        {{ showCreateForm ? t('Cancel') : t('New Template') }}
      </button>
    </div>

    <!-- Create Form -->
    <div v-if="showCreateForm" class="card create-form">
      <h2>{{ t('Create Checklist Template') }}</h2>
      <div v-if="error" class="alert-error">{{ error }}</div>
      <form @submit.prevent="createTemplate">
        <div class="form-row">
          <div class="form-group flex-1">
            <label class="form-label">{{ t('Title') }}</label>
            <input v-model="newTitle" class="form-input" required />
          </div>
          <div class="form-group">
            <label class="form-label">{{ t('Frequency') }}</label>
            <select v-model="newFrequency" class="form-select">
              <option value="DAILY">{{ t('Daily') }}</option>
              <option value="WEEKLY">{{ t('Weekly') }}</option>
              <option value="MONTHLY">{{ t('Monthly') }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">{{ t('Category') }}</label>
            <select v-model="newCategory" class="form-select">
              <option value="FOOD">{{ t('IK-Mat (Food)') }}</option>
              <option value="ALCOHOL">{{ t('IK-Alkohol') }}</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">{{ t('Description (optional)') }}</label>
          <textarea v-model="newDescription" class="form-textarea" rows="2" />
        </div>
        <div class="form-group">
          <label class="form-label">{{ t('Checklist Items') }}</label>
          <div v-for="(item, i) in newItems" :key="i" class="item-row">
            <input v-model="item.description" class="form-input" :placeholder="`${t('Item')} ${i + 1}`" />
            <label class="checkbox-label">
              <input type="checkbox" v-model="item.requiresComment" />
              {{ t('Comment required') }}
            </label>
            <button type="button" class="btn btn-sm btn-danger" @click="removeItem(i)" :disabled="newItems.length <= 1">{{ t('Remove') }}</button>
          </div>
          <button type="button" class="btn btn-sm btn-secondary" @click="addItem">{{ t('Add Item') }}</button>
        </div>
        <button type="submit" class="btn btn-primary">{{ t('Create Template') }}</button>
      </form>
    </div>

    <!-- Filters -->
    <div class="filter-bar">
      <select v-model="categoryFilter" class="form-select">
        <option value="">{{ t('All Categories') }}</option>
        <option value="FOOD">{{ t('IK-Mat (Food)') }}</option>
        <option value="ALCOHOL">{{ t('IK-Alkohol') }}</option>
      </select>
    </div>

    <div v-if="loading" class="loading"><div class="spinner" /></div>

    <div v-else-if="filtered.length === 0" class="empty-state">
      <h3>{{ t('No checklists found') }}</h3>
      <p>{{ auth.hasManageAccess ? t('Create your first checklist template to get started.') : t('No checklists have been created yet.') }}</p>
    </div>

    <div v-else class="templates-grid">
      <div v-for="template in filtered" :key="template.id" class="card template-card">
        <div class="template-header">
          <h3>{{ template.title }}</h3>
          <div class="template-tags">
            <span class="status-badge info">{{ frequencyLabel(template.frequency) }}</span>
            <span class="status-badge" :class="template.category === 'FOOD' ? 'success' : 'warning'">
              {{ categoryLabel(template.category) }}
            </span>
          </div>
        </div>
        <p v-if="template.description" class="text-muted text-sm">{{ template.description }}</p>
        <p class="text-sm text-muted">{{ template.items.length }} {{ t('items') }}</p>
        <div class="template-actions">
          <router-link :to="`/app/checklists/${template.id}/complete`" class="btn btn-primary btn-sm">{{ t('Complete') }}</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.create-form {
  margin-bottom: 24px;
}
.create-form h2 {
  margin-bottom: 16px;
}
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
.flex-1 {
  flex: 1;
  min-width: 200px;
}
.item-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}
.item-row .form-input {
  flex: 1;
}
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  white-space: nowrap;
  color: var(--text);
}
.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}
.template-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.template-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}
.template-header h3 {
  margin: 0;
}
.template-tags {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}
.template-actions {
  margin-top: auto;
  padding-top: 8px;
}
</style>
