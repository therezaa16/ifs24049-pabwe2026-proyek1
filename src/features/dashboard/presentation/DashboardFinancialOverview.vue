<script setup>
import { RouterLink } from 'vue-router';
import { formatRupiah } from '@/core/format/formatters.js';
import AppIcon from '@/shared/components/AppIcon.vue';
import PadlockMark from '@/shared/components/PadlockMark.vue';

defineProps({ financial: { type: Object, required: true } });
</script>

<template>
  <RouterLink
    v-if="financial.counts.wantsLocked"
    class="vault group relative overflow-hidden flex flex-wrap items-center justify-between gap-4 p-5 bg-gradient-to-r from-amber-50 via-orange-50/80 to-rose-50/40 border border-amber-200/80 rounded-3xl text-amber-900 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all"
    to="/misi"
  >
    <div class="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-amber-100/40 to-transparent"></div>
    <div class="relative flex items-center gap-4">
      <div class="p-3 bg-white/80 rounded-2xl shadow-inner group-hover:scale-105 transition-transform">
        <PadlockMark :size="34" />
      </div>
      <div class="space-y-1">
        <p class="text-sm font-semibold leading-relaxed">
          <span class="num font-bold text-amber-950">{{ financial.counts.wantsLocked }} keinginan terkunci</span>
          senilai <span class="num font-bold text-amber-950">{{ formatRupiah(financial.totalWantsLocked) }}</span>
        </p>
        <p class="text-xs text-amber-800/80">Selesaikan misi belajar di halaman Misi Belajar untuk membuka gembok dan menghitungnya sebagai pengeluaran.</p>
      </div>
    </div>
    <div class="relative flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/80 text-amber-900 text-sm font-semibold shadow-sm group-hover:translate-x-1 transition-transform">
      Buka sekarang
      <AppIcon name="arrow" :size="18" />
    </div>
  </RouterLink>

  <section class="ledger relative overflow-hidden panel grid md:grid-cols-12 gap-6 items-center" aria-label="Ringkasan saldo">
    <div class="absolute -top-20 right-0 w-72 h-72 bg-gradient-to-br from-indigo-500/10 to-violet-500/5 blur-3xl"></div>
    <div class="balance relative md:col-span-5 space-y-2">
      <span class="eyebrow inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-[11px] font-extrabold uppercase tracking-[0.25em] text-indigo-600">Saldo aktif tersedia</span>
      <p
        class="balance-value num font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-none"
        :class="financial.activeBalance < 0 ? 'negative text-rose-600' : 'text-slate-900'"
      >
        {{ formatRupiah(financial.activeBalance) }}
      </p>
      <p class="balance-note text-sm text-slate-500">
        Pemasukan riil dikurangi pengeluaran yang benar-benar berlaku. Dana terkunci tidak ikut mengurangi saldo.
      </p>
    </div>

    <dl class="figures relative md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3 m-0">
      <div class="group p-4 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-white border border-emerald-100 space-y-1 shadow-sm hover:shadow-md transition-all">
        <dt class="text-xs font-semibold text-emerald-700 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Pemasukan
        </dt>
        <dd class="num income font-display font-extrabold text-xl text-emerald-700 m-0">{{ formatRupiah(financial.totalIncome) }}</dd>
      </div>
      <div class="group p-4 rounded-2xl bg-gradient-to-br from-slate-50/80 to-white border border-slate-100 space-y-1 shadow-sm hover:shadow-md transition-all">
        <dt class="text-xs font-semibold text-slate-600 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-slate-400"></span> Pengeluaran berlaku
        </dt>
        <dd class="num font-display font-extrabold text-xl text-slate-900 m-0">{{ formatRupiah(financial.totalActiveExpenses) }}</dd>
      </div>
      <div class="group p-4 rounded-2xl bg-gradient-to-br from-amber-50/80 to-white border border-amber-100 space-y-1 shadow-sm hover:shadow-md transition-all">
        <dt class="text-xs font-semibold text-amber-800 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-amber-500"></span> Dana terkunci
        </dt>
        <dd class="num locked font-display font-extrabold text-xl text-amber-900 m-0">{{ formatRupiah(financial.totalWantsLocked) }}</dd>
      </div>
      <div class="group p-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-white border border-indigo-100 space-y-1 shadow-sm hover:shadow-md transition-all">
        <dt class="text-xs font-semibold text-indigo-800 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-indigo-500"></span> Hemat (dibatalkan)
        </dt>
        <dd class="num saved font-display font-extrabold text-xl text-indigo-900 m-0">{{ formatRupiah(financial.totalWantsCancelled) }}</dd>
      </div>
    </dl>
  </section>
</template>
