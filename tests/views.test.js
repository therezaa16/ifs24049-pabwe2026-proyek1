import { flushPromises, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryHistory, createRouter } from 'vue-router';
import { ApiError } from '@/core/http/api-error.js';

const chartInstances = [];
vi.mock('chart.js', () => {
  const Chart = vi.fn(function ChartMock(canvas, config) {
    this.canvas = canvas;
    this.config = config;
    this.destroy = vi.fn();
    chartInstances.push(this);
  });
  Chart.register = vi.fn();
  const element = {};
  return {
    Chart,
    ArcElement: element, BarController: element, BarElement: element, CategoryScale: element,
    DoughnutController: element, Legend: element, LineController: element, LineElement: element,
    LinearScale: element, PointElement: element, Tooltip: element
  };
});

vi.mock('@/core/http/index.js', () => ({
  httpClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  setUnauthorizedHandler: vi.fn()
}));

import { httpClient } from '@/core/http/index.js';
import App from '@/App.vue';
import AppShell from '@/app/layouts/AppShell.vue';
import { createAppRouter, routes } from '@/app/router/index.js';
import ProfileView from '@/features/profile/presentation/ProfileView.vue';
import RegisterView from '@/features/auth/presentation/RegisterView.vue';
import EmptyState from '@/shared/components/EmptyState.vue';
import ToastHost from '@/shared/components/ToastHost.vue';
import { useToast } from '@/shared/composables/useToast.js';
import { authApi } from '@/features/auth/infrastructure/auth.api.js';
import { dashboardApi } from '@/features/dashboard/infrastructure/dashboard.api.js';
import { missionsApi } from '@/features/study-missions/infrastructure/missions.api.js';
import { transactionsApi } from '@/features/transactions/infrastructure/transactions.api.js';
import { useChart } from '@/features/dashboard/presentation/charts/useChart.js';
import AllocationChart from '@/features/dashboard/presentation/charts/AllocationChart.vue';
import CategoryChart from '@/features/dashboard/presentation/charts/CategoryChart.vue';
import WeeklyTrendChart from '@/features/dashboard/presentation/charts/WeeklyTrendChart.vue';
import BaseModal from '@/shared/components/BaseModal.vue';
import BudgetModal from '@/features/dashboard/presentation/BudgetModal.vue';
import DashboardMetrics from '@/features/dashboard/presentation/DashboardMetrics.vue';
import DashboardView from '@/features/dashboard/presentation/DashboardView.vue';
import MissionHistory from '@/features/study-missions/presentation/MissionHistory.vue';
import StudyMissionsView from '@/features/study-missions/presentation/StudyMissionsView.vue';
import UnlockCelebration from '@/features/study-missions/presentation/UnlockCelebration.vue';
import TransactionFormModal from '@/features/transactions/presentation/TransactionFormModal.vue';
import TransactionsView from '@/features/transactions/presentation/TransactionsView.vue';
import { useAuthStore } from '@/features/auth/application/auth.store.js';
import { useMissionsStore } from '@/features/study-missions/application/missions.store.js';
import { useTransactionsStore } from '@/features/transactions/application/transactions.store.js';

const stubs = { teleport: true };

const buildRouter = (extra = []) => createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<p>home</p>' } },
    { path: '/masuk', component: { template: '<p>masuk</p>' } },
    { path: '/daftar', component: { template: '<p>daftar</p>' } },
    { path: '/transaksi', component: { template: '<p>transaksi</p>' } },
    { path: '/misi', component: { template: '<p>misi</p>' } },
    ...extra
  ]
});

const lockedWish = { id: 1, type: 'keinginan', status: 'terkunci', title: 'Boba', amount: 25000, category: 'Hiburan', mission_type: 'pomodoro', created_at: '2026-10-01T00:00:00Z' };
const recallWish = { ...lockedWish, id: 2, title: 'Skin game', mission_type: 'active_recall' };

const summary = (overrides = {}) => ({
  financial: {
    activeBalance: 100000, counts: { wantsLocked: 1 }, disciplineScore: 80, monthlyBudget: 500000, monthlySpending: 100000,
    remainingBudget: 400000, totalActiveExpenses: 100000, totalIncome: 200000, totalWantsCancelled: 5000, totalWantsLocked: 25000
  },
  study: { activeRecallCount: 1, avgScore: 80, pomodoroCount: 2, totalMinutes: 50 },
  charts: {
    allocation: { labels: ['a', 'b', 'c', 'd'], data: [1, 2, 3, 4] },
    categorySpending: { labels: ['Hiburan'], data: [5] },
    weeklyTrends: { dates: ['2026-10-01'], expenses: [1000], lockedWants: [500], cancelledWants: [200] }
  },
  recent: {
    transactions: [{ id: 1, title: 'Boba', amount: 1000, status: 'aktif', created_at: '2026-10-01T00:00:00Z' }],
    missions: [{ id: 1, subject: 'Vue', mission_type: 'pomodoro', duration_minutes: 25, completed_at: '2026-10-01T00:00:00Z' }]
  },
  ...overrides
});

beforeEach(() => {
  setActivePinia(createPinia());
  localStorage.clear();
  vi.clearAllMocks();
  chartInstances.length = 0;
});
afterEach(() => vi.useRealTimers());

