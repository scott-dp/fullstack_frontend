<!-- Checklist completion screen for filling out and submitting one checklist template instance. -->
<script setup lang="ts">
/**
 * Checklist completion view allowing a user to fill out and submit
 * a checklist template. Loads the template by route param ID and
 * initializes an answer record for each item.
 */
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { checklistApi, type ChecklistTemplate, type ChecklistItem } from '@/api/operations/checklists.ts'
import { getErrorMessage } from '@/api/core/client.ts'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
/** Template ID parsed from the route params. */
const templateId = Number(route.params.id)

/** The loaded checklist template, null until fetched. */
const template = ref<ChecklistTemplate | null>(null)
/** User answers keyed by checklist item ID. */
const answers = ref<Record<number, { checked: boolean; comment: string }>>({})
/** Optional overall comment for the completion. */
const overallComment = ref('')
/** Whether the template is still being loaded. */
const loading = ref(true)
/** Whether the completion is currently being submitted. */
const submitting = ref(false)
/** Error message from loading or submission failure. */
const error = ref('')

onMounted(async () => {
  try {
    template.value = await checklistApi.getTemplate(templateId)
    for (const item of template.value.items) {
      answers.value[item.id] = { checked: false, comment: '' }
    }
  } catch (err: unknown) {
    error.value = getErrorMessage(err, {
      defaultMessage: t('Failed to load checklist'),
      byStatus: {
        400: t('The checklist could not be loaded.'),
      },
    })
  } finally {
    loading.value = false
  }
})

/**
 * Submits the completed checklist to the server.
 * On success navigates to the checklist history page.
 */
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
    router.push('/app/checklists/history')
  } catch (err: unknown) {
    error.value = getErrorMessage(err, {
      defaultMessage: t('Failed to submit checklist'),
      byStatus: {
        400: t('The checklist could not be submitted. Check the required comments and try again.'),
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
      <div>
        <h1 v-if="template">{{ template.title }}</h1>
        <p v-if="template" class="text-muted">{{ template.description }}</p>
      </div>
      <router-link to="/app/checklists" class="btn btn-secondary">{{ t('Back') }}</router-link>
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
              :placeholder="item.requiresComment ? t('Comment (required)') : t('Comment (optional)')"
              :required="item.requiresComment"
            />
          </div>
        </div>

        <div class="form-group overall-comment">
          <label class="form-label">{{ t('Overall Comment (optional)') }}</label>
          <textarea v-model="overallComment" class="form-textarea" rows="2" />
        </div>

        <div class="submit-row">
          <button type="submit" class="btn btn-primary" :disabled="submitting">
            {{ submitting ? t('Submitting...') : t('Submit Checklist') }}
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
