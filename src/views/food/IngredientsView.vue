<!-- Ingredient catalog view used as the source data for dish allergen derivation. -->
<script setup lang="ts">
/**
 * Ingredients list view displaying all ingredients in a filterable table.
 * Each ingredient shows its associated allergen codes as small badges.
 * Rows are clickable to navigate to the ingredient edit page.
 */
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.ts'
import { allergenApi, type Ingredient } from '@/api/operations/allergens.ts'
import { useI18n } from 'vue-i18n'

const auth = useAuthStore()
const { t } = useI18n()

/** All ingredients loaded from the server. */
const ingredients = ref<Ingredient[]>([])
/** Whether ingredients are still being fetched. */
const loading = ref(true)

onMounted(async () => {
  try {
    ingredients.value = await allergenApi.listIngredients()
  } finally {
    loading.value = false
  }
})

/**
 * Formats an ISO-8601 timestamp to a locale-specific date string.
 * @param iso - ISO-8601 date string
 * @returns Formatted date string
 */
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString()
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>{{ t('Ingredients') }}</h1>
      <router-link v-if="auth.hasManageAccess" to="/app/ingredients/new" class="btn btn-primary">{{ t('New Ingredient') }}</router-link>
    </div>

    <div v-if="loading" class="loading"><div class="spinner" /></div>

    <div v-else-if="ingredients.length === 0" class="empty-state">
      <h3>{{ t('No ingredients found') }}</h3>
      <p>{{ t('Add your first ingredient to get started.') }}</p>
    </div>

    <div v-else class="card table-wrapper">
      <table>
        <thead>
          <tr>
            <th>{{ t('Name') }}</th>
            <th>{{ t('Allergens') }}</th>
            <th>{{ t('Notes') }}</th>
            <th>{{ t('Updated') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="ing in ingredients"
            :key="ing.id"
            class="clickable-row"
            tabindex="0"
            @click="$router.push(`/app/ingredients/${ing.id}/edit`)"
            @keydown.enter="$router.push(`/app/ingredients/${ing.id}/edit`)"
            @keydown.space.prevent="$router.push(`/app/ingredients/${ing.id}/edit`)"
          >
            <td><strong>{{ ing.name }}</strong></td>
            <td>
              <span v-for="a in ing.allergens" :key="a.id" class="allergen-badge">{{ a.code }}</span>
              <span v-if="ing.allergens.length === 0" class="text-muted">{{ t('None') }}</span>
            </td>
            <td>{{ ing.notes || t('None') }}</td>
            <td>{{ formatDate(ing.updatedAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.clickable-row {
  cursor: pointer;
}
.clickable-row:hover td {
  background: var(--accent-bg);
}
.allergen-badge {
  display: inline-block;
  padding: 2px 6px;
  margin: 1px 2px;
  border-radius: 4px;
  background: var(--warning-bg, #fef3c7);
  color: var(--warning, #92400e);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.3px;
}
</style>
