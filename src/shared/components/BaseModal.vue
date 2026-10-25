<script setup>
import { onBeforeUnmount, onMounted, ref, useId } from 'vue';
import AppIcon from './AppIcon.vue';

defineProps({
  title: { type: String, required: true },
  wide: { type: Boolean, default: false }
});
const emit = defineEmits(['close']);

const dialog = ref(null);
const titleId = useId();

onMounted(() => {
  dialog.value.showModal();
});

onBeforeUnmount(() => {
  dialog.value.close();
});
</script>

<template>
  <dialog
    ref="dialog"
    class="dialog"
    :class="{ 'dialog-wide': wide }"
    :aria-labelledby="titleId"
    @cancel.prevent="emit('close')"
    @click.self="emit('close')"
  >
    <header class="dialog-head">
      <h2 :id="titleId">{{ title }}</h2>
      <button type="button" class="btn btn-quiet btn-small" aria-label="Tutup" autofocus @click="emit('close')">
        <AppIcon name="close" />
      </button>
    </header>
    <div class="dialog-body"><slot /></div>
  </dialog>
</template>

<style scoped>
.dialog {
  position: fixed;
  inset: 0;
  margin: auto;
  width: min(30rem, 100%);
  max-width: none;
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
  color: var(--ink);
  background: linear-gradient(180deg, rgba(255,255,255,0.98) 0%, var(--surface) 100%);
  border: 1px solid var(--line);
  border-radius: var(--radius-l);
  box-shadow: var(--shadow-elevated);
  animation: dialog-in 0.25s ease-out;
}
.dialog::backdrop {
  background: radial-gradient(circle, rgba(15, 23, 42, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%);
  backdrop-filter: blur(6px);
}
.dialog-wide { width: min(38rem, 100%); }
.dialog:focus { outline: none; }
.dialog-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.1rem 1.4rem;
  border-bottom: 1px solid var(--line);
}
.dialog-head h2 { font-size: 1.25rem; font-weight: 800; }
.dialog-body { padding: 1.4rem; }

@keyframes dialog-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: none; }
}
</style>
