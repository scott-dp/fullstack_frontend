<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { checklistApi, type ChecklistTemplate, type ChecklistItem } from '@/api/checklists'
import { HttpError } from '@/api/client'

const router = useRouter()
const route = useRoute()
const templateId = Number(route.params.id)

const template = ref<ChecklistTemplate | null>(null)
const answers = ref<Record<number, { checked: boolean; comment: string }>>({})
const overallComment = ref('')
const loading = ref(true)
const submitting = ref(false)
const error = ref('')

onMounted(async () => {
  try {
    template.value = await checklistApi.getTemplate(templateId)
    for (const item of template.value.items) {
      answers.value[item.id] = { checked: false, comment: '' }
    }
  } catch (err: unknown) {
    error.value = 'Failed to load checklist'
  } finally {
    loading.value = false
  }
})

async function submit() {
  if (!template.value) return
  submitting.value = true
  error.value = ''
  try {
    await checklistApi.completeChecklist({
      templateId: template.value.id,
      answers: template.value.items.map((item: ChecklistItem) => ({
        itemId: item.id,
        checked: answers.value[item.id]?.checked ?? false,
        comment: answers.value[item.id]?.comment || undefined,
      })),
      comment: overallComment.value || undefined,
    })
    router.push('/checklists/history')
  } catch (err: unknown) {
    error.value = err instanceof HttpError ? err.message : 'Failed to submit checklist'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <h1 v-if="template">{{ template.title }}</h1>
        <p v-if="template" class="text-muted">{{ template.description }}</p>
      </div>
      <router-link to="/checklists" class="btn btn-secondary">Back</router-link>
    </div>

    <div v-if="loading" class="loading"><div class="spinner" /></div>

    <div v-else-if="template" class="card">
      <div v-if="error" class="alert-error">{{ error }}</div>

      <form @submit.prevent="submit">
        <div v-for="item in template.items" :key="item.id" class="checklist-item">
          <label class="check-row">
            <input type="checkbox" v-model="answers[item.id].checked" />
            <span class="check-label">{{ item.description }}</span>
          </label>
          <div v-if="item.requiresComment || answers[item.id].comment" class="item-comment">
            <input
              v-model="answers[item.id].comment"
              class="form-input"
              :placeholder="item.requiresComment ? 'Comment (required)' : 'Comment (optional)'"
              :required="item.requiresComment"
            />
          </div>
        </div>

        <div class="form-group overall-comment">
          <label class="form-label">Overall Comment (optional)</label>
          <textarea v-model="overallComment" class="form-textarea" rows="2" />
        </div>

        <div class="submit-row">
          <button type="submit" class="btn btn-primary" :disabled="submitting">
            {{ submitting ? 'Submitting...' : 'Submit Checklist' }}
          </button>
        </div>
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
.checklist-item {
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
}
.checklist-item:last-of-type {
  border-bottom: none;
}
.check-row {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}
.check-row input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--accent);
}
.check-label {
  font-size: 15px;
  color: var(--text-h);
}
.item-comment {
  margin-top: 8px;
  padding-left: 28px;
}
.overall-comment {
  margin-top: 20px;
}
.submit-row {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
