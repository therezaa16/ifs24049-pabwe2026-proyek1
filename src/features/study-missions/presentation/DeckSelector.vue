<script setup>
import AppIcon from '@/shared/components/AppIcon.vue';

defineProps({
  decks: { type: Array, required: true },
  modelValue: { type: [Number, String], default: null }
});

const emit = defineEmits(['update:modelValue', 'read', 'delete']);
</script>

<template>
  <fieldset class="decks w-full border-0 m-0 p-0 space-y-2">
    <legend class="label block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Pilih materi kartu</legend>
    <div
      v-for="item in decks"
      :key="item.id"
      class="deck flex items-start justify-between p-3.5 rounded-xl border transition-all bg-white"
      :class="{ on: modelValue === item.id }"
    >
      <label class="flex items-start gap-3 cursor-pointer flex-1">
        <input
          type="radio"
          name="deck"
          :value="item.id"
          :checked="modelValue === item.id"
          class="mt-1 accent-brand-600"
          @change="emit('update:modelValue', item.id)"
        />
        <span>
          <strong class="text-sm font-bold text-slate-900 block">{{ item.title }}</strong>
          <small class="text-xs text-slate-500 block mt-0.5">
            <span class="font-semibold text-brand-700">{{ item.subject }}</span> · {{ item.cards?.length || 0 }} kartu
            <template v-if="item.description"> · {{ item.description }}</template>
          </small>
        </span>
      </label>

      <div class="flex items-center gap-1.5 shrink-0 ml-2">
        <button
          v-if="item.content"
          type="button"
          class="px-2 py-1 text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
          @click="emit('read', item)"
        >
          📖 Baca Materi
        </button>
        <button
          v-if="item.user_id"
          type="button"
          class="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
          :aria-label="`Hapus materi ${item.title}`"
          @click="emit('delete', item)"
        >
          <AppIcon name="trash" :size="15" />
        </button>
      </div>
    </div>
  </fieldset>
</template>

<style scoped>
.decks { border: 0; margin: 0; padding: 0; display: grid; gap: 0.5rem; width: 100%; }
.deck { border-color: var(--line); }
.deck:hover { border-color: var(--ink-faint); }
.deck.on { border-color: var(--cobalt); background: var(--cobalt-wash); }
</style>
