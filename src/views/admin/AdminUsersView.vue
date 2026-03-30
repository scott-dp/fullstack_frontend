<!-- Organization user management page for admins to invite, review, and disable users. -->
<script setup lang="ts">
/**
 * Admin user management view displaying a table of all users
 * in the organization with their roles. Accessible only to admins.
 */
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { userApi, type UserSummary } from '@/api/auth/users.ts'
import { organizationInviteApi, type OrganizationInvite } from '@/api/auth/organizationInvites.ts'
import { organizationApi, type OrganizationSummary } from '@/api/admin/organizations.ts'
import { useAuthStore } from '@/stores/auth.ts'

/** All users loaded from the server. */
const users = ref<UserSummary[]>([])
const invites = ref<OrganizationInvite[]>([])
const organizations = ref<OrganizationSummary[]>([])
/** Whether users are still being fetched. */
const loading = ref(true)
const auth = useAuthStore()
const role = ref(auth.isAdmin ? 'ROLE_MANAGER' : 'ROLE_STAFF')
const organizationId = ref<number | null>(auth.user?.organizationId ?? null)
const expiresInDays = ref(7)
const creatingInvite = ref(false)
const createInviteError = ref('')
const createInviteSuccess = ref('')
const latestInviteToken = ref('')
const deletingUserId = ref<number | null>(null)
const { t, locale } = useI18n()

onMounted(async () => {
  try {
    const [loadedUsers, loadedInvites, loadedOrganizations] = await Promise.all([
      userApi.list(),
      organizationInviteApi.list(),
      auth.isSuperAdmin ? organizationApi.list() : Promise.resolve([]),
    ])
    users.value = loadedUsers
    invites.value = loadedInvites
    organizations.value = loadedOrganizations
  } finally {
    loading.value = false
  }
})

async function createInvite() {
  createInviteError.value = ''
  createInviteSuccess.value = ''
  latestInviteToken.value = ''
  creatingInvite.value = true

  try {
    const invite = await organizationInviteApi.create({
      role: role.value,
      organizationId: auth.isSuperAdmin ? organizationId.value ?? undefined : undefined,
      expiresInDays: expiresInDays.value,
    })
    invites.value = [invite, ...invites.value]
    latestInviteToken.value = invite.token
    createInviteSuccess.value = t('Invite created for {organizationName}. Share the token below with the user.', {
      organizationName: invite.organizationName,
    })
  } catch {
    createInviteError.value = t('Failed to create invite')
  } finally {
    creatingInvite.value = false
  }
}

async function deleteUser(userId: number) {
  if (!window.confirm(t('Delete this user? This will remove their access.'))) return
  deletingUserId.value = userId
  createInviteError.value = ''
  try {
    await userApi.delete(userId)
    users.value = users.value.filter((user) => user.id !== userId)
  } catch {
    createInviteError.value = t('Failed to delete user')
  } finally {
    deletingUserId.value = null
  }
}

function roleLabel(roleName: string) {
  const labels: Record<string, string> = {
    ROLE_ADMIN: t('Admin'),
    ROLE_MANAGER: t('Manager'),
    ROLE_STAFF: t('Staff'),
    ROLE_SUPERADMIN: t('Superadmin'),
  }
  return labels[roleName] ?? roleName.replace('ROLE_', '')
}

