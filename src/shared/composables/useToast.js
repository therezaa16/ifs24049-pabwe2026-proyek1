import { reactive } from 'vue';

const state = reactive({ items: [] });
let nextId = 1;

const DEFAULT_DURATION_MS = 4200;

export const useToast = () => {
  // Ubah array di tempat (bukan diganti) agar ToastHost, yang memegang referensi `items`, tetap reaktif.
  const dismiss = (id) => {
    const index = state.items.findIndex((item) => item.id === id);
    if (index >= 0) state.items.splice(index, 1);
  };

  const push = (message, tone = 'info', duration = DEFAULT_DURATION_MS) => {
    const id = nextId;
    nextId += 1;
    state.items.push({ id, message, tone });
    setTimeout(() => dismiss(id), duration);
    return id;
  };

  return {
    items: state.items,
    dismiss,
    success: (message) => push(message, 'success'),
    error: (message) => push(message, 'error', DEFAULT_DURATION_MS * 1.5),
    info: (message) => push(message, 'info')
  };
};
