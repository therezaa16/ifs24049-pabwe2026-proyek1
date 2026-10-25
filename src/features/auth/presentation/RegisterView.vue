<script setup>
import { reactive, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { fieldErrorsOf } from '@/core/http/api-error.js';
import { validateRegisterForm } from '../domain/auth.validators.js';
import { useAuthStore } from '../application/auth.store.js';
import AuthLayout from './AuthLayout.vue';
import FormField from '@/shared/components/FormField.vue';

const auth = useAuthStore();
const router = useRouter();

const form = reactive({ name: '', email: '', password: '', confirmPassword: '', monthlyBudget: '' });
const errors = ref({});
const formError = ref('');
const submitting = ref(false);

const FIELD_MAP = { monthly_budget: 'monthlyBudget' };

const mapServerErrors = (serverErrors) =>
  Object.fromEntries(Object.entries(serverErrors).map(([key, message]) => [FIELD_MAP[key] || key, message]));

const submit = async () => {
  formError.value = '';
  errors.value = validateRegisterForm(form);
  if (Object.keys(errors.value).length > 0) return;

  submitting.value = true;
  try {
    await auth.register(form);
    router.replace('/');
  } catch (error) {
    formError.value = error.message;
    errors.value = mapServerErrors(fieldErrorsOf(error));
  } finally {
    submitting.value = false;
  }
};
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

      <FormField id="name" label="Nama lengkap" :error="errors.name" v-slot="{ invalid }">
        <input id="name" v-model="form.name" class="input" type="text" autocomplete="name" :aria-invalid="invalid" />
      </FormField>

      <FormField id="email" label="Email" :error="errors.email" v-slot="{ invalid }">
        <input id="email" v-model="form.email" class="input" type="email" autocomplete="email" :aria-invalid="invalid" />
      </FormField>

      <div class="pair">
        <FormField id="password" label="Password" :error="errors.password" v-slot="{ invalid }">
          <input id="password" v-model="form.password" class="input" type="password" autocomplete="new-password" :aria-invalid="invalid" />
        </FormField>
        <FormField id="confirm" label="Ulangi password" :error="errors.confirmPassword" v-slot="{ invalid }">
          <input id="confirm" v-model="form.confirmPassword" class="input" type="password" autocomplete="new-password" :aria-invalid="invalid" />
        </FormField>
      </div>

      <FormField id="budget" label="Anggaran bulanan (opsional)" :error="errors.monthlyBudget" hint="Dipakai untuk menghitung sisa anggaran di dashboard." v-slot="{ invalid }">
        <input id="budget" v-model="form.monthlyBudget" class="input num" type="number" min="0" step="1000" inputmode="numeric" placeholder="1500000" :aria-invalid="invalid" />
      </FormField>

      <button type="submit" class="btn btn-primary btn-block" :disabled="submitting">
        {{ submitting ? 'Memproses…' : 'Daftar' }}
      </button>

      <p class="switch">Sudah punya akun? <RouterLink to="/masuk">Masuk</RouterLink></p>
    </form>
  </AuthLayout>
</template>

<style scoped>
.card { width: min(34rem, 100%); background: linear-gradient(180deg, rgba(255,255,255,0.98) 0%, #fff 100%); border: 1px solid var(--line); border-radius: var(--radius-l); padding: clamp(1.8rem, 4vw, 2.8rem); box-shadow: var(--shadow-elevated); display: grid; gap: 1rem; }
.card-head { display: grid; gap: 0.4rem; }
.card-kicker { text-transform: uppercase; letter-spacing: 0.3em; font-size: 0.7rem; color: var(--cobalt); font-weight: 700; }
h1 { font-size: clamp(2rem, 4vw, 2.8rem); }
.lead { color: var(--ink-soft); }
.form-error { background: var(--rose-wash); color: var(--rose); border: 1px solid rgba(220, 38, 38, 0.2); border-radius: var(--radius-m); padding: 0.7rem 0.9rem; font-weight: 500; }
.pair { display: grid; gap: 0 1rem; }
.switch { margin-top: 0.5rem; text-align: center; color: var(--ink-soft); }
@media (min-width: 34rem) { .pair { grid-template-columns: 1fr 1fr; } }
</style>
