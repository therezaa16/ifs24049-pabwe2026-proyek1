<script setup>
import { computed } from 'vue';

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  error: { type: String, default: '' },
  hint: { type: String, default: '' }
});

// id pesan error/petunjuk dirujuk input lewat aria-describedby agar dibacakan pembaca layar.
const describedBy = computed(() => {
  if (props.error) return `${props.id}-error`;
  return props.hint ? `${props.id}-hint` : undefined;
});
</script>

<template>
  <div class="field">
    <label :for="id">{{ label }}</label>
    <slot :invalid="Boolean(error)" :describedBy="describedBy" />
    <span v-if="error" :id="`${id}-error`" class="field-error">{{ error }}</span>
    <span v-else-if="hint" :id="`${id}-hint`" class="field-hint">{{ hint }}</span>
  </div>
</template>
