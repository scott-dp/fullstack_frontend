<script setup lang="ts">
/**
 * Ingredient create/edit view with name, notes, and multi-select allergen checkboxes.
 * In edit mode, loads the existing ingredient from the route :id param.
 */
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { allergenApi, type Allergen } from '@/api/allergens'
import { HttpError } from '@/api/client'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

/** Ingredient ID from route params; null when creating a new ingredient. */
const ingredientId = computed(() => {
  const id = route.params.id
  return id ? Number(id) : null
})

/** Whether we are in edit mode (vs. create mode). */
const isEdit = computed(() => ingredientId.value !== null)

/** All available allergens for the checkbox list. */
const allergens = ref<Allergen[]>([])
/** Bound name input value. */
const name = ref('')
/** Bound notes textarea value. */
const notes = ref('')
/** Set of selected allergen IDs. */
const selectedAllergenIds = ref<Set<number>>(new Set())
/** Error message from the last submission attempt. */
const error = ref('')
/** Whether the form is currently being submitted. */
const submitting = ref(false)
const deleting = ref(false)
/** Whether data is still being loaded. */
const loading = ref(true)

onMounted(async () => {
  try {
    allergens.value = await allergenApi.listAllergens()
    if (isEdit.value && ingredientId.value) {
      const ingredient = await allergenApi.getIngredient(ingredientId.value)
      name.value = ingredient.name
      notes.value = ingredient.notes || ''
      selectedAllergenIds.value = new Set(ingredient.allergens.map((a) => a.id))
    }
  } finally {
    loading.value = false
  }
})

/**
 * Toggles an allergen in the selected set.
 * @param id - Allergen ID to toggle
 */
function toggleAllergen(id: number) {
  if (selectedAllergenIds.value.has(id)) {
    selectedAllergenIds.value.delete(id)
  } else {
    selectedAllergenIds.value.add(id)
  }
}

/**
 * Submits the ingredient form (create or update).
 * On success navigates back to the ingredients list.
 */
async function submit() {
  error.value = ''
  submitting.value = true
  try {
    const payload = {
      name: name.value,
      notes: notes.value || undefined,
      allergenIds: Array.from(selectedAllergenIds.value),
    }
    if (isEdit.value && ingredientId.value) {
      await allergenApi.updateIngredient(ingredientId.value, payload)
    } else {
      await allergenApi.createIngredient(payload)
    }
    router.push('/app/ingredients')
  } catch (err: unknown) {
    error.value = err instanceof HttpError ? err.message : t('Failed to save ingredient')
  } finally {
    submitting.value = false
  }
}

async function handleDelete() {
  if (!isEdit.value || !ingredientId.value) return
  if (!window.confirm(t('Delete this ingredient? This cannot be undone.'))) return
  deleting.value = true
  error.value = ''
  try {
    await allergenApi.deleteIngredient(ingredientId.value)
    router.push('/app/ingredients')
  } catch (err: unknown) {
    error.value = err instanceof HttpError ? err.message : t('Failed to delete ingredient')
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>{{ isEdit ? t('Edit Ingredient') : t('New Ingredient') }}</h1>
      <div style="display: flex; gap: 8px;">
        <button
          v-if="isEdit"
          type="button"
          class="btn btn-danger"
          :disabled="deleting"
          @click="handleDelete"
        >
          {{ deleting ? t('Deleting...') : t('Delete') }}
        </button>
        <router-link to="/app/ingredients" class="btn btn-secondary">{{ t('Back') }}</router-link>
      </div>
    </div>

    <div v-if="loading" class="loading"><div class="spinner" /></div>

    <div v-else class="card">
      <div v-if="error" class="alert-error">{{ error }}</div>
      <form @submit.prevent="submit">
        <div class="form-group">
          <label class="form-label">{{ t('Name') }}</label>
          <input v-model="name" class="form-input" required maxlength="255" :placeholder="t('Ingredient name')" />
        </div>
        <div class="form-group">
          <label class="form-label">{{ t('Notes') }}</label>
          <textarea v-model="notes" class="form-textarea" rows="3" maxlength="1000" :placeholder="t('Optional notes about this ingredient')" />
        </div>
        <div class="form-group">
          <label class="form-label">{{ t('Allergens') }}</label>
          <div class="allergen-checkboxes">
            <label v-for="a in allergens" :key="a.id" class="checkbox-label">
              <input
                type="checkbox"
                :checked="selectedAllergenIds.has(a.id)"
                @change="toggleAllergen(a.id)"
              />
              <span class="allergen-code">{{ a.code }}</span>
              <span class="allergen-name">{{ a.nameEn }}</span>
            </label>
          </div>
        </div>
        <button type="submit" class="btn btn-primary" :disabled="submitting">
          {{ submitting ? t('Saving...') : (isEdit ? t('Update Ingredient') : t('Create Ingredient')) }}
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
.allergen-checkboxes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 8px;
}
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 14px;
  transition: background 0.15s;
}
.checkbox-label:hover {
  background: var(--accent-bg);
}
.allergen-code {
  font-weight: 600;
  font-size: 12px;
  padding: 1px 5px;
  border-radius: 3px;
  background: var(--warning-bg, #fef3c7);
  color: var(--warning, #92400e);
}
.allergen-name {
  color: var(--text);
}
.btn-danger {
  background: var(--danger);
  color: white;
  border: none;
}
.btn-danger:hover {
  opacity: 0.9;
}
</style>
