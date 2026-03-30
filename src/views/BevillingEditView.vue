<script setup lang="ts">
/**
 * Bevilling create/edit view presenting a form to register or update
 * an alcohol license with alcohol group checkboxes and serving hours grid.
 */
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import { bevillingApi, type ServingHoursEntry } from '@/api/bevilling'
import { HttpError } from '@/api/client'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
/** Bevilling ID from the route, or null for new. */
const bevillingId = route.params.id ? Number(route.params.id) : null
/** Whether this is edit mode. */
const isEdit = computed(() => bevillingId !== null)

// Form fields
const municipality = ref('')
const bevillingType = ref('SKJENKING')
const validFrom = ref('')
const validTo = ref('')
const licenseNumber = ref('')
const servingAreaDescription = ref('')
const indoorAllowed = ref(true)
const outdoorAllowed = ref(false)
const styrerName = ref('')
const stedfortrederName = ref('')
const notes = ref('')
const group1 = ref(true)
const group2 = ref(true)
const group3 = ref(false)

// Serving hours
const weekdays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
const hoursEnabled = ref<Record<string, boolean>>({
  MON: true, TUE: true, WED: true, THU: true, FRI: true, SAT: true, SUN: true
})
const hoursStart = ref<Record<string, string>>({
  MON: '11:00', TUE: '11:00', WED: '11:00', THU: '11:00', FRI: '11:00', SAT: '11:00', SUN: '12:00'
})
const hoursEnd = ref<Record<string, string>>({
  MON: '00:00', TUE: '00:00', WED: '00:00', THU: '00:00', FRI: '02:00', SAT: '02:00', SUN: '22:00'
})
const hoursDeadline = ref<Record<string, number>>({
  MON: 30, TUE: 30, WED: 30, THU: 30, FRI: 30, SAT: 30, SUN: 30
})

const error = ref('')
const submitting = ref(false)
const loading = ref(false)

onMounted(async () => {
  if (isEdit.value) {
    loading.value = true
    try {
      const b = await bevillingApi.get(bevillingId!)
      municipality.value = b.municipality
      bevillingType.value = b.bevillingType
      validFrom.value = b.validFrom
      validTo.value = b.validTo || ''
      licenseNumber.value = b.licenseNumber || ''
      servingAreaDescription.value = b.servingAreaDescription || ''
      indoorAllowed.value = b.indoorAllowed
      outdoorAllowed.value = b.outdoorAllowed
      styrerName.value = b.styrerName || ''
      stedfortrederName.value = b.stedfortrederName || ''
      notes.value = b.notes || ''
      group1.value = b.alcoholGroupsAllowed.includes('GROUP_1')
      group2.value = b.alcoholGroupsAllowed.includes('GROUP_2')
      group3.value = b.alcoholGroupsAllowed.includes('GROUP_3')

      // Populate serving hours
      for (const day of weekdays) {
        hoursEnabled.value[day] = false
      }
      for (const h of b.servingHours) {
        hoursEnabled.value[h.weekday] = true
        hoursStart.value[h.weekday] = h.startTime
        hoursEnd.value[h.weekday] = h.endTime
        hoursDeadline.value[h.weekday] = h.consumptionDeadlineMinutesAfterEnd
      }
    } finally {
      loading.value = false
    }
  }
})

/** Submits the bevilling form. */
async function submit() {
  error.value = ''
  submitting.value = true
  try {
    const groups: string[] = []
    if (group1.value) groups.push('GROUP_1')
    if (group2.value) groups.push('GROUP_2')
    if (group3.value) groups.push('GROUP_3')

    if (isEdit.value) {
      await bevillingApi.update(bevillingId!, {
        municipality: municipality.value,
        bevillingType: bevillingType.value,
        validFrom: validFrom.value,
        validTo: validTo.value || undefined,
        licenseNumber: licenseNumber.value || undefined,
        alcoholGroupsAllowed: groups,
        servingAreaDescription: servingAreaDescription.value || undefined,
        indoorAllowed: indoorAllowed.value,
        outdoorAllowed: outdoorAllowed.value,
        styrerName: styrerName.value || undefined,
        stedfortrederName: stedfortrederName.value || undefined,
        notes: notes.value || undefined,
      })

      // Update serving hours
      const entries: ServingHoursEntry[] = weekdays
        .filter(d => hoursEnabled.value[d])
        .map(d => ({
          weekday: d,
          startTime: hoursStart.value[d],
          endTime: hoursEnd.value[d],
          consumptionDeadlineMinutesAfterEnd: hoursDeadline.value[d],
        }))
      await bevillingApi.setServingHours(bevillingId!, entries)
    } else {
      const created = await bevillingApi.create({
        municipality: municipality.value,
        bevillingType: bevillingType.value,
        validFrom: validFrom.value,
        validTo: validTo.value || undefined,
        licenseNumber: licenseNumber.value || undefined,
        alcoholGroupsAllowed: groups,
        servingAreaDescription: servingAreaDescription.value || undefined,
        indoorAllowed: indoorAllowed.value,
        outdoorAllowed: outdoorAllowed.value,
        styrerName: styrerName.value || undefined,
        stedfortrederName: stedfortrederName.value || undefined,
        notes: notes.value || undefined,
      })

      // Set serving hours for new bevilling
      const entries: ServingHoursEntry[] = weekdays
        .filter(d => hoursEnabled.value[d])
        .map(d => ({
          weekday: d,
          startTime: hoursStart.value[d],
          endTime: hoursEnd.value[d],
          consumptionDeadlineMinutesAfterEnd: hoursDeadline.value[d],
        }))
      if (entries.length > 0) {
        await bevillingApi.setServingHours(created.id, entries)
      }
    }
    router.push('/app/bevilling')
  } catch (err: unknown) {
    error.value = err instanceof HttpError ? err.message : t('Failed to save bevilling')
  } finally {
    submitting.value = false
  }
}

