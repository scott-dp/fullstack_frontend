<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { allergenApi, type AllergenSheetEntry, type Allergen } from '@/api/allergens'

const entries = ref<AllergenSheetEntry[]>([])
const allergens = ref<Allergen[]>([])
const loading = ref(true)

const dishNames = computed(() => {
  const names = new Set<string>()
  entries.value.forEach(e => names.add(e.dishName))
  return Array.from(names).sort()
})

function isPresent(dishName: string, allergenCode: string) {
  return entries.value.some(e => e.dishName === dishName && e.allergenCode === allergenCode && e.present)
}

onMounted(async () => {
  try {
    const [sheet, allAllergens] = await Promise.all([allergenApi.getAllergenSheet(), allergenApi.listAllergens()])
    entries.value = sheet
    allergens.value = allAllergens
  } finally { loading.value = false }
})
</script>

<template>
  <div>
    <div class="page-header no-print"><h1>Allergen Sheet</h1><button class="btn btn-primary" @click="(window as any).print()">Print</button></div>
    <div v-if="loading" class="loading"><div class="spinner" /></div>
    <div v-else-if="dishNames.length === 0" class="empty-state"><h3>No dishes</h3><p>Add dishes to generate the allergen sheet.</p></div>
    <div v-else class="sheet-wrapper">
      <h2 class="print-title">Allergen Information</h2>
      <div class="table-scroll">
        <table class="allergen-table">
          <thead><tr><th class="dish-col">Dish</th><th v-for="a in allergens" :key="a.id" class="allergen-col" :title="a.nameEn"><span>{{ a.code.slice(0, 3) }}</span></th></tr></thead>
          <tbody><tr v-for="dish in dishNames" :key="dish"><td class="dish-col"><strong>{{ dish }}</strong></td><td v-for="a in allergens" :key="a.id" class="allergen-cell" :class="{ present: isPresent(dish, a.code) }"><span v-if="isPresent(dish, a.code)">X</span><span v-else>-</span></td></tr></tbody>
        </table>
      </div>
      <p class="legend">X = contains allergen, - = not present</p>
    </div>
  </div>
</template>

<style scoped>
.print-title { display: none; }
.table-scroll { overflow-x: auto; }
.allergen-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.allergen-table th, .allergen-table td { border: 1px solid var(--border); padding: 6px 8px; text-align: center; }
.dish-col { text-align: left; min-width: 180px; }
.allergen-col { min-width: 45px; font-size: 11px; }
.allergen-cell.present { background: var(--danger-bg); color: var(--danger); font-weight: 700; }
.legend { font-size: 12px; color: var(--text); margin-top: 12px; }
@media print { .no-print { display: none !important; } .print-title { display: block; } .allergen-cell.present { background: #fee2e2 !important; print-color-adjust: exact; } }
</style>
