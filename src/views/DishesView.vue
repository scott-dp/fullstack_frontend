<script setup lang="ts">
/**
 * Dishes list view displaying all dishes in a table with allergen badges,
 * active/inactive status, and approval status. Rows are clickable to
 * navigate to the dish detail page.
 */
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { allergenApi, type Dish } from '@/api/allergens'

const auth = useAuthStore()

/** All dishes loaded from the server. */
const dishes = ref<Dish[]>([])
/** Whether dishes are still being fetched. */
const loading = ref(true)

onMounted(async () => {
  try {
    dishes.value = await allergenApi.listDishes()
  } finally {
    loading.value = false
  }
})

/**
 * Collects all unique allergen codes for a dish (derived + override included).
 * @param dish - The dish to extract allergens from
 * @returns Array of unique allergen code strings
 */
function getAllergenCodes(dish: Dish): string[] {
  const codes = new Set<string>()
  for (const a of dish.derivedAllergens) codes.add(a.code)
  for (const o of dish.overrides) {
    if (o.included) codes.add(o.allergenCode)
  }
  // Remove excluded overrides
  for (const o of dish.overrides) {
    if (!o.included) codes.delete(o.allergenCode)
  }
  return Array.from(codes).sort()
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>Dishes</h1>
      <router-link v-if="auth.hasManageAccess" to="/app/dishes/new" class="btn btn-primary">New Dish</router-link>
    </div>

    <div v-if="loading" class="loading"><div class="spinner" /></div>

    <div v-else-if="dishes.length === 0" class="empty-state">
      <h3>No dishes found</h3>
      <p>Add your first dish to get started.</p>
    </div>

    <div v-else class="card table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Allergens</th>
            <th>Status</th>
            <th>Approval</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="dish in dishes"
            :key="dish.id"
            class="clickable-row"
            @click="$router.push(`/app/dishes/${dish.id}`)"
          >
            <td><strong>{{ dish.name }}</strong></td>
            <td>
              <span v-for="code in getAllergenCodes(dish)" :key="code" class="allergen-badge">{{ code }}</span>
              <span v-if="getAllergenCodes(dish).length === 0" class="text-muted">None</span>
            </td>
            <td>
              <span class="status-badge" :class="dish.active ? 'success' : 'warning'">
                {{ dish.active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td>
              <span v-if="dish.changedSinceApproval" class="status-badge warning">Needs approval</span>
              <span v-else-if="dish.lastApprovedAt" class="status-badge success">Approved</span>
              <span v-else class="status-badge info">Not approved</span>
            </td>
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