describe('lapisan API (infrastructure)', () => {
  it('authApi memetakan payload ke endpoint', async () => {
    httpClient.post.mockResolvedValue({});
    httpClient.get.mockResolvedValue({});
    httpClient.patch.mockResolvedValue({});
    await authApi.login({ email: ' a@b.c ', password: 'x' });
    expect(httpClient.post).toHaveBeenCalledWith('/auth/login', { email: 'a@b.c', password: 'x' });
    await authApi.register({ name: ' N ', email: ' a@b.c ', password: 'x', monthlyBudget: '' });
    expect(httpClient.post).toHaveBeenCalledWith('/auth/register', { name: 'N', email: 'a@b.c', password: 'x', monthly_budget: 0 });
    await authApi.register({ name: 'N', email: 'a@b.c', password: 'x', monthlyBudget: '1500' });
    expect(httpClient.post).toHaveBeenLastCalledWith('/auth/register', expect.objectContaining({ monthly_budget: 1500 }));
    await authApi.me();
    expect(httpClient.get).toHaveBeenCalledWith('/auth/me');
    await authApi.updateBudget('2000');
    expect(httpClient.patch).toHaveBeenCalledWith('/auth/budget', { monthly_budget: 2000 });
  });

  it('dashboardApi.summary', async () => {
    httpClient.get.mockResolvedValue({});
    await dashboardApi.summary();
    expect(httpClient.get).toHaveBeenCalledWith('/dashboard/summary');
  });

  it('missionsApi memetakan semua endpoint', async () => {
    httpClient.get.mockResolvedValue({});
    httpClient.post.mockResolvedValue({});
    httpClient.delete.mockResolvedValue({});
    await missionsApi.settings();
    await missionsApi.decks();
    await missionsApi.history();
    await missionsApi.start({ missionType: 'pomodoro', subject: 's', durationMinutes: 25, deckId: null, transactionId: 3 });
    expect(httpClient.post).toHaveBeenLastCalledWith('/missions/sessions', expect.objectContaining({ transaction_id: 3 }));
    await missionsApi.start({ missionType: 'pomodoro', subject: 's', durationMinutes: 25 });
    expect(httpClient.post).toHaveBeenLastCalledWith('/missions/sessions', expect.objectContaining({ transaction_id: null }));
    await missionsApi.complete(1);
    expect(httpClient.post).toHaveBeenLastCalledWith('/missions/sessions/1/complete', {});
    await missionsApi.complete(1, 80);
    expect(httpClient.post).toHaveBeenLastCalledWith('/missions/sessions/1/complete', { score: 80 });
    await missionsApi.generateAi({ title: 't', subject: 's', content: 'c' });
    expect(httpClient.post).toHaveBeenLastCalledWith('/missions/active-recall/generate', expect.objectContaining({ card_count: 3, save_as_deck: true }));
    await missionsApi.createDeck({ a: 1 });
    await missionsApi.deleteDeck(9);
    expect(httpClient.delete).toHaveBeenCalledWith('/missions/active-recall/decks/9');
  });

  it('transactionsApi memetakan semua endpoint', async () => {
    httpClient.get.mockResolvedValue({});
    httpClient.post.mockResolvedValue({});
    httpClient.delete.mockResolvedValue({});
    await transactionsApi.list();
    await transactionsApi.create({ type: 'keinginan', title: ' T ', amount: '10', category: ' C ', note: ' n ', missionType: 'pomodoro' });
    expect(httpClient.post).toHaveBeenLastCalledWith('/transactions', expect.objectContaining({ mission_type: 'pomodoro', title: 'T' }));
    await transactionsApi.create({ type: 'kebutuhan', title: 'T', amount: '10', category: 'C', note: '', missionType: 'pomodoro' });
    expect(httpClient.post).toHaveBeenLastCalledWith('/transactions', expect.objectContaining({ mission_type: null }));
    await transactionsApi.cancel(4);
    await transactionsApi.remove(4);
    expect(httpClient.delete).toHaveBeenCalledWith('/transactions/4');
  });
});

describe('komponen umum', () => {
  it('EmptyState menampilkan judul, pesan opsional, dan slot', () => {
    const withMessage = mount(EmptyState, { props: { title: 'Kosong', message: 'Pesan' }, slots: { default: '<b>aksi</b>', visual: '<i>v</i>' } });
    expect(withMessage.text()).toContain('Kosong');
    expect(withMessage.find('h2').text()).toBe('Kosong');
    expect(withMessage.text()).toContain('Pesan');
    const without = mount(EmptyState, { props: { title: 'Kosong' } });
    expect(without.find('p').exists()).toBe(false);
  });

  it('ToastHost menampilkan dan menutup toast; toast hilang otomatis', async () => {
    vi.useFakeTimers();
    const toast = useToast();
    const wrapper = mount(ToastHost);
    toast.success('Berhasil');
    toast.error('Gagal');
    const id = toast.info('Info');
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll('button.toast')).toHaveLength(3);
    toast.dismiss(id);
    toast.dismiss(id);
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll('button.toast')).toHaveLength(2);
    await wrapper.find('button.toast').trigger('click');
    vi.advanceTimersByTime(10000);
    await wrapper.vm.$nextTick();
    expect(wrapper.findAll('button.toast')).toHaveLength(0);
  });

  it('App merender router-view dan ToastHost', async () => {
    const router = buildRouter();
    router.push('/');
    await router.isReady();
    const wrapper = mount(App, { global: { plugins: [router] } });
    expect(wrapper.text()).toContain('home');
    expect(wrapper.find('section.toast-host').exists()).toBe(true);
  });
});

