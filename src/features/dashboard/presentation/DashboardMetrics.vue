<script setup>
import { computed } from 'vue';
import { formatMinutes, formatRupiah } from '@/core/format/formatters.js';
import { disciplineLabel } from '../domain/dashboard.model.js';

const props = defineProps({
  financial: { type: Object, required: true },
  study: { type: Object, required: true },
  usage: { type: Object, required: true }
});

const emit = defineEmits(['configure-budget']);
const ringStyle = computed(() => ({ '--score': `${props.financial.disciplineScore ?? 0}%` }));
</script>

<template>
  <div class="trio grid grid-cols-1 md:grid-cols-3 gap-5">
    <article class="panel group relative overflow-hidden flex flex-col justify-between">
      <div class="absolute -top-16 -right-16 w-40 h-40 bg-gradient-to-br from-indigo-500/10 to-transparent blur-2xl"></div>
      <div class="relative">
        <div class="inline-head flex justify-between items-start gap-2 mb-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-500">Anggaran</p>
            <h2 class="panel-title text-lg font-extrabold text-slate-900 mt-1">Bulan ini</h2>
          </div>
          <button
            type="button"
            class="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50/70 transition-all"
            @click="emit('configure-budget')"
          >
            Atur
          </button>
        </div>
        <template v-if="usage.hasBudget">
          <p class="big num font-display font-extrabold text-3xl text-slate-900">
            {{ formatRupiah(Math.abs(financial.remainingBudget)) }}
          </p>
          <p class="panel-hint text-sm text-slate-500 mt-1">
            {{ usage.over ? 'Melebihi anggaran' : 'Sisa anggaran' }} dari {{ formatRupiah(financial.monthlyBudget) }}
          </p>
          <progress
            class="bar w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-5"
            :class="`bar-${usage.level}`"
            :value="usage.percent"
            max="100"
            aria-label="Pemakaian anggaran"
          ></progress>
          <p class="bar-label num text-xs font-semibold text-slate-500 mt-2">
            Terpakai {{ formatRupiah(financial.monthlySpending) }} • {{ usage.percent }}%
          </p>
        </template>
        <div v-else class="py-6 text-center space-y-3">
          <p class="panel-hint text-sm text-slate-500">Belum ada anggaran bulanan. Atur agar sisa dana lebih terkontrol.</p>
          <button
            type="button"
            class="px-4 py-2 text-sm font-semibold rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/15 hover:shadow-indigo-500/25 transition-all"
            @click="emit('configure-budget')"
          >
            + Tentukan Anggaran Bulanan
          </button>
        </div>
      </div>
    </article>

    <article class="panel relative overflow-hidden flex flex-col items-center text-center">
      <div class="absolute -top-16 left-1/2 -translate-x-1/2 w-40 h-40 bg-gradient-to-br from-emerald-500/10 to-transparent blur-2xl"></div>
      <div class="relative self-start mb-4">
        <p class="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-600">Disiplin</p>
        <h2 class="panel-title text-lg font-extrabold text-slate-900 mt-1">Skor kamu</h2>
      </div>
      <div class="ring relative w-28 h-28 my-2" :style="ringStyle">
        <div class="absolute inset-2 rounded-full bg-white flex items-center justify-center shadow-inner">
          <span class="num font-display font-extrabold text-3xl text-slate-900">{{ financial.disciplineScore ?? 0 }}%</span>
        </div>
      </div>
      <p class="panel-hint text-sm text-slate-500 max-w-xs mt-3">
        <span class="font-bold text-slate-900">{{ disciplineLabel(financial.disciplineScore) }}</span>. Dihitung dari keinginan yang dibuka lewat belajar atau dibatalkan.
      </p>
    </article>

    <article class="panel relative overflow-hidden flex flex-col justify-between">
      <div class="absolute -top-16 -right-10 w-40 h-40 bg-gradient-to-br from-violet-500/10 to-transparent blur-2xl"></div>
      <div class="relative">
        <p class="text-xs font-semibold uppercase tracking-[0.25em] text-violet-600">Belajar</p>
        <h2 class="panel-title text-lg font-extrabold text-slate-900 mt-1">Total waktu</h2>
        <p class="big num font-display font-extrabold text-3xl text-slate-900 mt-3">{{ formatMinutes(study.totalMinutes) }}</p>
        <p class="panel-hint text-sm text-slate-500 mt-1">dari {{ study.totalMissions }} misi selesai</p>
      </div>
      <div class="relative mt-6 p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-100 space-y-2">
        <p class="text-sm font-semibold text-slate-900">
          Rata-rata skor: <span class="num font-bold text-violet-600">{{ study.avgScore }}</span>
        </p>
        <div class="flex items-center gap-4 text-xs text-slate-500">
          <span class="flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Pomodoro: <strong class="text-slate-700">{{ study.pomodoroCount }}</strong></span>
          <span class="flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active Recall: <strong class="text-slate-700">{{ study.activeRecallCount }}</strong></span>
        </div>
      </div>
    </article>
  </div>
</template>

<style scoped>
.bar { appearance: none; border: 0; }
.bar::-webkit-progress-bar { background: var(--surface-sunken); }
.bar-ok::-webkit-progress-value { background: linear-gradient(90deg, var(--cobalt), var(--violet-deep)); }
.bar-warning::-webkit-progress-value { background: linear-gradient(90deg, var(--amber-400), var(--orange-500)); }
.bar-danger::-webkit-progress-value { background: linear-gradient(90deg, var(--rose-500), var(--rose)); }
.bar::-moz-progress-bar { background: var(--cobalt); }
.bar-warning::-moz-progress-bar { background: rgb(var(--brass-600)); }
.bar-danger::-moz-progress-bar { background: var(--rose); }
.ring { background: conic-gradient(var(--success) var(--score, 0%), var(--line) 0); }
</style>
