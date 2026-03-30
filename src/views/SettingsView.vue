<script setup lang="ts">
/**
 * Settings view allowing the user to view and update their profile
 * (first name, last name, email). Displays read-only username and roles.
 */
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { userApi } from '@/api/users'
import { getErrorMessage } from '@/api/client'

const auth = useAuthStore()
const { t } = useI18n()
/** Bound first name input value. */
const firstName = ref('')
/** Bound last name input value. */
const lastName = ref('')
/** Bound email input value. */
const email = ref('')
/** Success message displayed after a profile update. */
const success = ref('')
/** Error message from the last save attempt. */
const error = ref('')
/** Whether the profile is currently being saved. */
const saving = ref(false)

onMounted(() => {
  if (auth.user) {
    firstName.value = auth.user.firstName || ''
    lastName.value = auth.user.lastName || ''
    email.value = auth.user.email || ''
  }
})

/**
 * Saves the updated profile to the server and refreshes the auth store.
 * Displays a success or error message based on the result.
 */
async function save() {
  error.value = ''
  success.value = ''
  saving.value = true
  try {
    const updated = await userApi.updateProfile({
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value,
    })
    auth.user = updated
    success.value = t('Profile updated successfully')
  } catch (err: unknown) {
    error.value = getErrorMessage(err, {
      defaultMessage: t('Failed to update profile'),
      byStatus: {
        400: t('Please check your profile details and try again'),
      },
    })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>{{ t('Settings') }}</h1>
    </div>

    <div class="card" style="max-width: 500px;">
      <h2>{{ t('Profile') }}</h2>
      <div v-if="success" class="alert-success">{{ success }}</div>
      <div v-if="error" class="alert-error">{{ error }}</div>
      <form @submit.prevent="save">
        <div class="form-group">
          <label class="form-label">{{ t('Username') }}</label>
          <input :value="auth.user?.username" class="form-input" disabled />
        </div>
        <div class="form-group">
          <label class="form-label">{{ t('First Name') }}</label>
          <input v-model="firstName" class="form-input" maxlength="100" />
        </div>
        <div class="form-group">
          <label class="form-label">{{ t('Last Name') }}</label>
          <input v-model="lastName" class="form-input" maxlength="100" />
        </div>
        <div class="form-group">
          <label class="form-label">{{ t('Email') }}</label>
          <input v-model="email" type="email" class="form-input" maxlength="255" />
        </div>
        <div class="form-group">
          <label class="form-label">{{ t('Roles') }}</label>
          <div class="roles-display">
            <span v-for="role in auth.user?.roles" :key="role" class="status-badge info">
              {{ role.replace('ROLE_', '') }}
            </span>
          </div>
        </div>
        <button type="submit" class="btn btn-primary" :disabled="saving">
          {{ saving ? t('Saving...') : t('Save Changes') }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
h2 {
  margin-bottom: 16px;
}
.alert-success {
  padding: 10px 14px;
  background: var(--success-bg);
  color: var(--success);
  border-radius: var(--radius);
  font-size: 14px;
  margin-bottom: 16px;
}
.alert-error {
  padding: 10px 14px;
  background: var(--danger-bg);
  color: var(--danger);
  border-radius: var(--radius);
  font-size: 14px;
  margin-bottom: 16px;
}
.roles-display {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
</style>