describe('router', () => {
  it('semua komponen rute dimuat secara lazy', async () => {
    const records = routes.flatMap((route) => [route, ...(route.children ?? [])]);
    const loaders = records.map((route) => route.component).filter((component) => typeof component === 'function');
    expect(loaders.length).toBeGreaterThanOrEqual(6);
    for (const load of loaders) {
      expect(await load()).toBeTruthy();
    }
  });

  it('createAppRouter memasang guard dan judul halaman', async () => {
    const router = createAppRouter();
    expect(routes.length).toBeGreaterThan(0);
    await router.push('/masuk');
    expect(document.title).toContain('Masuk');
    await router.push('/tidak-ada');
    expect(router.currentRoute.value.name).toBe('login');
    document.title = '';
    await router.push({ name: 'register' });
    expect(document.title).toContain('Daftar');
  });

  it('halaman login dapat dibuka langsung lewat path publik /auth/login', async () => {
    useAuthStore().clearSession();
    const router = createAppRouter();
    await router.push('/auth/login');

    expect(router.currentRoute.value.path).toBe('/auth/login');
    expect(router.currentRoute.value.name).toBe('login');
    expect(router.currentRoute.value.meta.guestOnly).toBe(true);
    expect(document.title).toContain('Masuk');
  });

  it('halaman daftar dapat dibuka langsung lewat path publik /auth/register', async () => {
    useAuthStore().clearSession();
    const router = createAppRouter();
    await router.push('/auth/register');

    expect(router.currentRoute.value.path).toBe('/auth/register');
    expect(router.currentRoute.value.name).toBe('register');
    expect(router.currentRoute.value.meta.guestOnly).toBe(true);
    expect(document.title).toContain('Daftar');
  });

  it('rute profil terlindungi dan tersedia sebagai halaman keempat', async () => {
    const shellRoute = routes.find((route) => route.path === '/');
    const profileRoute = shellRoute.children.find((route) => route.name === 'profile');
    expect(profileRoute.path).toBe('profil');
    expect(profileRoute.meta.title).toBe('Profil Saya');

    const auth = useAuthStore();
    auth.clearSession();
    const router = createAppRouter();
    await router.push('/profil');
    expect(router.currentRoute.value.name).toBe('login');
    expect(router.currentRoute.value.query.redirect).toBe('/profil');

    auth.token = 'valid-session';
    await router.push('/profil');
    expect(router.currentRoute.value.name).toBe('profile');
  });

  it('judul bawaan dipakai bila rute tanpa meta.title', async () => {
    const router = createAppRouter();
    router.addRoute({ path: '/tanpa-judul', component: { template: '<p>x</p>' } });
    await router.push('/tanpa-judul');
    expect(document.title).toBe('Disiplin Finansial Mahasiswa');
  });
});

describe('RegisterView', () => {
  const mountRegister = async () => {
    const router = buildRouter();
    router.push('/daftar');
    await router.isReady();
    return { router, wrapper: mount(RegisterView, { global: { plugins: [router] } }) };
  };
  const fill = async (wrapper) => {
    await wrapper.find('#name').setValue('Eliza Sihombing');
    await wrapper.find('#email').setValue('eliza@del.ac.id');
    await wrapper.find('#password').setValue('rahasia123');
    await wrapper.find('#confirm').setValue('rahasia123');
    await wrapper.find('#budget').setValue('1500000');
  };

  it('menampilkan error validasi', async () => {
    const { wrapper } = await mountRegister();
    await wrapper.find('form').trigger('submit');
    expect(wrapper.findAll('.field-error').length).toBeGreaterThan(0);
    expect(httpClient.post).not.toHaveBeenCalled();
  });

  it('menampilkan status memproses selama permintaan berjalan', async () => {
    httpClient.post.mockImplementation(() => new Promise(() => {}));
    const { wrapper } = await mountRegister();
    await fill(wrapper);
    await wrapper.find('form').trigger('submit');
    await wrapper.vm.$nextTick();
    expect(wrapper.find('button[type="submit"]').text()).toBe('Memproses…');
  });

  it('menampilkan error ulangi password yang tidak sama', async () => {
    const { wrapper } = await mountRegister();
    await fill(wrapper);
    await wrapper.find('#confirm').setValue('beda-sekali');
    await wrapper.find('form').trigger('submit');
    expect(wrapper.find('#confirm').attributes('aria-invalid')).toBe('true');
    expect(wrapper.findAll('.field-error').length).toBeGreaterThan(0);
  });

  it('pendaftaran berhasil mengarah ke beranda', async () => {
    httpClient.post.mockResolvedValue({ token: 't', user: { id: 1 } });
    const { wrapper, router } = await mountRegister();
    await fill(wrapper);
    await wrapper.find('form').trigger('submit');
    await flushPromises();
    expect(router.currentRoute.value.path).toBe('/');
  });

  it('menampilkan pesan dan error field dari server', async () => {
    httpClient.post.mockRejectedValue(new ApiError('Data tidak valid', 422, { email: 'Email sudah dipakai', monthly_budget: 'Anggaran tidak valid' }));
    const { wrapper } = await mountRegister();
    await fill(wrapper);
    await wrapper.find('form').trigger('submit');
    await flushPromises();
    expect(wrapper.find('[role="alert"]').text()).toBe('Data tidak valid');
    expect(wrapper.text()).toContain('Email sudah dipakai');
    expect(wrapper.text()).toContain('Anggaran tidak valid');
  });
});

