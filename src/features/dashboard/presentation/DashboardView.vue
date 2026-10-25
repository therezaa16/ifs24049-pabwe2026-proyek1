<script setup>
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import AppIcon from '@/shared/components/AppIcon.vue';
import { useAuthStore } from '@/features/auth/application/auth.store.js';
import { useDashboardStore } from '../application/dashboard.store.js';
import { budgetUsage, firstName } from '../domain/dashboard.model.js';
import BudgetModal from './BudgetModal.vue';
import DashboardCharts from './DashboardCharts.vue';
import DashboardFinancialOverview from './DashboardFinancialOverview.vue';
import DashboardMetrics from './DashboardMetrics.vue';

const dashboard = useDashboardStore();
const auth = useAuthStore();

const loadError = ref('');
const showBudget = ref(false);
const data = computed(() => dashboard.data);
const usage = computed(() => budgetUsage(data.value?.financial));

const load = async () => {
  loadError.value = '';
  try {
    await Promise.all([dashboard.fetchSummary(), auth.restoreSession()]);
  } catch (error) {
    loadError.value = error.message;
  }
};

onMounted(load);
</script>

<template>
  <section class="space-y-8">
    <header class="head flex flex-wrap gap-6 items-start justify-between">
      <div class="space-y-2">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/15">
            <span class="text-lg">🎓</span>
          </div>
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">Dashboard</p>
            <h1 class="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
              Halo, {{ firstName(auth.user?.name) || 'Mahasiswa' }}!
            </h1>
          </div>
        </div>
        <p class="sub text-sm md:text-base text-slate-500 max-w-2xl">
          Pantau saldo aktif, anggaran saku, dan capaian misi belajar Active Recall & Pomodoro dalam satu tampilan yang terarah.
        </p>
      </div>
      <RouterLink class="btn btn-primary px-5 py-2.5 rounded-2xl font-semibold text-sm flex items-center gap-2 shrink-0" to="/transaksi">
        <AppIcon name="plus" :size="18" /> Catat transaksi
      </RouterLink>
    </header>

    <p v-if="loadError" class="state error p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-2xl text-center" role="alert">
      {{ loadError }} <button type="button" class="btn btn-small ml-2 underline font-bold" @click="load">Coba lagi</button>
    </p>
    <div v-else-if="!data" class="state p-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
      <span class="animate-spin text-xl">⏳</span> Memuat ringkasan dashboard…
    </div>

    <template v-else>
      <DashboardFinancialOverview :financial="data.financial" />
      <DashboardMetrics
        :financial="data.financial"
        :study="data.study"
        :usage="usage"
        @configure-budget="showBudget = true"
      />
      <DashboardCharts :charts="data.charts" :recent="data.recent" />
    </template>

    <BudgetModal
      v-if="showBudget"
      :current="data?.financial?.monthlyBudget ?? 0"
      @close="showBudget = false"
      @saved="load"
    />
  </section>
</template>

<style scoped>
.head { display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-end; justify-content: space-between; }
.sub { color: var(--ink-soft); }
</style>