function weekdayLabel(day: string) {
  const labels: Record<string, string> = {
    MON: t('Monday'),
    TUE: t('Tuesday'),
    WED: t('Wednesday'),
    THU: t('Thursday'),
    FRI: t('Friday'),
    SAT: t('Saturday'),
    SUN: t('Sunday'),
  }
  return labels[day] ?? day
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>{{ isEdit ? t('Edit Bevilling') : t('Register Bevilling') }}</h1>
      <router-link to="/app/bevilling" class="btn btn-secondary">{{ t('Back') }}</router-link>
    </div>

    <div v-if="loading" class="loading"><div class="spinner" /></div>

    <div v-else class="card">
      <div v-if="error" class="alert-error">{{ error }}</div>
      <form @submit.prevent="submit">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">{{ t('Municipality') }}</label>
            <input v-model="municipality" class="form-input" required :placeholder="t('e.g. Trondheim')" />
          </div>
          <div class="form-group">
            <label class="form-label">{{ t('License Type') }}</label>
            <select v-model="bevillingType" class="form-select" required>
              <option value="SKJENKING">{{ t('On-premises License') }}</option>
              <option value="SALG">{{ t('Off-premises License') }}</option>
              <option value="COMBINED">{{ t('Combined') }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">{{ t('License Number') }}</label>
            <input v-model="licenseNumber" class="form-input" :placeholder="t('e.g. SK-2025-001')" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">{{ t('Valid From') }}</label>
            <input v-model="validFrom" type="date" class="form-input" required />
          </div>
          <div class="form-group">
            <label class="form-label">{{ t('Valid To (optional)') }}</label>
            <input v-model="validTo" type="date" class="form-input" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">{{ t('License Manager') }}</label>
            <input v-model="styrerName" class="form-input" :placeholder="t('Full name')" />
          </div>
          <div class="form-group">
            <label class="form-label">{{ t('Deputy') }}</label>
            <input v-model="stedfortrederName" class="form-input" :placeholder="t('Full name')" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">{{ t('Alcohol Groups Allowed') }}</label>
          <div class="checkbox-row">
            <label class="checkbox-label"><input v-model="group1" type="checkbox" /> {{ t('Group 1 (up to 4.7%)') }}</label>
            <label class="checkbox-label"><input v-model="group2" type="checkbox" /> {{ t('Group 2 (4.7%-22%)') }}</label>
            <label class="checkbox-label"><input v-model="group3" type="checkbox" /> {{ t('Group 3 (above 22%)') }}</label>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group checkbox-group">
            <label class="checkbox-label"><input v-model="indoorAllowed" type="checkbox" /> {{ t('Indoor serving allowed') }}</label>
          </div>
          <div class="form-group checkbox-group">
            <label class="checkbox-label"><input v-model="outdoorAllowed" type="checkbox" /> {{ t('Outdoor serving allowed') }}</label>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">{{ t('Serving Area Description') }}</label>
          <textarea v-model="servingAreaDescription" class="form-textarea" maxlength="2000" rows="2" :placeholder="t('Describe the serving area')" />
        </div>

        <div class="form-group">
          <label class="form-label">{{ t('Notes') }}</label>
          <textarea v-model="notes" class="form-textarea" maxlength="2000" rows="2" :placeholder="t('Any additional notes')" />
        </div>

        <!-- Serving Hours Grid -->
        <div class="hours-section">
          <h3>{{ t('Serving Hours') }}</h3>
          <div class="hours-grid">
            <div v-for="day in weekdays" :key="day" class="hours-row">
              <label class="checkbox-label day-check">
                <input v-model="hoursEnabled[day]" type="checkbox" />
                <span class="day-name">{{ weekdayLabel(day) }}</span>
              </label>
              <input v-model="hoursStart[day]" type="time" class="form-input time-input" :disabled="!hoursEnabled[day]" />
              <span class="time-sep">{{ t('to') }}</span>
              <input v-model="hoursEnd[day]" type="time" class="form-input time-input" :disabled="!hoursEnabled[day]" />
              <span class="time-sep">+</span>
              <input v-model.number="hoursDeadline[day]" type="number" class="form-input deadline-input" :disabled="!hoursEnabled[day]" min="0" max="120" />
              <span class="time-sep">{{ t('min') }}</span>
            </div>
          </div>
        </div>

        <button type="submit" class="btn btn-primary" :disabled="submitting">
          {{ submitting ? t('Saving...') : (isEdit ? t('Update Bevilling') : t('Register Bevilling')) }}
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
.form-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.form-row .form-group {
  min-width: 180px;
  flex: 1;
}
.checkbox-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
.checkbox-group {
  margin-bottom: 16px;
}
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  cursor: pointer;
}
.hours-section {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
  margin-bottom: 20px;
}
.hours-section h3 {
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text);
  margin-bottom: 12px;
}
.hours-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.hours-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.day-check {
  min-width: 120px;
}
.day-name {
  font-weight: 500;
}
.time-input {
  width: 100px;
  min-width: 90px;
}
.deadline-input {
  width: 60px;
  min-width: 50px;
}
.time-sep {
  font-size: 13px;
  color: var(--text);
}
</style>