describe('AppShell', () => {
  const mountShell = async () => {
    const router = buildRouter();
    router.push('/');
    await router.isReady();
    httpClient.get.mockResolvedValue({ user: { id: 1, name: 'Eliza', email: 'e@del.ac.id' } });
    const wrapper = mount(AppShell, { global: { plugins: [router], stubs } });
    await flushPromises();
    return { router, wrapper };
  };

  it('menampilkan menu, identitas pengguna, dan dialog keluar', async () => {
    localStorage.setItem('dfm.token', 'tok');
    const { wrapper, router } = await mountShell();
    expect(wrapper.find('.user-name').text()).toBeTruthy();
    expect(wrapper.find('.profile-link').attributes('href')).toBe('/profil');
    expect(wrapper.find('.profile-link').attributes('aria-label')).toBeUndefined();
    expect(wrapper.find('.user-mail').classes()).toContain('text-slate-600');
    expect(wrapper.findAll('.tabbar .tab-link')).toHaveLength(4);
    const logout = wrapper.findAll('button').filter((b) => b.text().includes('Keluar') || b.attributes('aria-label') === 'Keluar');
    await logout[0].trigger('click');
    expect(wrapper.text()).toContain('Konfirmasi Keluar');
    const confirm = wrapper.findAll('button').find((b) => b.text().includes('Ya, Keluar'));
    await confirm.trigger('click');
    await flushPromises();
    expect(router.currentRoute.value.path).toBe('/masuk');
  });

  it('dialog keluar dapat dibatalkan dan memakai nilai bawaan bila belum ada pengguna', async () => {
    httpClient.get.mockRejectedValue(new ApiError('x', 500));
    const router = buildRouter();
    router.push('/');
    await router.isReady();
    const wrapper = mount(AppShell, { global: { plugins: [router], stubs } });
    await flushPromises();
    expect(wrapper.find('.user-name').text()).toBe('Mahasiswa');
    await wrapper.findAll('button').find((b) => b.text().includes('Keluar')).trigger('click');
    await wrapper.findAll('button').find((b) => b.text().includes('Batal')).trigger('click');
    expect(wrapper.text()).not.toContain('Konfirmasi Keluar');
  });
});

describe('grafik dashboard', () => {
  it('useChart membuat ulang grafik saat konfigurasi berubah dan menghancurkannya saat dilepas', async () => {
    const holder = { value: null };
    const buildConfig = vi.fn(() => ({ type: 'bar' }));
    const Comp = { setup() { useChart(holder, buildConfig); return () => null; } };
    const wrapper = mount(Comp);
    expect(chartInstances).toHaveLength(0);
    wrapper.unmount();
  });

  it('useChart tanpa canvas tidak membuat grafik', () => {
    const Comp = { setup() { useChart({ value: null }, () => ({})); return () => null; } };
    mount(Comp).unmount();
    expect(chartInstances).toHaveLength(0);
  });

  it('AllocationChart menampilkan grafik atau pesan kosong', async () => {
    const filled = mount(AllocationChart, { props: { allocation: { labels: ['a', 'b', 'c', 'd'], data: [1, 2, 3, 4] } } });
    expect(chartInstances).toHaveLength(1);
    const tooltip = chartInstances[0].config.options.plugins.tooltip.callbacks.label({ label: 'a', parsed: 1000 });
    expect(tooltip).toContain('a');
    await filled.setProps({ allocation: { labels: ['a', 'b', 'c', 'd'], data: [4, 3, 2, 1] } });
    expect(chartInstances.length).toBeGreaterThan(1);
    filled.unmount();
    const empty = mount(AllocationChart, { props: { allocation: { labels: [], data: [0, 0] } } });
    expect(empty.text()).toContain('Belum ada');
  });

  it('CategoryChart menampilkan grafik atau pesan kosong', () => {
    const filled = mount(CategoryChart, { props: { categories: { labels: ['Hiburan'], data: [5000] } } });
    const { options } = chartInstances[0].config;
    expect(options.plugins.tooltip.callbacks.label({ parsed: { x: 5000 } })).toBeTruthy();
    expect(options.scales.x.ticks.callback(5000)).toBeTruthy();
    filled.unmount();
    const empty = mount(CategoryChart, { props: { categories: { labels: [], data: [0] } } });
    expect(empty.text()).toContain('Belum ada');
  });

  it('WeeklyTrendChart membangun dataset dan callback', () => {
    mount(WeeklyTrendChart, { props: { trends: { dates: ['2026-10-01'], expenses: [1000], lockedWants: [500], cancelledWants: [200] } } });
    const { config } = chartInstances[0];
    expect(config.data.datasets.length).toBeGreaterThan(1);
    const { options } = config;
    Object.values(options.scales).forEach((scale) => scale.ticks?.callback?.(1000));
    const tooltip = options.plugins.tooltip.callbacks.label;
    expect(tooltip({ dataset: { label: 'Fokus', yAxisID: 'y1' }, parsed: { y: 30 } })).toContain('menit');
    expect(tooltip({ dataset: { label: 'Pengeluaran', yAxisID: 'y' }, parsed: { y: 1000 } })).toContain('Pengeluaran');
  });
});

