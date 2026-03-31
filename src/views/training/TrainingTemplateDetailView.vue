<!-- Training template detail page with content review and assignment entry points. -->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { trainingApi, type TrainingTemplate } from '@/api/operations/trainings.ts'
import { useAuthStore } from '@/stores/auth.ts'
import { getErrorMessage } from '@/api/core/client.ts'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const template = ref<TrainingTemplate | null>(null)
const loading = ref(true)
const error = ref('')
const deleting = ref(false)
const { t, locale } = useI18n()

const templateId = computed(() => Number(route.params.id))

onMounted(async () => {
  try {
    template.value = await trainingApi.getTemplate(templateId.value)
  } catch (err: unknown) {
    error.value = getErrorMessage(err, {
      defaultMessage: t('Failed to load training template'),
    })
  } finally {
    loading.value = false
  }
})

function moduleLabel(mt: string) {
  if (mt === 'IK_MAT') return t('IK-Mat')
  if (mt === 'IK_ALKOHOL') return t('IK-Alkohol')
  return t('Shared')
}

function prettyEnum(value: string) {
  return value.replace(/_/g, ' ')
}

async function handleDelete() {
  if (!window.confirm(t('Delete this training template? This will also remove its assignments.'))) return
  deleting.value = true
  try {
    await trainingApi.deleteTemplate(templateId.value)
    router.push('/app/training')
  } catch (err: unknown) {
    error.value = getErrorMessage(err, {
      defaultMessage: t('Failed to delete training template'),
      byStatus: {
        403: t('You do not have permission to delete training templates'),
      },
    })
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <h1>{{ template?.title || t('Training Template') }}</h1>
        <p v-if="template" class="text-muted">
          {{ moduleLabel(template.moduleType) }} · {{ prettyEnum(template.category) }}
        </p>
      </div>
      <div class="actions">
        <button type="button" class="btn btn-secondary" @click="router.push('/app/training')">{{ t('Back') }}</button>
        <router-link
          v-if="auth.hasManageAccess && template"
          :to="`/app/training/templates/${template.id}/assign`"
          class="btn btn-primary"
        >
          {{ t('Assign Training') }}
        </router-link>
        <button
          v-if="auth.hasManageAccess && template"
          type="button"
          class="btn btn-danger"
          :disabled="deleting"
          @click="handleDelete"
        >
          {{ deleting ? t('Deleting...') : t('Delete') }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading"><div class="spinner" /></div>

    <div v-else-if="error" class="card">
      <div class="alert-error">{{ error }}</div>
    </div>

    <div v-else-if="template" class="template-layout">
      <section class="card">
        <div class="badges">
          <span class="status-badge info">{{ moduleLabel(template.moduleType) }}</span>
          <span class="status-badge">{{ prettyEnum(template.requiredForRole) }}</span>
          <span v-if="template.isMandatory" class="status-badge danger">{{ t('Mandatory') }}</span>
          <span class="status-badge" :class="template.active ? 'success' : 'warning'">
            {{ template.active ? t('Active') : t('Inactive') }}
          </span>
        </div>

        <div class="section">
          <h3>{{ t('Description') }}</h3>
          <p class="text-muted">{{ template.description || t('No description provided.') }}</p>
        </div>

        <div class="section">
          <h3>{{ t('Training Content') }}</h3>
          <p class="content">{{ template.contentText || t('No training content added yet.') }}</p>
        </div>
      </section>

      <aside class="card meta-card">
        <h3>{{ t('Template Details') }}</h3>
        <dl class="meta-list">
          <div>
            <dt>{{ t('Category') }}</dt>
            <dd>{{ prettyEnum(template.category) }}</dd>
          </div>
          <div>
            <dt>{{ t('Validity') }}</dt>
            <dd>{{ template.validityDays ? t('Valid for {days} days', { days: template.validityDays }) : t('No expiry') }}</dd>
          </div>
          <div>
            <dt>{{ t('Acknowledgment') }}</dt>
            <dd>{{ template.acknowledgmentRequired ? t('Required') : t('Not required') }}</dd>
          </div>
          <div>
            <dt>{{ t('Created') }}</dt>
            <dd>{{ new Date(template.createdAt).toLocaleString(locale) }}</dd>
          </div>
          <div>
            <dt>{{ t('Updated') }}</dt>
            <dd>{{ new Date(template.updatedAt).toLocaleString(locale) }}</dd>
          </div>
        </dl>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.template-layout {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(260px, 1fr);
  gap: 16px;
}

.badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.section + .section {
  margin-top: 20px;
}

.content {
  white-space: pre-wrap;
  line-height: 1.6;
}

.meta-card h3 {
  margin-bottom: 12px;
}

.meta-list {
  display: grid;
  gap: 12px;
}

.meta-list dt {
  font-size: 12px;
  color: var(--text);
  margin-bottom: 4px;
}

.meta-list dd {
  margin: 0;
  font-weight: 600;
}

.alert-error {
  padding: 10px 14px;
  background: var(--danger-bg);
  color: var(--danger);
  border-radius: var(--radius);
}
.btn-danger {
  background: var(--danger);
  color: white;
  border: none;
}
.btn-danger:hover {
  opacity: 0.9;
}

@media (max-width: 900px) {
  .template-layout {
    grid-template-columns: 1fr;
  }
}
</style>