function invitationStatus(invite: OrganizationInvite) {
  if (!invite.accepted) return t('Pending')
  return t('Accepted by {username}', { username: invite.acceptedByUsername })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(locale.value)
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>{{ t('User Management') }}</h1>
    </div>

    <div v-if="loading" class="loading"><div class="spinner" /></div>

    <template v-else>
      <div class="card invite-card">
        <h2>{{ t('Create Invitation') }}</h2>
        <p class="text-muted">
          {{ auth.isSuperAdmin
            ? t('Superadmins can create manager or staff invites for any restaurant.')
            : auth.isAdmin
              ? t('Admins can create manager or staff invites for their restaurant.')
              : t('Managers can invite staff users into their own restaurant.') }}
        </p>
        <div v-if="createInviteSuccess" class="alert-success">{{ createInviteSuccess }}</div>
        <div v-if="createInviteError" class="alert-error">{{ createInviteError }}</div>
        <form class="invite-grid" @submit.prevent="createInvite">
          <div class="form-group">
            <label class="form-label">{{ t('Role') }}</label>
            <select v-model="role" class="form-input" :disabled="!auth.hasManageAccess || creatingInvite">
              <option v-if="auth.isAdmin || auth.isSuperAdmin" value="ROLE_MANAGER">{{ t('Manager') }}</option>
              <option value="ROLE_STAFF">{{ t('Staff') }}</option>
            </select>
          </div>
          <div class="form-group" v-if="auth.isSuperAdmin">
            <label class="form-label">{{ t('Restaurant') }}</label>
            <select v-model="organizationId" class="form-input" :disabled="creatingInvite">
              <option :value="null" disabled>{{ t('Select restaurant') }}</option>
              <option v-for="organization in organizations" :key="organization.id" :value="organization.id">
                {{ organization.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">{{ t('Expires in days') }}</label>
            <input v-model.number="expiresInDays" class="form-input" type="number" min="1" max="30" :disabled="creatingInvite" />
          </div>
          <div class="invite-actions">
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="creatingInvite || (auth.isSuperAdmin && !organizationId)"
            >
              {{ creatingInvite ? t('Creating invite...') : t('Create invite') }}
            </button>
          </div>
        </form>

        <div v-if="latestInviteToken" class="token-box">
          <label class="form-label">{{ t('Latest invite token') }}</label>
          <code>{{ latestInviteToken }}</code>
        </div>
      </div>

      <div v-if="users.length === 0" class="empty-state">
        <h3>{{ t('No users found') }}</h3>
      </div>

      <div v-else class="card table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>{{ t('Username') }}</th>
              <th>{{ t('Name') }}</th>
              <th>{{ t('Roles') }}</th>
              <th v-if="auth.isAdmin">{{ t('Actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users" :key="u.id">
              <td>{{ u.id }}</td>
              <td><strong>{{ u.username }}</strong></td>
              <td>{{ [u.firstName, u.lastName].filter(Boolean).join(' ') || '-' }}</td>
              <td>
                <span v-for="role in u.roles" :key="role" class="status-badge info role-badge">
                  {{ roleLabel(role) }}
                </span>
              </td>
              <td v-if="auth.isAdmin">
                <button
                  v-if="!u.roles.includes('ROLE_ADMIN') && u.id !== auth.user?.id"
                  class="btn btn-danger btn-sm"
                  :disabled="deletingUserId === u.id"
                  @click="deleteUser(u.id)"
                >
                  {{ deletingUserId === u.id ? t('Deleting...') : t('Delete') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card table-wrapper">
        <h2>{{ t('Invitations') }}</h2>
        <table v-if="invites.length > 0">
          <thead>
            <tr>
              <th>{{ t('Restaurant') }}</th>
              <th>{{ t('Role') }}</th>
              <th>{{ t('Token') }}</th>
              <th>{{ t('Status') }}</th>
              <th>{{ t('Expires') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="invite in invites" :key="invite.id">
              <td>{{ invite.organizationName }}</td>
              <td>{{ roleLabel(invite.role) }}</td>
              <td><code>{{ invite.token }}</code></td>
              <td>{{ invitationStatus(invite) }}</td>
              <td>{{ formatDate(invite.expiresAt) }}</td>
            </tr>
          </tbody>
        </table>
        <div v-else class="empty-state compact-empty">
          <h3>{{ t('No invitations created yet') }}</h3>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.invite-card {
  margin-bottom: 24px;
}
.invite-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  align-items: end;
}
.invite-actions {
  display: flex;
  align-items: end;
}
.token-box {
  margin-top: 16px;
  padding: 12px;
  border-radius: var(--radius);
  background: var(--bg-secondary);
  border: 1px solid var(--border);
}
.token-box code {
  display: block;
  white-space: normal;
  overflow-wrap: anywhere;
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
.role-badge {
  margin-right: 4px;
}
.btn-danger {
  background: var(--danger);
  color: white;
  border: none;
}
.btn-danger:hover {
  opacity: 0.9;
}
.compact-empty {
  padding: 12px 0 0;
}
</style>