describe('BudgetModal', () => {
  it('menolak nilai tidak valid, menyimpan nilai valid, dan menampilkan error server', async () => {
    const wrapper = mount(BudgetModal, { props: { current: 100 }, global: { stubs } });
    await wrapper.find('#budget-input').setValue('');
    await wrapper.find('form').trigger('submit');
    expect(wrapper.text()).toContain('Masukkan angka 0 atau lebih');

    httpClient.patch.mockRejectedValueOnce(new ApiError('Gagal simpan', 500));
    await wrapper.find('#budget-input').setValue('5000');
    await wrapper.find('form').trigger('submit');
    await flushPromises();
    expect(wrapper.text()).toContain('Gagal simpan');

    httpClient.patch.mockResolvedValueOnce({ user: { monthly_budget: 5000 } });
    await wrapper.find('form').trigger('submit');
    await flushPromises();
    expect(wrapper.emitted('saved')).toBeTruthy();
    expect(wrapper.emitted('close')).toBeTruthy();

    await wrapper.findAll('button').find((b) => b.text() === 'Batal').trigger('click');
    expect(wrapper.emitted('close').length).toBeGreaterThan(1);
    const before = wrapper.emitted('close').length;
    wrapper.findComponent(BaseModal).vm.$emit('close');
    expect(wrapper.emitted('close').length).toBe(before + 1);
  });

  it('memakai nilai bawaan 0', () => {
    const wrapper = mount(BudgetModal, { global: { stubs } });
    expect(wrapper.find('#budget-input').element.value).toBe('0');
  });
});

describe('DashboardView', () => {
  const mountDashboard = async () => {
    const router = buildRouter();
    router.push('/');
    await router.isReady();
    const wrapper = mount(DashboardView, { global: { plugins: [router], stubs } });
    await flushPromises();
    return wrapper;
  };

  it('menampilkan ringkasan lengkap dan membuka modal anggaran', async () => {
    localStorage.setItem('dfm.token', 'tok');
    setActivePinia(createPinia());
    httpClient.get.mockImplementation(async (path) => (path === '/dashboard/summary'
      ? { data: summary() }
      : { user: { id: 1, name: 'Eliza Sihombing', monthly_budget: 500000 } }));
    const wrapper = await mountDashboard();
    expect(wrapper.text()).toContain('Eliza');
    const trigger = wrapper.findAll('button').find((b) => b.text() === 'Atur');
    await trigger.trigger('click');
    expect(wrapper.findComponent(BudgetModal).exists()).toBe(true);
    wrapper.findComponent(BudgetModal).vm.$emit('close');
    await wrapper.vm.$nextTick();
    expect(wrapper.findComponent(BudgetModal).exists()).toBe(false);
  });

  it('menangani anggaran terlampaui, saldo negatif, tanpa data terbaru, dan tanpa anggaran', async () => {
    const over = summary();
    over.financial = { ...over.financial, activeBalance: -10, monthlySpending: 900000, counts: { wantsLocked: 0 } };
    over.recent = { transactions: [], missions: [] };
    httpClient.get.mockImplementation(async (path) => (path === '/dashboard/summary' ? { data: over } : { user: { id: 1, name: '' } }));
    let wrapper = await mountDashboard();
    expect(wrapper.text()).toContain('Melebihi anggaran');
    expect(wrapper.text()).toContain('Mahasiswa');

    const none = summary();
    none.financial = { ...none.financial, monthlyBudget: 0 };
    httpClient.get.mockImplementation(async (path) => (path === '/dashboard/summary' ? { data: none } : { user: { id: 1, name: 'Eliza' } }));
    wrapper = await mountDashboard();
    const setBudget = wrapper.findAll('button').find((b) => /Atur/.test(b.text()));
    await setBudget.trigger('click');
    expect(wrapper.findComponent(BudgetModal).exists()).toBe(true);
  });

  it('memakai nilai bawaan 0 bila skor disiplin dan anggaran tidak ada', async () => {
    const minimal = summary();
    delete minimal.financial.disciplineScore;
    delete minimal.financial.monthlyBudget;
    httpClient.get.mockImplementation(async (path) => (path === '/dashboard/summary' ? { data: minimal } : { user: { id: 1, name: 'Eliza' } }));
    const wrapper = await mountDashboard();
    expect(wrapper.findComponent(DashboardMetrics).vm.ringStyle['--score']).toBe('0%');
    await wrapper.findAll('button').find((b) => b.text().includes('Tentukan Anggaran')).trigger('click');
    expect(wrapper.findComponent(BudgetModal).props('current')).toBe(0);
    wrapper.vm.dashboard.data = null;
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.state').exists()).toBe(true);
  });

  it('menampilkan error dan dapat mencoba lagi', async () => {
    httpClient.get.mockRejectedValue(new ApiError('Server mati', 500));
    const wrapper = await mountDashboard();
    expect(wrapper.find('[role="alert"]').text()).toContain('Server mati');
    httpClient.get.mockImplementation(async (path) => (path === '/dashboard/summary' ? { data: summary() } : { user: { id: 1, name: 'Eliza' } }));
    await wrapper.findAll('button').find((b) => b.text().includes('Coba lagi')).trigger('click');
    await flushPromises();
    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
  });

  it('menampilkan keadaan memuat sebelum data tiba', async () => {
    httpClient.get.mockImplementation(() => new Promise(() => {}));
    const router = buildRouter();
    router.push('/');
    await router.isReady();
    const wrapper = mount(DashboardView, { global: { plugins: [router], stubs } });
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.state').exists()).toBe(true);
  });
});

