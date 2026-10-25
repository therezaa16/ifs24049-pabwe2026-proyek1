<script setup>
import { RouterLink } from 'vue-router';
import AppIcon from '@/shared/components/AppIcon.vue';

defineProps({
  item: { type: Object, required: true },
  variant: { type: String, required: true }
});
</script>

<template>
  <RouterLink
    :to="item.to"
    :exact-active-class="item.exact ? 'active' : ''"
    :active-class="item.exact ? '' : 'active'"
    :class="variant === 'sidebar'
      ? 'nav-link group flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-semibold text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition-all'
      : 'tab-link flex flex-col items-center gap-1 py-1 text-[10px] font-semibold text-slate-500 transition-colors'"
  >
    <template v-if="variant === 'sidebar'">
      <div class="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100/70 group-hover:bg-white group-[.active]:bg-gradient-to-br group-[.active]:from-indigo-500 group-[.active]:to-violet-600 transition-all">
        <AppIcon :name="item.icon" :size="18" class="text-slate-500 group-hover:text-slate-900 group-[.active]:text-white" />
      </div>
      <span class="flex-1">{{ item.label }}</span>
      <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 opacity-0 group-[.active]:opacity-100 transition-opacity"></span>
    </template>
    <template v-else>
      <div class="w-9 h-9 rounded-xl flex items-center justify-center">
        <AppIcon :name="item.icon" :size="19" />
      </div>
      <span>{{ item.label }}</span>
    </template>
  </RouterLink>
</template>
