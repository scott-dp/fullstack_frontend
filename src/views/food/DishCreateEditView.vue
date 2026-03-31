<!-- Create and edit form for dishes, ingredient composition, and allergen overrides. -->
<script setup lang="ts">
/**
 * Dish create/edit view with name, description, notes, and an ingredient
 * selector that lets users add/remove ingredients with quantity text.
 * Shows a live preview of derived allergens from selected ingredients.
 */
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { allergenApi, type Ingredient, type DishIngredientEntry } from '@/api/operations/allergens.ts'
import { getErrorMessage } from '@/api/core/client.ts'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

/** Dish ID from route params; null when creating a new dish. */
const dishId = computed(() => {
  const id = route.params.id
  return id ? Number(id) : null
})

/** Whether we are in edit mode (vs. create mode). */
const isEdit = computed(() => dishId.value !== null)

/** All available ingredients for selection. */
const allIngredients = ref<Ingredient[]>([])
/** Bound name input value. */
const name = ref('')
/** Bound description textarea value. */
const description = ref('')
/** Bound notes textarea value. */
const notes = ref('')
/** Currently selected ingredients with quantity text. */
const selectedIngredients = ref<{ ingredientId: number; quantityText: string }[]>([])
/** Error message from the last submission attempt. */
const error = ref('')
/** Whether the form is currently being submitted. */
const submitting = ref(false)
/** Whether data is still being loaded. */
const loading = ref(true)

/** Derived allergens based on currently selected ingredients. */
const derivedAllergens = computed(() => {
  const codes = new Map<string, { code: string; nameEn: string }>()
  for (const sel of selectedIngredients.value) {
    const ing = allIngredients.value.find((i) => i.id === sel.ingredientId)
    if (ing) {
      for (const a of ing.allergens) {
        if (!codes.has(a.code)) {
          codes.set(a.code, { code: a.code, nameEn: a.nameEn })
        }
      }
    }
  }
  return Array.from(codes.values()).sort((a, b) => a.code.localeCompare(b.code))
})

/** Ingredients not yet added to the dish, available for selection. */
const availableIngredients = computed(() => {
  const usedIds = new Set(selectedIngredients.value.map((s) => s.ingredientId))
  return allIngredients.value.filter((i) => !usedIds.has(i.id))
})

onMounted(async () => {
  try {
    allIngredients.value = await allergenApi.listIngredients()
    if (isEdit.value && dishId.value) {
      const dish = await allergenApi.getDish(dishId.value)
      name.value = dish.name
      description.value = dish.description || ''
      notes.value = dish.notes || ''
      selectedIngredients.value = dish.ingredients.map((i) => ({
        ingredientId: i.ingredientId,
        quantityText: i.quantityText || '',
      }))
    }
  } finally {
    loading.value = false
  }
})

/** Adds an ingredient to the selected list. */
function addIngredient(ingredientId: number) {
  if (!ingredientId) return
  selectedIngredients.value.push({ ingredientId, quantityText: '' })
}

/**
 * Removes an ingredient from the selected list by index.
 * @param index - Index in the selectedIngredients array
 */
function removeIngredient(index: number) {
  selectedIngredients.value.splice(index, 1)
}

/**
 * Looks up an ingredient name by ID.
 * @param id - Ingredient ID
 * @returns The ingredient name, or 'Unknown'
 */
function ingredientName(id: number): string {
  return allIngredients.value.find((i) => i.id === id)?.name || t('Unknown')
}

/**
 * Submits the dish form (create or update).
 * On success navigates back to the dishes list.
 */
async function submit() {
  error.value = ''
  submitting.value = true
  try {
    const ingredientIds: DishIngredientEntry[] = selectedIngredients.value.map((s) => ({
      ingredientId: s.ingredientId,
      quantityText: s.quantityText || undefined,
    }))
    const payload = {
      name: name.value,
      description: description.value || undefined,
      notes: notes.value || undefined,
      ingredientIds,
    }
    if (isEdit.value && dishId.value) {
      await allergenApi.updateDish(dishId.value, payload)
    } else {
      await allergenApi.createDish(payload)
    }
    router.push('/app/dishes')
  } catch (err: unknown) {
    error.value = getErrorMessage(err, {
      defaultMessage: t('Failed to save dish'),
      byStatus: {
        400: t('Please check the dish details and try again'),
        403: t('You do not have permission to manage dishes'),
      },
    })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>{{ isEdit ? t('Edit Dish') : t('New Dish') }}</h1>
      <router-link to="/app/dishes" class="btn btn-secondary">{{ t('Back') }}</router-link>
    </div>

    <div v-if="loading" class="loading"><div class="spinner" /></div>

    <div v-else class="card">
      <div v-if="error" class="alert-error">{{ error }}</div>
      <form @submit.prevent="submit">
        <div class="form-group">
          <label class="form-label">{{ t('Name') }}</label>
          <input v-model="name" class="form-input" required maxlength="255" :placeholder="t('Dish name')" />
        </div>
        <div class="form-group">
          <label class="form-label">{{ t('Description') }}</label>
          <textarea v-model="description" class="form-textarea" rows="3" maxlength="2000" :placeholder="t('Optional description')" />
        </div>
        <div class="form-group">
          <label class="form-label">{{ t('Notes') }}</label>
          <textarea v-model="notes" class="form-textarea" rows="2" maxlength="1000" :placeholder="t('Internal notes')" />
        </div>

        <!-- Ingredient selector -->
        <div class="form-group">
          <label class="form-label">{{ t('Ingredients') }}</label>
          <div class="ingredient-selector">
            <select class="form-select" @change="addIngredient(Number(($event.target as HTMLSelectElement).value)); ($event.target as HTMLSelectElement).value = ''">
              <option value="">{{ t('Add an ingredient...') }}</option>
              <option v-for="ing in availableIngredients" :key="ing.id" :value="ing.id">{{ ing.name }}</option>
            </select>
          </div>
          <div v-if="selectedIngredients.length > 0" class="selected-ingredients">
            <div v-for="(sel, idx) in selectedIngredients" :key="sel.ingredientId" class="ingredient-row">
              <span class="ingredient-name">{{ ingredientName(sel.ingredientId) }}</span>
              <input v-model="sel.quantityText" class="form-input quantity-input" :placeholder="t('Quantity (optional)')" />
              <button type="button" class="btn btn-sm btn-danger" @click="removeIngredient(idx)">{{ t('Remove') }}</button>
            </div>
          </div>
          <div v-else class="text-muted text-sm">{{ t('No ingredients added yet.') }}</div>
        </div>

        <!-- Derived allergens preview -->
        <div class="form-group">
          <label class="form-label">{{ t('Derived Allergens (from ingredients)') }}</label>
          <div class="allergen-preview">
            <span v-for="a in derivedAllergens" :key="a.code" class="allergen-badge">{{ a.code }} - {{ a.nameEn }}</span>
            <span v-if="derivedAllergens.length === 0" class="text-muted">{{ t('No allergens detected from selected ingredients.') }}</span>
          </div>
        </div>

        <button type="submit" class="btn btn-primary" :disabled="submitting">
          {{ submitting ? t('Saving...') : (isEdit ? t('Update Dish') : t('Create Dish')) }}
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
.ingredient-selector {
  margin-bottom: 12px;
}
.selected-ingredients {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ingredient-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
}
.ingredient-name {
  font-weight: 500;
  min-width: 150px;
}
.quantity-input {
  max-width: 200px;
}
.allergen-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.allergen-badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  background: var(--warning-bg, #fef3c7);
  color: var(--warning, #92400e);
  font-size: 12px;
  font-weight: 600;
}
</style>