describe('MissionHistory & UnlockCelebration', () => {
  it('MissionHistory menampilkan kosong dan daftar', () => {
    expect(mount(MissionHistory, { props: { missions: [] } }).text()).toContain('Belum ada misi');
    const wrapper = mount(MissionHistory, {
      props: {
        missions: [
          { id: 1, subject: 'Vue', mission_type: 'pomodoro', duration_minutes: 25, score: 100, completed_at: '2026-10-01T00:00:00Z', status: 'selesai', transaction_title: 'Boba' },
          { id: 2, subject: 'Pinia', mission_type: 'active_recall', duration_minutes: 5, score: 40, completed_at: '2026-10-02T00:00:00Z', status: 'gagal', transaction_title: null }
        ]
      }
    });
    expect(wrapper.text()).toContain('Untuk: Boba');
    expect(wrapper.findAll('li')).toHaveLength(2);
  });

  it('UnlockCelebration membuka gembok lalu menavigasi ke transaksi', async () => {
    vi.useFakeTimers();
    const router = buildRouter();
    router.push('/');
    await router.isReady();
    const wrapper = mount(UnlockCelebration, { props: { transaction: lockedWish }, global: { plugins: [router], stubs } });
    vi.advanceTimersByTime(300);
    await wrapper.vm.$nextTick();
    await wrapper.findAll('button').find((b) => b.text() === 'Lihat transaksi').trigger('click');
    expect(wrapper.emitted('close')).toBeTruthy();
    await flushPromises();
    expect(router.currentRoute.value.path).toBe('/transaksi');
    await wrapper.findAll('button').find((b) => b.text() === 'Tutup').trigger('click');
    expect(wrapper.emitted('close').length).toBe(2);
    wrapper.findComponent(BaseModal).vm.$emit('close');
    expect(wrapper.emitted('close').length).toBe(3);
  });
});

describe('TransactionFormModal', () => {
  const mountForm = () => mount(TransactionFormModal, { global: { stubs } });

  it('validasi, simpan kebutuhan, dan simpan keinginan terkunci', async () => {
    const wrapper = mountForm();
    await wrapper.find('form').trigger('submit');
    expect(wrapper.findAll('.field-error').length).toBeGreaterThan(0);

    httpClient.post.mockResolvedValueOnce({ transaction: { id: 9 }, isLocked: false, message: 'Tercatat' });
    await wrapper.find('#tx-title').setValue('Makan siang');
    await wrapper.find('#tx-amount').setValue('15000');
    await wrapper.find('#tx-category').setValue('Transportasi');
    await wrapper.find('#tx-note').setValue('Catatan');
    await wrapper.find('form').trigger('submit');
    await flushPromises();
    expect(wrapper.emitted('close')).toBeTruthy();

    const want = mountForm();
    await want.find('input[name="type"][value="keinginan"]').setValue(true);
    expect(want.find('.lock-note').exists()).toBe(true);
    await want.find('input[name="mission"][value="active_recall"]').setValue(true);
    httpClient.post.mockResolvedValueOnce({ transaction: { id: 10 }, isLocked: true, message: 'Terkunci' });
    await want.find('#tx-title').setValue('Boba');
    await want.find('#tx-amount').setValue('25000');
    await want.find('form').trigger('submit');
    await flushPromises();
    expect(want.emitted('close')).toBeTruthy();
  });

  it('menampilkan error server dan tombol batal', async () => {
    const wrapper = mountForm();
    httpClient.post.mockRejectedValueOnce(new ApiError('Gagal', 422, { title: 'Judul bermasalah', category: 'Kategori bermasalah' }));
    await wrapper.find('#tx-title').setValue('Boba');
    await wrapper.find('#tx-amount').setValue('25000');
    await wrapper.find('form').trigger('submit');
    await flushPromises();
    expect(wrapper.text()).toContain('Judul bermasalah');
    expect(wrapper.text()).toContain('Kategori bermasalah');
    await wrapper.findAll('button').find((b) => b.text() === 'Batal').trigger('click');
    expect(wrapper.emitted('close')).toBeTruthy();
    wrapper.findComponent(BaseModal).vm.$emit('close');
    expect(wrapper.emitted('close').length).toBe(2);
  });
});

