<script setup>
import { formatDate, formatMinutes, formatRupiah } from '@/core/format/formatters.js';
import { MISSION_LABELS } from '@/shared/domain/mission-types.js';
import { STATUS_LABELS, STATUS_TONES } from '@/shared/presentation/transaction.presenter.js';
import AllocationChart from './charts/AllocationChart.vue';
import CategoryChart from './charts/CategoryChart.vue';
import WeeklyTrendChart from './charts/WeeklyTrendChart.vue';

defineProps({
  charts: { type: Object, required: true },
  recent: { type: Object, required: true }
});
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
    <article class="panel lg:col-span-5 relative overflow-hidden">
      <div class="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-transparent blur-2xl"></div>
      <div class="relative">
        <p class="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-500">Alokasi</p>
        <h2 class="panel-title text-lg font-extrabold text-slate-900 mt-1">Dana saku</h2>
        <p class="panel-hint text-sm text-slate-500">Proporsi keinginan vs kebutuhan berdasarkan status saat ini.</p>
        <div class="h-64 flex items-center justify-center">
          <AllocationChart :allocation="charts.allocation" />
        </div>
      </div>
    </article>

    <article class="panel lg:col-span-7 relative overflow-hidden">
      <div class="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-violet-500/10 to-transparent blur-2xl"></div>
      <div class="relative">
        <p class="text-xs font-semibold uppercase tracking-[0.25em] text-violet-600">Tren</p>
        <h2 class="panel-title text-lg font-extrabold text-slate-900 mt-1">7 hari terakhir</h2>
        <p class="panel-hint text-sm text-slate-500">Pengeluaran berlaku dan menit belajar per hari untuk melihat ritme belajarmu.</p>
        <div class="h-64 flex items-center justify-center">
          <WeeklyTrendChart :trends="charts.weeklyTrends" />
        </div>
      </div>
    </article>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
    <article class="panel lg:col-span-6 relative overflow-hidden">
      <div class="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-transparent blur-2xl"></div>
      <div class="relative">
        <p class="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-600">Kategori</p>
        <h2 class="panel-title text-lg font-extrabold text-slate-900 mt-1">Pengeluaran per kategori</h2>
        <p class="panel-hint text-sm text-slate-500">Pengeluaran berlaku bulan berjalan untuk mengetahui pos terbesar.</p>
        <div class="h-64 flex items-center justify-center">
          <CategoryChart :categories="charts.categorySpending" />
        </div>
      </div>
    </article>

    <article class="panel lg:col-span-6 flex flex-col justify-between relative overflow-hidden">
      <div class="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-indigo-500/10 to-transparent blur-2xl"></div>
      <div class="relative">
        <p class="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-500">Aktivitas</p>
        <h2 class="panel-title text-lg font-extrabold text-slate-900 mt-1">Terbaru</h2>
        <p class="panel-hint text-sm text-slate-500">Transaksi terakhir dan sesi misi yang baru selesai.</p>
        <ul class="recent space-y-2.5 max-h-64 overflow-y-auto pr-1">
          <li
            v-for="item in recent.transactions"
            :key="`t-${item.id}`"
            class="flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all text-sm"
          >
            <div class="overflow-hidden pr-3">
              <span class="font-semibold text-slate-900 block truncate">{{ item.title }}</span>
              <small class="text-xs text-slate-400 block mt-0.5">{{ formatDate(item.created_at) }}</small>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <span class="px-2 py-0.5 rounded-full text-[11px] font-semibold" :class="`chip-${STATUS_TONES[item.status]}`">{{ STATUS_LABELS[item.status] }}</span>
              <strong class="num text-sm font-bold text-slate-900">{{ formatRupiah(item.amount) }}</strong>
            </div>
          </li>
          <li
            v-for="mission in recent.missions"
            :key="`m-${mission.id}`"
            class="flex items-center justify-between p-3 rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50/60 to-white text-sm"
          >
            <div class="overflow-hidden pr-3">
              <span class="font-semibold text-violet-900 block truncate">{{ mission.subject }}</span>
              <small class="text-xs text-violet-600/80 block mt-0.5">{{ MISSION_LABELS[mission.mission_type] }} · {{ formatDate(mission.completed_at) }}</small>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <span class="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-violet-100 text-violet-700">Misi</span>
              <strong class="num text-sm font-bold text-violet-900">{{ formatMinutes(mission.duration_minutes) }}</strong>
            </div>
          </li>
        </ul>
        <p v-if="!recent.transactions.length && !recent.missions.length" class="panel-hint text-sm text-slate-400 text-center py-10">
          Belum ada aktivitas transaksi maupun misi belajar.
        </p>
      </div>
    </article>
  </div>
</template>

<style scoped>
.recent { list-style: none; margin: 0; padding: 0; }
</style>
