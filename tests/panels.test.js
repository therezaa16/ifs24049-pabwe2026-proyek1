import { flushPromises, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/core/http/api-error.js';
import BaseModal from '@/shared/components/BaseModal.vue';
import ConfirmModal from '@/shared/components/ConfirmModal.vue';
import ActiveRecallPanel from '@/features/study-missions/presentation/ActiveRecallPanel.vue';
import AiMaterialModal from '@/features/study-missions/presentation/AiMaterialModal.vue';
import PomodoroPanel from '@/features/study-missions/presentation/PomodoroPanel.vue';
import StudyMaterialModal from '@/features/study-missions/presentation/StudyMaterialModal.vue';
import { useMissionsStore } from '@/features/study-missions/application/missions.store.js';
import { missionsApi } from '@/features/study-missions/infrastructure/missions.api.js';

vi.mock('@/features/study-missions/infrastructure/missions.api.js', () => ({
  missionsApi: {
    settings: vi.fn(), decks: vi.fn(), history: vi.fn(), start: vi.fn(), complete: vi.fn(),
    generateAi: vi.fn(), createDeck: vi.fn(), deleteDeck: vi.fn()
  }
}));

const settings = { timeScale: 1, passingScore: 70, minPomodoroMinutesToUnlock: 25, secondsPerCard: 15 };
const deckA = {
  id: 1, title: 'Deck A', subject: 'X', description: 'Uji', content: 'Isi materi lengkap', user_id: 5,
  cards: [{ id: 1, question: 'Q1?', answer: 'A1', explanation: 'E1' }]
};
const deckB = { id: 2, title: 'Deck B', subject: 'Y', description: '', content: '', user_id: null };

const button = (wrapper, text) => wrapper.findAll('button').find((b) => b.text().includes(text));

beforeEach(() => {
  setActivePinia(createPinia());
  vi.clearAllMocks();
  useMissionsStore().settings = { ...settings };
  missionsApi.history.mockResolvedValue({ missions: [] });
});
afterEach(() => vi.useRealTimers());

describe('BaseModal', () => {
  it('menutup lewat Escape, backdrop, dan tombol tutup; mengabaikan tombol lain', async () => {
    const opener = document.createElement('button');
    document.body.appendChild(opener);
    opener.focus();
    const wrapper = mount(BaseModal, { props: { title: 'Judul', wide: true }, slots: { default: '<p>isi</p>' }, attachTo: document.body });
    await flushPromises();
    expect(wrapper.find('.dialog-wide').exists()).toBe(true);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(wrapper.emitted('close')).toBeUndefined();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(wrapper.emitted('close')).toHaveLength(1);

    await wrapper.find('.dialog').trigger('mousedown');
    expect(wrapper.emitted('close')).toHaveLength(1);
    await wrapper.find('.backdrop').trigger('mousedown');
    expect(wrapper.emitted('close')).toHaveLength(2);
    await wrapper.find('button[aria-label="Tutup"]').trigger('click');
    expect(wrapper.emitted('close')).toHaveLength(3);

    wrapper.unmount();
    expect(document.activeElement).toBe(opener);
    opener.remove();
  });

  it('aman bila dilepas sebelum fokus awal dipasang', () => {
    mount(BaseModal, { props: { title: 'Cepat' } }).unmount();
  });
});

describe('ConfirmModal', () => {
  it('memakai nilai bawaan dan meneruskan konfirmasi serta penutupan', async () => {
    const wrapper = mount(ConfirmModal, { props: { message: 'Yakin?' } });
    expect(wrapper.text()).toContain('Konfirmasi');
    expect(wrapper.text()).toContain('Lanjutkan');
    await button(wrapper, 'Lanjutkan').trigger('click');
    expect(wrapper.emitted('confirm')).toHaveLength(1);
    await button(wrapper, 'Batal').trigger('click');
    expect(wrapper.emitted('close')).toHaveLength(1);
    wrapper.findComponent(BaseModal).vm.$emit('close');
    expect(wrapper.emitted('close')).toHaveLength(2);
  });

  it('mendukung semua tone dan keadaan sibuk', () => {
    expect(mount(ConfirmModal, { props: { message: 'm', tone: 'warning' } }).html()).toContain('from-amber-400');
    expect(mount(ConfirmModal, { props: { message: 'm', tone: 'primary' } }).html()).toContain('from-indigo-500');
    const busy = mount(ConfirmModal, { props: { message: 'm', busy: true } });
    expect(busy.find('.animate-spin').exists()).toBe(true);
    expect(button(busy, 'Lanjutkan').attributes('disabled')).toBeDefined();
  });
});

describe('StudyMaterialModal', () => {
  it('menampilkan catatan lengkap dan memulai sesi', async () => {
    const wrapper = mount(StudyMaterialModal, { props: { deck: { ...deckA, cards: [...deckA.cards, { question: 'Q2?', answer: 'A2' }] } } });
    expect(wrapper.text()).toContain('Isi materi lengkap');
    expect(wrapper.text()).toContain('Q2: Q2?');
    await button(wrapper, 'Mulai Uji Ingatan').trigger('click');
    expect(wrapper.emitted('start')[0][0].id).toBe(1);
    expect(wrapper.emitted('close')).toHaveLength(1);
    await button(wrapper, 'Tutup').trigger('click');
    expect(wrapper.emitted('close')).toHaveLength(2);
    wrapper.findComponent(BaseModal).vm.$emit('close');
    expect(wrapper.emitted('close')).toHaveLength(3);
  });

  it('memakai deskripsi atau teks bawaan bila catatan kosong', () => {
    const withDescription = mount(StudyMaterialModal, { props: { deck: { ...deckA, content: '' } } });
    expect(withDescription.text()).toContain('Uji');
    const fallback = mount(StudyMaterialModal, { props: { deck: { ...deckA, content: '', description: '' } } });
    expect(fallback.text()).toContain('Materi pembelajaran terstruktur');
  });
});

describe('AiMaterialModal', () => {
  const mountModal = () => mount(AiMaterialModal);
  const fillValid = async (wrapper) => {
    await wrapper.find('#ai-title').setValue('Judul');
    await wrapper.find('#ai-subject').setValue('Mata kuliah');
    await wrapper.find('#ai-content').setValue('Isi catatan yang cukup panjang untuk dianalisis.');
  };
  const generate = (wrapper) => button(wrapper, 'Buat Kuis dengan AI');

  it('contoh cepat mengisi formulir', async () => {
    const wrapper = mountModal();
    await wrapper.findAll('.group')[0].trigger('click');
    expect(wrapper.find('#ai-title').element.value).toContain('Normalisasi');
    expect(wrapper.find('#ai-subject').element.value).toBe('Sistem Basis Data');
    expect(wrapper.text()).toContain('karakter');
  });

  it('memvalidasi judul, mata kuliah, dan panjang materi', async () => {
    const wrapper = mountModal();
    expect(generate(wrapper).attributes('disabled')).toBeDefined();
    await wrapper.vm.handleGenerate();
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('Judul materi wajib diisi');

    await wrapper.find('#ai-title').setValue('Judul');
    await wrapper.find('#ai-content').setValue('Isi catatan yang cukup panjang untuk dianalisis.');
    await generate(wrapper).trigger('click');
    expect(wrapper.text()).toContain('Mata kuliah / topik wajib diisi');

    await wrapper.find('#ai-subject').setValue('MK');
    await wrapper.find('#ai-content').setValue('pendek');
    await generate(wrapper).trigger('click');
    expect(wrapper.text()).toContain('minimal 20 karakter');
    expect(missionsApi.generateAi).not.toHaveBeenCalled();
  });

  it('berhasil dengan pesan server dan jumlah kartu terpilih', async () => {
    missionsApi.generateAi.mockResolvedValue({ deck: { id: 9 }, message: 'Dibuat' });
    const wrapper = mountModal();
    await fillValid(wrapper);
    await wrapper.find('#card-count').setValue(5);
    await generate(wrapper).trigger('click');
    await flushPromises();
    expect(missionsApi.generateAi).toHaveBeenCalledWith(expect.objectContaining({ cardCount: 5, saveAsDeck: true }));
    expect(wrapper.emitted('created')[0][0]).toEqual({ id: 9 });
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('berhasil tanpa pesan server dan menampilkan status sibuk', async () => {
    let resolve;
    missionsApi.generateAi.mockImplementation(() => new Promise((r) => { resolve = r; }));
    const wrapper = mountModal();
    await fillValid(wrapper);
    await generate(wrapper).trigger('click');
    expect(wrapper.text()).toContain('Menganalisis dengan AI');
    expect(wrapper.find('.animate-spin').exists()).toBe(true);
    resolve({ deck: null });
    await flushPromises();
    expect(wrapper.emitted('created')[0][0]).toBeNull();
  });

  it('menampilkan error server atau pesan bawaan', async () => {
    missionsApi.generateAi.mockRejectedValueOnce(new ApiError('Kuota habis', 429));
    const wrapper = mountModal();
    await fillValid(wrapper);
    await generate(wrapper).trigger('click');
    await flushPromises();
    expect(wrapper.find('[role="alert"]').text()).toContain('Kuota habis');

    missionsApi.generateAi.mockRejectedValueOnce(new Error(''));
    await generate(wrapper).trigger('click');
    await flushPromises();
    expect(wrapper.find('[role="alert"]').text()).toContain('Gagal menghasilkan kuis dengan AI');
  });

  it('tombol batal dan close modal menutup dialog', async () => {
    const wrapper = mountModal();
    await button(wrapper, 'Batal').trigger('click');
    wrapper.findComponent(BaseModal).vm.$emit('close');
    expect(wrapper.emitted('close')).toHaveLength(2);
  });
});

describe('PomodoroPanel (cabang tambahan)', () => {
  it('menampilkan mode demo, memilih durasi, dan menangani kegagalan memulai', async () => {
    useMissionsStore().settings = { ...settings, timeScale: 0.04 };
    missionsApi.start.mockRejectedValue(new ApiError('Server sibuk', 500));
    const wrapper = mount(PomodoroPanel, { props: { wish: null, subjectSuggestion: 'Vue' } });
    expect(wrapper.text()).toContain('Mode demo');
    await wrapper.findAll('.preset').find((b) => b.text().includes('45')).trigger('click');
    expect(wrapper.vm.durationMinutes).toBe(45);
    expect(wrapper.vm.progress).toBe(0);
    await button(wrapper, 'Mulai fokus').trigger('click');
    await flushPromises();
    expect(wrapper.find('#subject').exists()).toBe(true);
    expect(missionsApi.start).toHaveBeenCalledWith(expect.objectContaining({ transactionId: undefined, durationMinutes: 45 }));
  });

  it('error non-ApiError atau tanpa sisa waktu tidak memulai ulang timer', async () => {
    vi.useFakeTimers();
    missionsApi.start.mockResolvedValue({ session: { id: 1, subject: 'X', required_seconds: 1 } });
    const wrapper = mount(PomodoroPanel, { props: { subjectSuggestion: 'Vue' } });
    await button(wrapper, 'Mulai fokus').trigger('click');
    await flushPromises();
    vi.advanceTimersByTime(1500);
    await flushPromises();

    missionsApi.complete.mockRejectedValueOnce(new Error('putus'));
    await button(wrapper, 'Selesaikan misi').trigger('click');
    await flushPromises();
    missionsApi.complete.mockRejectedValueOnce(new ApiError('ditolak', 400));
    await button(wrapper, 'Selesaikan misi').trigger('click');
    await flushPromises();
    expect(wrapper.emitted('completed')).toBeUndefined();
    expect(wrapper.text()).toContain('Waktu belajar selesai');
  });
});

describe('ActiveRecallPanel (cabang tambahan)', () => {
  const seed = (decks = [deckA, deckB]) => { useMissionsStore().decks = decks; };
  const mountPanel = (props = { wish: null }) => mount(ActiveRecallPanel, { props });

  it('tanpa materi: tombol mulai nonaktif', () => {
    seed([]);
    const wrapper = mountPanel();
    expect(button(wrapper, 'Mulai sesi kartu').attributes('disabled')).toBeDefined();
  });

  it('memilih materi, membaca catatan, dan memulai dari modal materi', async () => {
    seed();
    missionsApi.start.mockResolvedValue({ session: { id: 3, subject: 'Deck A', required_seconds: 5 } });
    const wrapper = mountPanel({ wish: { id: 7 } });
    expect(wrapper.text()).toContain('0 kartu');
    await wrapper.findAll('.deck')[1].trigger('click');
    expect(wrapper.findAll('.deck')[1].classes()).toContain('on');
    await wrapper.findAll('input[name="deck"]')[0].setValue(true);
    expect(wrapper.vm.selectedDeckId).toBe(1);
    expect(wrapper.vm.currentCard).toBeNull();

    await button(wrapper, 'Baca Materi').trigger('click');
    expect(wrapper.findComponent(StudyMaterialModal).exists()).toBe(true);
    wrapper.findComponent(StudyMaterialModal).vm.$emit('close');
    await wrapper.vm.$nextTick();
    expect(wrapper.findComponent(StudyMaterialModal).exists()).toBe(false);

    await button(wrapper, 'Baca Materi').trigger('click');
    await button(wrapper, 'Mulai Uji Ingatan').trigger('click');
    await flushPromises();
    expect(missionsApi.start).toHaveBeenCalledWith(expect.objectContaining({ deckId: 1, transactionId: 7 }));
    expect(wrapper.text()).toContain('Q1?');

    await button(wrapper, 'Batalkan sesi').trigger('click');
    expect(wrapper.text()).toContain('Pilih materi kartu');
  });

  it('modal AI: kuis baru dipilih otomatis dan modal dapat ditutup', async () => {
    seed();
    const wrapper = mountPanel();
    await button(wrapper, 'Buat Kuis AI').trigger('click');
    const modal = wrapper.findComponent(AiMaterialModal);
    modal.vm.$emit('created', { id: 2 });
    modal.vm.$emit('created', null);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.selectedDeckId).toBe(2);
    modal.vm.$emit('close');
    await wrapper.vm.$nextTick();
    expect(wrapper.findComponent(AiMaterialModal).exists()).toBe(false);
  });

  it('menghapus materi: berhasil, batal, gagal, dan pilihan dialihkan', async () => {
    seed();
    missionsApi.deleteDeck.mockResolvedValue({});
    const wrapper = mountPanel();
    const trash = () => wrapper.find('button[title="Hapus Materi Ini"]');

    await trash().trigger('click');
    expect(wrapper.text()).toContain('Hapus Materi Kuis?');
    wrapper.findComponent(ConfirmModal).vm.$emit('close');
    await wrapper.vm.$nextTick();
    expect(wrapper.findComponent(ConfirmModal).exists()).toBe(false);

    await trash().trigger('click');
    await button(wrapper, 'Hapus').trigger('click');
    await flushPromises();
    expect(missionsApi.deleteDeck).toHaveBeenCalledWith(1);
    expect(wrapper.vm.selectedDeckId).toBe(2);

    await wrapper.vm.confirmDeleteDeck();
    expect(missionsApi.deleteDeck).toHaveBeenCalledTimes(1);
  });

  it('menghapus materi yang tidak sedang dipilih, materi terakhir, dan kegagalan server', async () => {
    seed([deckA]);
    missionsApi.deleteDeck.mockRejectedValueOnce(new ApiError('Gagal hapus', 500));
    const wrapper = mountPanel();
    await wrapper.find('button[title="Hapus Materi Ini"]').trigger('click');
    await button(wrapper, 'Hapus').trigger('click');
    await flushPromises();
    expect(useMissionsStore().decks).toHaveLength(1);

    wrapper.vm.selectedDeckId = 99;
    missionsApi.deleteDeck.mockResolvedValueOnce({});
    await wrapper.find('button[title="Hapus Materi Ini"]').trigger('click');
    await button(wrapper, 'Hapus').trigger('click');
    await flushPromises();
    expect(wrapper.vm.selectedDeckId).toBe(99);

    seed([deckA]);
    wrapper.vm.selectedDeckId = 1;
    await wrapper.vm.$nextTick();
    missionsApi.deleteDeck.mockResolvedValueOnce({});
    await wrapper.find('button[title="Hapus Materi Ini"]').trigger('click');
    await button(wrapper, 'Hapus').trigger('click');
    await flushPromises();
    expect(wrapper.vm.selectedDeckId).toBeNull();
  });

  it('gagal memulai sesi menampilkan toast dan tetap di pilihan materi', async () => {
    seed();
    missionsApi.start.mockRejectedValue(new ApiError('Tidak bisa', 400));
    const wrapper = mountPanel();
    await button(wrapper, 'Mulai sesi kartu').trigger('click');
    await flushPromises();
    expect(wrapper.text()).toContain('Pilih materi kartu');
  });

  it('klaim gagal: server memberi sisa waktu, atau error biasa', async () => {
    vi.useFakeTimers();
    seed([deckA]);
    missionsApi.start.mockResolvedValue({ session: { id: 4, subject: 'Deck A', required_seconds: 1 } });
    const wrapper = mountPanel();
    await button(wrapper, 'Mulai sesi kartu').trigger('click');
    await flushPromises();
    await button(wrapper, 'Tampilkan jawaban').trigger('click');
    expect(wrapper.text()).toContain('E1');
    await wrapper.findAll('.rating')[0].trigger('click');
    expect(wrapper.vm.currentCard).toBeNull();
    vi.advanceTimersByTime(1500);
    await flushPromises();

    missionsApi.complete.mockRejectedValueOnce(new ApiError('Terlalu cepat', 400, { remaining_seconds: 4 }));
    await button(wrapper, 'Kirim hasil').trigger('click');
    await flushPromises();
    expect(wrapper.text()).toContain('00:05');

    vi.advanceTimersByTime(6000);
    await flushPromises();
    missionsApi.complete.mockRejectedValueOnce(new Error('putus'));
    await button(wrapper, 'Kirim hasil').trigger('click');
    await flushPromises();
    missionsApi.complete.mockRejectedValueOnce(new ApiError('ditolak', 400));
    await button(wrapper, 'Kirim hasil').trigger('click');
    await flushPromises();
    expect(wrapper.emitted('completed')).toBeUndefined();
  });
});

describe('missions store: generateAiDeck', () => {
  it('menambah, mengganti, atau mengabaikan deck hasil AI', async () => {
    const store = useMissionsStore();
    store.decks = [{ id: 1, title: 'lama' }];
    missionsApi.generateAi.mockResolvedValueOnce({ deck: { id: 2, title: 'baru' } });
    await store.generateAiDeck({ title: 't', subject: 's', content: 'c', cardCount: 3 });
    expect(store.decks.map((d) => d.id)).toEqual([2, 1]);

    missionsApi.generateAi.mockResolvedValueOnce({ deck: { id: 1, title: 'diganti' } });
    await store.generateAiDeck({ title: 't', subject: 's', content: 'c', cardCount: 3, saveAsDeck: false });
    expect(store.decks.find((d) => d.id === 1).title).toBe('diganti');

    missionsApi.generateAi.mockResolvedValueOnce({ deck: null });
    await store.generateAiDeck({ title: 't', subject: 's', content: 'c', cardCount: 3 });
    expect(store.decks).toHaveLength(2);
  });
});