describe('TransactionsView', () => {
  const mountView = async (items) => {
    httpClient.get.mockResolvedValue({ transactions: items });
    const router = buildRouter();
    router.push('/transaksi');
    await router.isReady();
    const wrapper = mount(TransactionsView, { global: { plugins: [router], stubs } });
    await flushPromises();
    return wrapper;
  };

  it('keadaan kosong membuka formulir', async () => {
    const wrapper = await mountView([]);
    expect(wrapper.text()).toContain('Belum ada transaksi');
    await wrapper.findAll('button').find((b) => b.text() === 'Catat transaksi').trigger('click');
    expect(wrapper.findComponent(TransactionFormModal).exists()).toBe(true);
    wrapper.findComponent(TransactionFormModal).vm.$emit('close');
    await wrapper.vm.$nextTick();
    await wrapper.findComponent(EmptyState).find('button').trigger('click');
    expect(wrapper.findComponent(TransactionFormModal).exists()).toBe(true);
    wrapper.findComponent(TransactionFormModal).vm.$emit('close');
    await wrapper.vm.$nextTick();
    expect(wrapper.findComponent(TransactionFormModal).exists()).toBe(false);
  });

  it('menyaring, membatalkan, dan menghapus transaksi', async () => {
    const income = { id: 3, type: 'pemasukan', status: 'aktif', title: 'Uang saku', amount: 100000, category: 'Lainnya', created_at: '2026-10-01T00:00:00Z' };
    const wrapper = await mountView([lockedWish, income]);
    expect(wrapper.findAllComponents({ name: 'TransactionRow' })).toHaveLength(2);

    await wrapper.findAll('button').find((b) => b.text() === 'Pemasukan').trigger('click');
    expect(wrapper.findAllComponents({ name: 'TransactionRow' })).toHaveLength(1);
    await wrapper.find('select').setValue('terkunci');
    expect(wrapper.text()).toContain('Tidak ada transaksi yang cocok');
    await wrapper.findAll('button').find((b) => b.text() === 'Semua').trigger('click');
    await wrapper.find('select').setValue('');

    const row = wrapper.findAllComponents({ name: 'TransactionRow' }).find((r) => r.props('transaction').id === 1);
    httpClient.post.mockResolvedValueOnce({ transaction: { ...lockedWish, status: 'dibatalkan' }, message: 'Dibatalkan' });
    row.vm.$emit('cancel', lockedWish);
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('Batalkan Keinginan?');
    await wrapper.findAll('button').find((b) => b.text().includes('Ya')).trigger('click');
    await flushPromises();

    httpClient.post.mockRejectedValueOnce(new ApiError('Tidak bisa', 400));
    row.vm.$emit('cancel', lockedWish);
    await wrapper.vm.$nextTick();
    await wrapper.findAll('button').find((b) => b.text().includes('Ya')).trigger('click');
    await flushPromises();

    row.vm.$emit('cancel', lockedWish);
    await wrapper.vm.$nextTick();
    await wrapper.findAll('button').find((b) => b.text().includes('Batal')).trigger('click');
    await wrapper.vm.$nextTick();

    httpClient.delete.mockResolvedValueOnce({});
    row.vm.$emit('remove', income);
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('Hapus transaksi?');
    await wrapper.findAll('button').find((b) => /Hapus|Ya/.test(b.text()) && b.text() !== 'Hapus transaksi?').trigger('click');
    await flushPromises();

    httpClient.delete.mockRejectedValueOnce(new ApiError('Gagal hapus', 500));
    row.vm.$emit('remove', lockedWish);
    await wrapper.vm.$nextTick();
    await wrapper.findAll('button').find((b) => /Hapus|Ya/.test(b.text()) && b.text() !== 'Hapus transaksi?').trigger('click');
    await flushPromises();
  });

  it('menutup dialog hapus dan batal lewat event close', async () => {
    const wrapper = await mountView([lockedWish]);
    const row = wrapper.findComponent({ name: 'TransactionRow' });
    row.vm.$emit('remove', lockedWish);
    await wrapper.vm.$nextTick();
    wrapper.findComponent({ name: 'ConfirmModal' }).vm.$emit('close');
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).not.toContain('Hapus transaksi?');
    row.vm.$emit('cancel', lockedWish);
    await wrapper.vm.$nextTick();
    wrapper.findComponent({ name: 'ConfirmModal' }).vm.$emit('close');
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).not.toContain('Batalkan Keinginan?');
  });

  it('confirmCancel dan confirmDelete tanpa target tidak memanggil API', async () => {
    const wrapper = await mountView([lockedWish]);
    await wrapper.vm.confirmCancel();
    await wrapper.vm.confirmDelete();
    expect(httpClient.post).not.toHaveBeenCalled();
    expect(httpClient.delete).not.toHaveBeenCalled();
  });

  it('menampilkan error muat dan dapat mencoba lagi', async () => {
    httpClient.get.mockRejectedValue(new ApiError('Gagal muat', 500));
    const router = buildRouter();
    router.push('/transaksi');
    await router.isReady();
    const wrapper = mount(TransactionsView, { global: { plugins: [router], stubs } });
    await flushPromises();
    expect(wrapper.find('.load-error').text()).toContain('Gagal muat');
    httpClient.get.mockResolvedValue({ transactions: [] });
    await wrapper.findAll('button').find((b) => b.text().includes('Coba lagi')).trigger('click');
    await flushPromises();
    expect(wrapper.find('.load-error').exists()).toBe(false);
  });

  it('menampilkan keadaan memuat', async () => {
    httpClient.get.mockImplementation(() => new Promise(() => {}));
    const router = buildRouter();
    router.push('/transaksi');
    await router.isReady();
    const wrapper = mount(TransactionsView, { global: { plugins: [router], stubs } });
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.loading').exists()).toBe(true);
  });
});

