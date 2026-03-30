<!-- Platform-level dashboard for superadmins provisioning organizations and org admins. -->
<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { superAdminApi, type OrganizationAdminSummary } from '@/api/admin/superAdmin.ts'
import { organizationApi, type OrganizationSummary } from '@/api/admin/organizations.ts'
import { getErrorMessage } from '@/api/core/client.ts'

const loading = ref(true)
const saving = ref(false)
const archivingId = ref<number | null>(null)
const error = ref('')
const success = ref('')
const admins = ref<OrganizationAdminSummary[]>([])
const organizations = ref<OrganizationSummary[]>([])

const form = ref({
  organizationName: '',
  organizationNumber: '',
  organizationType: 'RESTAURANT',
  firstName: '',
  lastName: '',
  email: '',
})

const activeAdmins = computed(() => admins.value.filter((admin) => admin.active))
const pendingAdmins = computed(() => admins.value.filter((admin) => admin.setupPending))

onMounted(loadData)

async function loadData() {
  loading.value = true
  error.value = ''
  try {
    const [loadedAdmins, loadedOrganizations] = await Promise.all([
      superAdminApi.listOrganizationAdmins(),
      organizationApi.list(),
    ])
    admins.value = loadedAdmins
    organizations.value = loadedOrganizations
  } catch (err: unknown) {
    error.value = getErrorMessage(err, {
      defaultMessage: 'Failed to load superadmin data',
      byStatus: {
        403: 'You do not have access to the superadmin dashboard.',
      },
    })
  } finally {
    loading.value = false
  }
}

async function handleCreate() {
  error.value = ''
  success.value = ''
  saving.value = true
  try {
    const created = await superAdminApi.createOrganizationAdmin({
      organizationName: form.value.organizationName,
      organizationNumber: form.value.organizationNumber || undefined,
      organizationType: form.value.organizationType,
      firstName: form.value.firstName,
      lastName: form.value.lastName || undefined,
      email: form.value.email,
    })
    admins.value = [created, ...admins.value]
    await loadData()
    success.value = `Admin invite sent to ${created.email}.`
    form.value = {
      organizationName: '',
      organizationNumber: '',
      organizationType: 'RESTAURANT',
      firstName: '',
      lastName: '',
      email: '',
    }
  } catch (err: unknown) {
    error.value = getErrorMessage(err, {
      defaultMessage: 'Failed to create organization admin',
      byStatus: {
        400: 'Could not create the organization admin. Check the form values and use an email that is not already in use.',
      },
    })
  } finally {
    saving.value = false
  }
}

async function archiveAdmin(adminId: number) {
  if (!window.confirm('Archive this organization admin? They will lose access immediately.')) return
  archivingId.value = adminId
  error.value = ''
  try {
    await superAdminApi.archiveOrganizationAdmin(adminId)
    admins.value = admins.value.map((admin) => admin.id === adminId ? { ...admin, active: false, setupPending: false } : admin)
  } catch (err: unknown) {
    error.value = getErrorMessage(err, {
      defaultMessage: 'Failed to archive organization admin',
      byStatus: {
        400: 'This organization admin could not be archived.',
      },
    })
  } finally {
    archivingId.value = null
  }
}
</script>

<template>
  <div>
    <div class="page-header">
      <h1>Superadmin Dashboard</h1>
    </div>

    <div v-if="loading" class="loading"><div class="spinner" /></div>

    <template v-else>
      <div v-if="error" class="alert-error">{{ error }}</div>
      <div v-if="success" class="alert-success">{{ success }}</div>

      <div class="stats-grid">
        <div class="stat-card card">
          <span class="stat-label">Organizations</span>
          <span class="stat-value">{{ organizations.length }}</span>
        </div>
        <div class="stat-card card">
          <span class="stat-label">Active Admins</span>
          <span class="stat-value info">{{ activeAdmins.length }}</span>
        </div>
        <div class="stat-card card">
          <span class="stat-label">Pending Setup</span>
          <span class="stat-value warning">{{ pendingAdmins.length }}</span>
        </div>
      </div>

      <div class="card form-card">
        <h2>Create Organization Admin</h2>
        <form class="form-grid" @submit.prevent="handleCreate">
          <div class="form-group">
            <label class="form-label">Organization name</label>
            <input v-model="form.organizationName" class="form-input" required maxlength="255" />
          </div>
          <div class="form-group">
            <label class="form-label">Organization number</label>
            <input v-model="form.organizationNumber" class="form-input" maxlength="50" />
          </div>
          <div class="form-group">
            <label class="form-label">Organization type</label>
            <select v-model="form.organizationType" class="form-input">
              <option value="RESTAURANT">Restaurant</option>
              <option value="BAR">Bar</option>
              <option value="CAFE">Cafe</option>
              <option value="HOTEL">Hotel</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Admin first name</label>
            <input v-model="form.firstName" class="form-input" required maxlength="100" />
          </div>
          <div class="form-group">
            <label class="form-label">Admin last name</label>
            <input v-model="form.lastName" class="form-input" maxlength="100" />
          </div>
          <div class="form-group">
            <label class="form-label">Admin email</label>
            <input v-model="form.email" class="form-input" type="email" required maxlength="255" autocomplete="email" />
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Sending invite...' : 'Create org and invite admin' }}
            </button>
          </div>
        </form>
      </div>

      <div class="card table-wrapper">
        <h2>Organization Admins</h2>
        <table v-if="admins.length > 0">
          <thead>
            <tr>
              <th>Organization</th>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="admin in admins" :key="admin.id">
              <td>{{ admin.organizationName || '-' }}</td>
              <td>{{ [admin.firstName, admin.lastName].filter(Boolean).join(' ') || admin.username }}</td>
              <td>{{ admin.email }}</td>
              <td>
                <span class="status-badge" :class="admin.active ? (admin.setupPending ? 'warning' : 'success') : 'danger'">
                  {{ admin.active ? (admin.setupPending ? 'Pending setup' : 'Active') : 'Archived' }}
                </span>
              </td>
              <td>{{ new Date(admin.createdAt).toLocaleString() }}</td>
              <td>
                <button
                  v-if="admin.active"
                  class="btn btn-danger btn-sm"
                  :disabled="archivingId === admin.id"
                  @click="archiveAdmin(admin.id)"
                >
                  {{ archivingId === admin.id ? 'Archiving...' : 'Archive' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="empty-state compact-empty">
          <h3>No organization admins yet</h3>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.form-card {
  margin-top: 24px;
  margin-bottom: 24px;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}
.form-actions {
  display: flex;
  align-items: end;
}
.stat-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.stat-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-h);
}
.stat-value.info {
  color: var(--accent);
}
.stat-value.warning {
  color: var(--warning);
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
.btn-danger {
  background: var(--danger);
  color: white;
  border: none;
}
.compact-empty {
  padding: 12px 0 0;
}
</style>
