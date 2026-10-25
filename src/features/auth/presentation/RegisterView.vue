<script setup>
import { reactive } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { validateRegisterForm } from '../domain/auth.validators.js';
import { useAuthStore } from '../application/auth.store.js';
import AuthLayout from './AuthLayout.vue';
import FormField from '@/shared/components/FormField.vue';
import { useFormSubmit } from '@/shared/composables/useFormSubmit.js';

const auth = useAuthStore();
const router = useRouter();

const form = reactive({ name: '', email: '', password: '', confirmPassword: '', monthlyBudget: '' });
const FIELD_MAP = { monthly_budget: 'monthlyBudget' };
const mapServerErrors = (serverErrors) =>
  Object.fromEntries(Object.entries(serverErrors).map(([key, message]) => [FIELD_MAP[key] || key, message]));

const { errors, formError, submitting, submit } = useFormSubmit({
  validate: () => validateRegisterForm(form),
  action: async () => {
    await auth.register(form);
    router.replace('/');
  },
  mapServerErrors
});
</script>

<template>
  <AuthLayout>
    <form class="card" novalidate @submit.prevent="submit">
      <div class="card-head">
        <p class="card-kicker">Mulai perjalanan</p>
        <h1>Buat akun</h1>
        <p class="lead">Mulai melatih disiplin finansial dan belajar dari sekarang.</p>
      </div>

      <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>

      <FormField id="name" label="Nama lengkap" :error="errors.name" v-slot="{ invalid, describedBy }">
        <input id="name" v-model="form.name" class="input" type="text" autocomplete="name" :aria-invalid="invalid" :aria-describedby="describedBy" />
      </FormField>

      <FormField id="email" label="Email" :error="errors.email" v-slot="{ invalid, describedBy }">
        <input id="email" v-model="form.email" class="input" type="email" autocomplete="email" :aria-invalid="invalid" :aria-describedby="describedBy" />
      </FormField>

      <div class="pair">
        <FormField id="password" label="Password" :error="errors.password" v-slot="{ invalid, describedBy }">
          <input id="password" v-model="form.password" class="input" type="password" autocomplete="new-password" :aria-invalid="invalid" :aria-describedby="describedBy" />
        </FormField>
        <FormField id="confirm" label="Ulangi password" :error="errors.confirmPassword" v-slot="{ invalid, describedBy }">
          <input id="confirm" v-model="form.confirmPassword" class="input" type="password" autocomplete="new-password" :aria-invalid="invalid" :aria-describedby="describedBy" />
        </FormField>
      </div>

      <FormField id="budget" label="Anggaran bulanan (opsional)" :error="errors.monthlyBudget" hint="Dipakai untuk menghitung sisa anggaran di dashboard." v-slot="{ invalid, describedBy }">
        <input id="budget" v-model="form.monthlyBudget" class="input num" type="number" min="0" step="1000" inputmode="numeric" placeholder="1500000" :aria-invalid="invalid" :aria-describedby="describedBy" />
      </FormField>

      <button type="submit" class="btn btn-primary btn-block" :disabled="submitting">
        {{ submitting ? 'Memproses…' : 'Daftar' }}
      </button>

      <p class="switch">Sudah punya akun? <RouterLink to="/masuk">Masuk</RouterLink></p>
    </form>
  </AuthLayout>
</template>

<style scoped>
.card { width: min(34rem, 100%); background: linear-gradient(180deg, rgba(255,255,255,0.98) 0%, var(--surface) 100%); border: 1px solid var(--line); border-radius: var(--radius-l); padding: clamp(1.8rem, 4vw, 2.8rem); box-shadow: var(--shadow-elevated); display: grid; gap: 1rem; }
.card-head { display: grid; gap: 0.4rem; }
.card-kicker { text-transform: uppercase; letter-spacing: 0.3em; font-size: 0.7rem; color: var(--cobalt); font-weight: 700; }
h1 { font-size: clamp(2rem, 4vw, 2.8rem); }
.lead { color: var(--ink-soft); }
.form-error { background: var(--rose-wash); color: var(--rose); border: 1px solid rgba(220, 38, 38, 0.2); border-radius: var(--radius-m); padding: 0.7rem 0.9rem; font-weight: 500; }
.pair { display: grid; gap: 0 1rem; }
.switch { margin-top: 0.5rem; text-align: center; color: var(--ink-soft); }
@media (min-width: 34rem) { .pair { grid-template-columns: 1fr 1fr; } }
</style>