describe('StudyMissionsView', () => {
  const settings = { timeScale: 1, passingScore: 70, minPomodoroMinutesToUnlock: 25, secondsPerCard: 15 };
  const mountView = async (query = {}) => {
    httpClient.get.mockImplementation(async (path) => {
      if (path === '/missions/settings') return { settings };
      if (path === '/missions/active-recall/decks') return { decks: [] };
      if (path === '/missions/history') return { missions: [] };
      return { transactions: [lockedWish, recallWish] };
    });
    const router = buildRouter();
    router.push({ path: '/misi', query });
    await router.isReady();
    const wrapper = mount(StudyMissionsView, { global: { plugins: [router], stubs } });
    await flushPromises();
    return wrapper;
  };

  it('memilih jenis misi dan keinginan', async () => {
    const wrapper = await mountView();
    expect(wrapper.findComponent({ name: 'AppIcon' }).exists()).toBe(true);
    await wrapper.find('#wish').setValue('1');
    await wrapper.findAll('button').find((b) => b.text().includes('Active Recall')).trigger('click');
    expect(wrapper.find('#wish').element.value).toBe('');
    await wrapper.findAll('button').find((b) => b.text().includes('Pomodoro')).trigger('click');
  });

  it('menerapkan keinginan dari query rute', async () => {
    const wrapper = await mountView({ wish: '2' });
    expect(wrapper.find('#wish').element.value).toBe('2');
    const ignored = await mountView({ wish: '999' });
    expect(ignored.find('#wish').element.value).toBe('');
  });

  it('menangani hasil penyelesaian misi', async () => {
    const wrapper = await mountView();
    const missions = useMissionsStore();
    const transactions = useTransactionsStore();
    expect(missions.ready).toBe(true);
    const panel = wrapper.findComponent({ name: 'PomodoroPanel' });
    panel.vm.$emit('completed', { unlockedTransaction: { ...lockedWish, status: 'terbuka' } });
    await flushPromises();
    expect(wrapper.findComponent(UnlockCelebration).exists()).toBe(true);
    expect(transactions.items.find((i) => i.id === 1).status).toBe('terbuka');
    wrapper.findComponent(UnlockCelebration).vm.$emit('close');
    await wrapper.vm.$nextTick();
    wrapper.findComponent({ name: 'PomodoroPanel' }).vm.$emit('completed', { passed: true, message: 'Lulus' });
    wrapper.findComponent({ name: 'PomodoroPanel' }).vm.$emit('completed', { passed: false, message: 'Belum lulus' });
    await flushPromises();
  });

  it('menampilkan error muat dan keadaan memuat', async () => {
    httpClient.get.mockRejectedValue(new ApiError('Gagal muat', 500));
    const router = buildRouter();
    router.push('/misi');
    await router.isReady();
    const wrapper = mount(StudyMissionsView, { global: { plugins: [router], stubs } });
    await flushPromises();
    expect(wrapper.find('.load-error').text()).toContain('Gagal muat');
    httpClient.get.mockImplementation(() => new Promise(() => {}));
    await wrapper.findAll('button').find((b) => b.text().includes('Coba lagi')).trigger('click');
    await flushPromises();
    expect(wrapper.find('.loading').exists()).toBe(true);
  });
});

describe('ProfileView', () => {
  it('menampilkan identitas akun dan menjelaskan fitur yang belum didukung backend', () => {
    const auth = useAuthStore();
    auth.user = { name: 'Eliza Rajagukguk', email: 'eliza@example.com' };
    const wrapper = mount(ProfileView);

    expect(wrapper.text()).toContain('Eliza Rajagukguk');
    expect(wrapper.text()).toContain('eliza@example.com');
    expect(wrapper.find('#profile-name').element.value).toBe('Eliza Rajagukguk');
    expect(wrapper.find('#profile-name').attributes('readonly')).toBeDefined();
    expect(wrapper.find('#profile-email').attributes('readonly')).toBeDefined();
    expect(wrapper.find('.save-button').element.disabled).toBe(true);
    expect(wrapper.find('.photo-action').element.disabled).toBe(true);
    expect(wrapper.find('#current-password').element.disabled).toBe(true);
    expect(wrapper.find('.password-button').element.disabled).toBe(true);
    expect(wrapper.text()).toContain('backend belum menyediakan endpoint');
  });

  it('menampilkan nilai bawaan saat informasi pengguna belum tersedia', () => {
    useAuthStore().user = null;
    const wrapper = mount(ProfileView);

    expect(wrapper.find('h2.text-xl').text()).toBe('Mahasiswa');
    expect(wrapper.find('.avatar').text()).toBe('M');
    expect(wrapper.find('.min-w-0 > p').text()).toBe('Email belum tersedia');
    expect(wrapper.find('#profile-name').element.value).toBe('');
    expect(wrapper.find('#profile-email').element.value).toBe('');
  });
});

describe('auth store dipakai bersama', () => {
  it('useAuthStore tersedia', () => {
    expect(useAuthStore()).toBeTruthy();
  });
});
