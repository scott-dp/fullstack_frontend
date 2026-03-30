<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { allergenApi, type Dish, type Allergen } from '@/api/allergens'
import { useAuthStore } from '@/stores/auth'
import { getErrorMessage } from '@/api/client'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { t } = useI18n()
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
const deleting = ref(false)

onMounted(async () => {
  try {
    const [d, a] = await Promise.all([allergenApi.getDish(id.value), allergenApi.listAllergens()])
    dish.value = d
    allergens.value = a
  } catch (err: unknown) {
    error.value = getErrorMessage(err, {
      defaultMessage: t('Failed to load dish'),
    })
  } finally { loading.value = false }
})

async function handleApprove() {
  approving.value = true
  try { dish.value = await allergenApi.approveDish(id.value) }
  catch (err: unknown) {
    error.value = getErrorMessage(err, {
      defaultMessage: t('Failed to approve'),
      byStatus: {
        403: t('You do not have permission to approve allergens'),
      },
    })
  }
  finally { approving.value = false }
}

async function handleAddOverride() {
  if (!overrideAllergenId.value || !overrideReason.value.trim()) return
  addingOverride.value = true
  try {
    await allergenApi.addOverride(id.value, { allergenId: overrideAllergenId.value, included: overrideIncluded.value, reason: overrideReason.value })
    dish.value = await allergenApi.getDish(id.value)
    overrideAllergenId.value = null; overrideReason.value = ''
  } catch (err: unknown) {
    error.value = getErrorMessage(err, {
      defaultMessage: t('Failed to add override'),
      byStatus: {
        400: t('Please check the override details and try again'),
        403: t('You do not have permission to manage allergen overrides'),
      },
    })
  }
  finally { addingOverride.value = false }
}

async function handleRemoveOverride(overrideId: number) {
  try { await allergenApi.removeOverride(id.value, overrideId); dish.value = await allergenApi.getDish(id.value) }
  catch (err: unknown) {
    error.value = getErrorMessage(err, {
      defaultMessage: t('Failed to remove override'),
      byStatus: {
        403: t('You do not have permission to manage allergen overrides'),
      },
    })
  }
}

async function handleDelete() {
  if (!window.confirm(t('Delete this dish? This cannot be undone.'))) return
  deleting.value = true
  try {
    await allergenApi.deleteDish(id.value)
    router.push('/app/dishes')
  } catch (err: unknown) {
    error.value = getErrorMessage(err, {
      defaultMessage: t('Failed to delete dish'),
      byStatus: {
        403: t('You do not have permission to delete dishes'),
      },
    })
  } finally {
    deleting.value = false
  }
}

function formatDate(iso: string) { return new Date(iso).toLocaleDateString() }
</script>

<template>
  <div>
    <div class="page-header">
      <h1>Dish Details</h1>
      <div v-if="dish && auth.hasManageAccess" style="display: flex; gap: 8px;">
        <router-link :to="`/app/dishes/${id}/edit`" class="btn btn-secondary">{{ t('Edit') }}</router-link>
        <button class="btn btn-primary" :disabled="approving" @click="handleApprove">{{ approving ? t('Approving...') : t('Approve Allergens') }}</button>
        <button class="btn btn-danger" :disabled="deleting" @click="handleDelete">
          {{ deleting ? t('Deleting...') : t('Delete') }}
        </button>
      </div>
    </div>
    <div v-if="loading" class="loading"><div class="spinner" /></div>
    <div v-else-if="error && !dish" class="alert-error">{{ error }}</div>
    <template v-else-if="dish">
      <div v-if="error" class="alert-error" style="margin-bottom: 16px;">{{ error }}</div>
      <div class="card" style="margin-bottom: 16px;">
        <h2>{{ dish.name }}</h2>
        <div style="display: flex; gap: 8px; margin: 8px 0;">
          <span v-if="dish.changedSinceApproval" class="status-badge warning">{{ t('Needs approval') }}</span>
          <span v-else-if="dish.lastApprovedAt" class="status-badge success">{{ t('Approved') }}</span>
          <span v-else class="status-badge warning">{{ t('Never approved') }}</span>
        </div>
        <p v-if="dish.description" class="text-muted">{{ dish.description }}</p>
        <p v-if="dish.lastApprovedAt" class="text-sm text-muted">{{ t('Last approved:') }} {{ formatDate(dish.lastApprovedAt) }} {{ t('by') }} {{ dish.lastApprovedByUsername }}</p>
      </div>
      <div class="detail-grid">
        <div class="card"><h3>{{ t('Ingredients') }}</h3>
          <div v-if="dish.ingredients.length === 0" class="text-muted text-sm">{{ t('No ingredients.') }}</div>
          <div v-for="ing in dish.ingredients" :key="ing.id" class="ingredient-item"><strong>{{ ing.ingredientName }}</strong><span v-if="ing.quantityText" class="text-muted text-sm">{{ ing.quantityText }}</span></div>
        </div>
        <div class="card"><h3>{{ t('Derived Allergens') }}</h3>
          <div v-if="dish.derivedAllergens.length === 0" class="text-muted text-sm">{{ t('No allergens.') }}</div>
          <div class="allergen-badges"><span v-for="a in dish.derivedAllergens" :key="a.id" class="status-badge danger">{{ a.nameEn }}</span></div>
        </div>
      </div>
      <div v-if="auth.hasManageAccess" class="card" style="margin-top: 16px;">
        <h3>{{ t('Allergen Overrides') }}</h3>
        <div v-for="ov in dish.overrides" :key="ov.id" class="override-item">
          <span class="status-badge" :class="ov.included ? 'danger' : 'success'">{{ ov.allergen.nameEn }}: {{ ov.included ? t('Included') : t('Excluded') }}</span>
          <span class="text-sm text-muted">{{ ov.reason }}</span>
          <button class="btn btn-sm btn-secondary" @click="handleRemoveOverride(ov.id)">{{ t('Remove') }}</button>
        </div>
        <div v-if="dish.overrides.length === 0" class="text-muted text-sm" style="margin-bottom: 12px;">{{ t('No overrides.') }}</div>
        <h4 style="margin-top: 16px;">{{ t('Add Override') }}</h4>
        <div class="override-form">
          <select v-model="overrideAllergenId" class="form-select"><option :value="null">{{ t('Select allergen...') }}</option><option v-for="a in allergens" :key="a.id" :value="a.id">{{ a.nameEn }}</option></select>
          <select v-model="overrideIncluded" class="form-select"><option :value="true">{{ t('Include') }}</option><option :value="false">{{ t('Exclude') }}</option></select>
          <input v-model="overrideReason" class="form-input" :placeholder="t('Reason...')" />
          <button class="btn btn-primary btn-sm" :disabled="addingOverride || !overrideAllergenId || !overrideReason.trim()" @click="handleAddOverride">{{ t('Add') }}</button>
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
.btn-danger { background: var(--danger); color: white; border: none; }
.btn-danger:hover { opacity: 0.9; }
@media (max-width: 768px) { .detail-grid { grid-template-columns: 1fr; } }
</style>
