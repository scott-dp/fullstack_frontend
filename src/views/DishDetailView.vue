<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { allergenApi, type Dish, type Allergen } from '@/api/allergens'
import { useAuthStore } from '@/stores/auth'
import { HttpError } from '@/api/client'

const route = useRoute()
const auth = useAuthStore()
const id = computed(() => Number(route.params.id))
const dish = ref<Dish | null>(null)
const allergens = ref<Allergen[]>([])
const loading = ref(true)
const error = ref('')
const approving = ref(false)
const overrideAllergenId = ref<number | null>(null)
const overrideIncluded = ref(true)
const overrideReason = ref('')
const addingOverride = ref(false)

onMounted(async () => {
  try {
    const [d, a] = await Promise.all([allergenApi.getDish(id.value), allergenApi.listAllergens()])
    dish.value = d
    allergens.value = a
  } catch (err: unknown) {
    error.value = err instanceof HttpError ? err.message : 'Failed to load dish'
  } finally { loading.value = false }
})

async function handleApprove() {
  approving.value = true
  try { dish.value = await allergenApi.approveDish(id.value) }
  catch (err: unknown) { error.value = err instanceof HttpError ? err.message : 'Failed to approve' }
  finally { approving.value = false }
}

async function handleAddOverride() {
  if (!overrideAllergenId.value || !overrideReason.value.trim()) return
  addingOverride.value = true
  try {
    await allergenApi.addOverride(id.value, { allergenId: overrideAllergenId.value, included: overrideIncluded.value, reason: overrideReason.value })
    dish.value = await allergenApi.getDish(id.value)
    overrideAllergenId.value = null; overrideReason.value = ''
  } catch (err: unknown) { error.value = err instanceof HttpError ? err.message : 'Failed to add override' }
  finally { addingOverride.value = false }
}

async function handleRemoveOverride(overrideId: number) {
  try { await allergenApi.removeOverride(id.value, overrideId); dish.value = await allergenApi.getDish(id.value) }
  catch (err: unknown) { error.value = err instanceof HttpError ? err.message : 'Failed to remove override' }
}

function formatDate(iso: string) { return new Date(iso).toLocaleDateString() }
</script>

<template>
  <div>
    <div class="page-header">
      <h1>Dish Details</h1>
      <div v-if="dish && auth.hasManageAccess" style="display: flex; gap: 8px;">
        <router-link :to="`/app/dishes/${id}/edit`" class="btn btn-secondary">Edit</router-link>
        <button class="btn btn-primary" :disabled="approving" @click="handleApprove">{{ approving ? 'Approving...' : 'Approve Allergens' }}</button>
      </div>
    </div>
    <div v-if="loading" class="loading"><div class="spinner" /></div>
    <div v-else-if="error && !dish" class="alert-error">{{ error }}</div>
    <template v-else-if="dish">
      <div v-if="error" class="alert-error" style="margin-bottom: 16px;">{{ error }}</div>
      <div class="card" style="margin-bottom: 16px;">
        <h2>{{ dish.name }}</h2>
        <div style="display: flex; gap: 8px; margin: 8px 0;">
          <span v-if="dish.changedSinceApproval" class="status-badge warning">Needs approval</span>
          <span v-else-if="dish.lastApprovedAt" class="status-badge success">Approved</span>
          <span v-else class="status-badge warning">Never approved</span>
        </div>
        <p v-if="dish.description" class="text-muted">{{ dish.description }}</p>
        <p v-if="dish.lastApprovedAt" class="text-sm text-muted">Last approved: {{ formatDate(dish.lastApprovedAt) }} by {{ dish.lastApprovedByUsername }}</p>
      </div>
      <div class="detail-grid">
        <div class="card"><h3>Ingredients</h3>
          <div v-if="dish.ingredients.length === 0" class="text-muted text-sm">No ingredients.</div>
          <div v-for="ing in dish.ingredients" :key="ing.id" class="ingredient-item"><strong>{{ ing.ingredientName }}</strong><span v-if="ing.quantityText" class="text-muted text-sm">{{ ing.quantityText }}</span></div>
        </div>
        <div class="card"><h3>Derived Allergens</h3>
          <div v-if="dish.derivedAllergens.length === 0" class="text-muted text-sm">No allergens.</div>
          <div class="allergen-badges"><span v-for="a in dish.derivedAllergens" :key="a.id" class="status-badge danger">{{ a.nameEn }}</span></div>
        </div>
      </div>
      <div v-if="auth.hasManageAccess" class="card" style="margin-top: 16px;">
        <h3>Allergen Overrides</h3>
        <div v-for="ov in dish.overrides" :key="ov.id" class="override-item">
          <span class="status-badge" :class="ov.included ? 'danger' : 'success'">{{ ov.allergen.nameEn }}: {{ ov.included ? 'Included' : 'Excluded' }}</span>
          <span class="text-sm text-muted">{{ ov.reason }}</span>
          <button class="btn btn-sm btn-secondary" @click="handleRemoveOverride(ov.id)">Remove</button>
        </div>
        <div v-if="dish.overrides.length === 0" class="text-muted text-sm" style="margin-bottom: 12px;">No overrides.</div>
        <h4 style="margin-top: 16px;">Add Override</h4>
        <div class="override-form">
          <select v-model="overrideAllergenId" class="form-select"><option :value="null">Select allergen...</option><option v-for="a in allergens" :key="a.id" :value="a.id">{{ a.nameEn }}</option></select>
          <select v-model="overrideIncluded" class="form-select"><option :value="true">Include</option><option :value="false">Exclude</option></select>
          <input v-model="overrideReason" class="form-input" placeholder="Reason..." />
          <button class="btn btn-primary btn-sm" :disabled="addingOverride || !overrideAllergenId || !overrideReason.trim()" @click="handleAddOverride">Add</button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.ingredient-item { padding: 6px 0; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; }
.allergen-badges { display: flex; flex-wrap: wrap; gap: 6px; }
.override-item { display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid var(--border); }
.override-form { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
@media (max-width: 768px) { .detail-grid { grid-template-columns: 1fr; } }
</style>
