<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const props = withDefaults(defineProps<{
  modelValue: string
  id: string
  label: string
  autocomplete?: string
  minlength?: number
  required?: boolean
  disabled?: boolean
  placeholder?: string
}>(), {
  autocomplete: 'current-password',
  minlength: undefined,
  required: false,
  disabled: false,
  placeholder: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { t } = useI18n()
const visible = ref(false)

const inputType = computed(() => (visible.value ? 'text' : 'password'))
const toggleLabel = computed(() => (visible.value ? t('Hide password') : t('Show password')))
</script>

<template>
  <div class="form-group">
    <label :for="id" class="form-label">{{ label }}</label>
    <div class="password-input-wrap">
      <input
        :id="id"
        :value="modelValue"
        :type="inputType"
        class="form-input password-input"
        :required="required"
        :disabled="disabled"
        :minlength="minlength"
        :autocomplete="autocomplete"
        :placeholder="placeholder"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <button
        type="button"
        class="password-toggle"
        :aria-label="toggleLabel"
        :title="toggleLabel"
        @click="visible = !visible"
      >
        {{ visible ? t('Hide') : t('Show') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.password-input-wrap {
  position: relative;
}

.password-input {
  padding-right: 72px;
}

.password-toggle {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  border: 0;
  background: transparent;
  color: var(--accent);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 6px;
}

.password-toggle:hover {
  color: var(--accent-hover);
}

.password-toggle:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: 4px;
}

.password-toggle:disabled {
  cursor: default;
  opacity: 0.6;
}
</style>
