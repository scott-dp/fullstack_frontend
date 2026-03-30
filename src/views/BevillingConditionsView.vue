<script setup lang="ts">
/**
 * Bevilling conditions management view allowing managers/admins to
 * add, edit, and toggle conditions on the active bevilling.
 */
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { bevillingApi, type Bevilling, type BevillingCondition } from '@/api/bevilling'
import { HttpError } from '@/api/client'

const route = useRoute()
const { t } = useI18n()
const bevillingId = Number(route.params.id)

/** The loaded bevilling. */
const bevilling = ref<Bevilling | null>(null)
/** Whether data is loading. */
const loading = ref(true)
/** Error messages. */
const error = ref('')
const formError = ref('')

// New condition form
const showNewForm = ref(false)
const newConditionType = ref('FOOD_REQUIREMENT')
const newTitle = ref('')
const newDescription = ref('')
const submitting = ref(false)

/** Condition types for the dropdown. */
const conditionTypes = [
  { value: 'SERVING_HOURS', label: 'Serving Hours' },
  { value: 'SECURITY_GUARD', label: 'Security Guard' },
  { value: 'FOOD_REQUIREMENT', label: 'Food Requirement' },
  { value: 'AREA_LIMITATION', label: 'Area Limitation' },
  { value: 'EVENT_LIMITATION', label: 'Event Limitation' },
  { value: 'TRAINING_REQUIREMENT', label: 'Training Requirement' },
  { value: 'OTHER', label: 'Other' },
]

onMounted(async () => {
  try {
    bevilling.value = await bevillingApi.get(bevillingId)
  } catch {
    error.value = t('Failed to load bevilling.')
  } finally {
    loading.value = false
  }
})

/** Adds a new condition to the bevilling. */
async function addCondition() {
  formError.value = ''
  submitting.value = true
  try {
    const newCond = await bevillingApi.addCondition(bevillingId, {
      conditionType: newConditionType.value,
      title: newTitle.value,
      description: newDescription.value || undefined,
    })
    bevilling.value?.conditions.push(newCond)
    showNewForm.value = false
    newTitle.value = ''
    newDescription.value = ''
    newConditionType.value = 'FOOD_REQUIREMENT'
  } catch (err: unknown) {
    formError.value = err instanceof HttpError ? err.message : t('Failed to add condition')
  } finally {
    submitting.value = false
  }
}

/** Toggles a condition's active status. */
async function toggleCondition(condition: BevillingCondition) {
  try {
    const updated = await bevillingApi.updateCondition(condition.id, {
      active: !condition.active,
    })
    const idx = bevilling.value?.conditions.findIndex(c => c.id === condition.id) ?? -1
    if (idx >= 0 && bevilling.value) {
      bevilling.value.conditions[idx] = updated
    }
  } catch (err: unknown) {
    error.value = err instanceof HttpError ? err.message : t('Failed to update condition')
  }
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>{{ t('Bevilling Conditions') }}</h1>
      <router-link to="/app/bevilling" class="btn btn-secondary">{{ t('Back') }}</router-link>
    </div>

    <div v-if="loading" class="loading"><div class="spinner" /></div>

    <div v-else-if="error" class="card">
      <div class="alert-error">{{ error }}</div>
    </div>

    <template v-else-if="bevilling">
      <div class="card">
        <div class="section-header">
          <h2>{{ t('Conditions') }} ({{ bevilling.conditions.length }})</h2>
          <button class="btn btn-primary btn-sm" @click="showNewForm = !showNewForm">
            {{ showNewForm ? t('Cancel') : t('Add Condition') }}
          </button>
        </div>

        <!-- New condition form -->
        <div v-if="showNewForm" class="new-form card">
          <div v-if="formError" class="alert-error">{{ formError }}</div>
          <form @submit.prevent="addCondition">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">{{ t('Type') }}</label>
                <select v-model="newConditionType" class="form-select" required>
                  <option v-for="ct in conditionTypes" :key="ct.value" :value="ct.value">{{ t(ct.label) }}</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">{{ t('Title') }}</label>
                <input v-model="newTitle" class="form-input" required :placeholder="t('Condition title')" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">{{ t('Description') }}</label>
              <textarea v-model="newDescription" class="form-textarea" rows="2" maxlength="2000" :placeholder="t('Detailed description (optional)')" />
            </div>
            <button type="submit" class="btn btn-primary btn-sm" :disabled="submitting">
              {{ submitting ? t('Adding...') : t('Add Condition') }}
            </button>
          </form>
        </div>

        <!-- Existing conditions -->
        <div v-if="bevilling.conditions.length === 0" class="text-muted text-sm">{{ t('No conditions registered yet.') }}</div>
        <div v-for="c in bevilling.conditions" :key="c.id" class="condition-item">
          <div class="condition-header">
            <div>
              <strong>{{ c.title }}</strong>
              <div class="condition-type">{{ t(c.conditionType.replace(/_/g, ' ')) }}</div>
            </div>
            <div class="condition-actions">
              <span class="status-badge" :class="c.active ? 'success' : 'danger'">{{ c.active ? t('Active') : t('Inactive') }}</span>
              <button class="btn btn-sm btn-secondary" @click="toggleCondition(c)">
                {{ c.active ? t('Deactivate') : t('Activate') }}
              </button>
            </div>
          </div>
          <p v-if="c.description" class="condition-desc">{{ c.description }}</p>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.section-header h2 {
  margin: 0;
}
.alert-error {
  padding: 10px 14px;
  background: var(--danger-bg);
  color: var(--danger);
  border-radius: var(--radius);
  font-size: 14px;
  margin-bottom: 12px;
}
.new-form {
  margin-bottom: 16px;
  padding: 16px;
  border: 1px solid var(--border);
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
.condition-item {
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
}
.condition-item:last-child {
  border-bottom: none;
}
.condition-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}
.condition-type {
  font-size: 12px;
  color: var(--text);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 2px;
}
.condition-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.condition-desc {
  color: var(--text-h);
  font-size: 14px;
  margin-top: 6px;
}
</style>
