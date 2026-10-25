<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, useId } from 'vue';
import AppIcon from './AppIcon.vue';

defineProps({
  title: { type: String, required: true },
  wide: { type: Boolean, default: false }
});
const emit = defineEmits(['close']);

const dialog = ref(null);
const titleId = useId();
let previouslyFocused = null;

const focusableElements = () => {
  if (!dialog.value) return [];

  return [...dialog.value.querySelectorAll(
    'a[href], button:not(:disabled), input:not(:disabled):not([type="hidden"]), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
  )].filter((element) => !element.hasAttribute('hidden') && element.getAttribute('aria-hidden') !== 'true');
};

const onKeydown = (event) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    emit('close');
    return;
  }

  if (event.key !== 'Tab') return;

  const focusable = focusableElements();
  if (focusable.length === 0) {
    event.preventDefault();
    dialog.value?.focus();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && (document.activeElement === first || !dialog.value.contains(document.activeElement))) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (document.activeElement === last || !dialog.value.contains(document.activeElement))) {
    event.preventDefault();
    first.focus();
  }
};

onMounted(async () => {
  previouslyFocused = document.activeElement;
  document.addEventListener('keydown', onKeydown);
  await nextTick();
  const firstFocusable = focusableElements()[0];
  (firstFocusable || dialog.value)?.focus();
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown);
  if (previouslyFocused?.isConnected) previouslyFocused.focus();
});
</script>

<template>
  <div class="backdrop" @mousedown.self="emit('close')">
    <dialog
      ref="dialog"
      open
      class="dialog"
      :class="{ 'dialog-wide': wide }"
      aria-modal="true"
      :aria-labelledby="titleId"
      tabindex="-1"
    >
      <header class="dialog-head">
        <h2 :id="titleId">{{ title }}</h2>
        <button type="button" class="btn btn-quiet btn-small" aria-label="Tutup" @click="emit('close')">
          <AppIcon name="close" />
        </button>
      </header>
      <div class="dialog-body"><slot /></div>
    </dialog>
  </div>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: radial-gradient(circle, rgba(15, 23, 42, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%);
  backdrop-filter: blur(6px);
}
.dialog {
  position: relative;
  inset: auto;
  margin: 0;
  width: min(30rem, 100%);
  max-width: none;
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
  color: var(--ink);
  background: linear-gradient(180deg, rgba(255,255,255,0.98) 0%, #fff 100%);
  border: 1px solid var(--line);
  border-radius: var(--radius-l);
  box-shadow: var(--shadow-elevated);
  animation: dialog-in 0.25s ease-out;
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
