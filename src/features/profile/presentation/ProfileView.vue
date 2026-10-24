<script setup>
import { computed } from 'vue';
import AppIcon from '@/shared/components/AppIcon.vue';
import { useAuthStore } from '@/features/auth/application/auth.store.js';

const auth = useAuthStore();
const name = computed(() => auth.user?.name || 'Mahasiswa');
const email = computed(() => auth.user?.email || 'Email belum tersedia');
const initial = computed(() => name.value.charAt(0).toUpperCase());
</script>

<template>
  <section class="profile-page space-y-7">
    <header class="page-heading space-y-2">
      <p class="eyebrow">AKUN</p>
      <h1 class="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">Profil Saya</h1>
      <p class="text-sm md:text-base text-slate-500 max-w-2xl">
        Lihat informasi akun dan kelola detail profil serta keamanan akunmu.
      </p>
    </header>

    <section class="identity-card flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5" aria-label="Informasi akun">
      <div class="avatar-wrap relative shrink-0">
        <div class="avatar flex items-center justify-center rounded-full text-3xl font-extrabold text-white">
          {{ initial }}
        </div>
        <button
          type="button"
          class="photo-action flex items-center justify-center rounded-full"
          aria-label="Upload foto profil"
          title="Upload foto belum didukung oleh backend"
          disabled
        >
          <AppIcon name="camera" :size="16" />
        </button>
      </div>
      <div class="min-w-0">
        <h2 class="text-xl font-bold text-slate-900 truncate">{{ name }}</h2>
        <p class="mt-1 text-sm text-slate-500 truncate">{{ email }}</p>
        <p class="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          <AppIcon name="check" :size="14" />
          Akun terhubung
        </p>
      </div>
      <p class="photo-note text-xs text-slate-500 sm:ml-auto">
        Foto profil belum dapat diubah karena backend belum menyediakan fitur upload.
      </p>
    </section>

    <div class="details-grid grid grid-cols-1 lg:grid-cols-2 gap-5">
      <section class="detail-card rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm">
        <div class="card-heading flex items-center gap-3 border-b border-slate-100 pb-4">
          <span class="section-icon profile-icon flex items-center justify-center rounded-xl">
            <AppIcon name="user" :size="19" />
          </span>
          <div>
            <h2 class="font-bold text-slate-900">Ubah Biodata</h2>
            <p class="text-xs text-slate-500">Informasi dari akun yang sedang masuk</p>
          </div>
        </div>

        <div class="mt-5 space-y-4">
          <div class="field">
            <label for="profile-name">Nama lengkap</label>
            <input id="profile-name" class="input" :value="auth.user?.name || ''" autocomplete="name" readonly />
          </div>
          <div class="field">
            <label for="profile-email">Alamat email</label>
            <input id="profile-email" class="input" :value="auth.user?.email || ''" type="email" autocomplete="email" readonly />
          </div>
          <p class="availability-note" role="status">
            Perubahan biodata belum tersedia karena backend belum menyediakan endpoint penyimpanan profil.
          </p>
          <button type="button" class="btn btn-block save-button" disabled>
            Simpan Perubahan
          </button>
        </div>
      </section>

      <section class="detail-card rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm">
        <div class="card-heading flex items-center gap-3 border-b border-slate-100 pb-4">
          <span class="section-icon security-icon flex items-center justify-center rounded-xl">
            <AppIcon name="shield" :size="19" />
          </span>
          <div>
            <h2 class="font-bold text-slate-900">Keamanan &amp; Password</h2>
            <p class="text-xs text-slate-500">Jaga keamanan akunmu</p>
          </div>
        </div>

        <div class="mt-5 space-y-4">
          <div class="field">
            <label for="current-password">Kata sandi saat ini</label>
            <input id="current-password" class="input" type="password" autocomplete="current-password" disabled />
          </div>
          <div class="field">
            <label for="new-password">Kata sandi baru</label>
            <input id="new-password" class="input" type="password" autocomplete="new-password" placeholder="Minimal 6 karakter" disabled />
          </div>
          <div class="field">
            <label for="confirm-password">Ulangi kata sandi baru</label>
            <input id="confirm-password" class="input" type="password" autocomplete="new-password" placeholder="Konfirmasi kata sandi" disabled />
          </div>
          <p class="availability-note security-note" role="status">
            Perubahan kata sandi belum tersedia karena backend belum menyediakan endpoint perubahan password.
          </p>
          <button type="button" class="btn btn-block password-button" disabled>
            Perbarui Password
          </button>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.eyebrow {
  color: #6366f1;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.28em;
}
.identity-card {
  min-height: 9rem;
  padding: 1.5rem 1.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 1.5rem;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 8px 24px -18px rgb(15 23 42 / 0.2);
}
.avatar-wrap {
  width: 5.25rem;
  height: 5.25rem;
  padding: 0.2rem;
  border: 2px solid #99f6e4;
  border-radius: 50%;
}
.avatar {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #6366f1, #9333ea);
}
.photo-action {
  position: absolute;
  right: -0.1rem;
  bottom: -0.1rem;
  width: 1.8rem;
  height: 1.8rem;
  color: white;
  background: #0f766e;
}
.photo-action:disabled {
  cursor: not-allowed;
  opacity: 0.8;
}
.photo-note {
  max-width: 17rem;
  line-height: 1.5;
}
.detail-card {
  min-width: 0;
}
.section-icon {
  width: 2.5rem;
  height: 2.5rem;
}
.profile-icon {
  color: #0f766e;
  background: #f0fdfa;
}
.security-icon {
  color: #b45309;
  background: #fffbeb;
}
.field {
  margin: 0;
}
.field > label {
  color: #475569;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.input[readonly] {
  color: #334155;
  background: #fff;
}
.input:disabled {
  color: #94a3b8;
  background: #f8fafc;
  cursor: not-allowed;
}
.availability-note {
  padding: 0.75rem 0.85rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  color: #475569;
  background: #f8fafc;
  font-size: 0.8rem;
  line-height: 1.5;
}
.security-note {
  color: #854d0e;
  border-color: #fde68a;
  background: #fffbeb;
}
.save-button {
  color: #fff;
  background: #0f766e;
}
.password-button {
  color: #fff;
  background: #0f172a;
}
@media (max-width: 639px) {
  .identity-card {
    padding: 1.25rem;
  }
}
</style>
