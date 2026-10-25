<script setup>
import { reactive } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { validateLoginForm, resolveRedirect } from '../domain/auth.validators.js';
import { useAuthStore } from '../application/auth.store.js';
import AuthLayout from './AuthLayout.vue';
import FormField from '@/shared/components/FormField.vue';
import { useFormSubmit } from '@/shared/composables/useFormSubmit.js';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const form = reactive({ email: '', password: '' });
const { errors, formError, submitting, submit } = useFormSubmit({
  validate: () => validateLoginForm(form),
  action: async () => {
    await auth.login(form);
    router.replace(resolveRedirect(route.query.redirect));
  }
});
</script>

<template>
  <AuthLayout>
    <form class="card" novalidate @submit.prevent="submit">
      <div class="card-head">
        <p class="card-kicker">Selamat datang kembali</p>
        <h1>Masuk</h1>
        <p class="lead">Lanjutkan mencatat keuangan dan menuntaskan misi belajarmu.</p>
      </div>

      <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>

      <FormField id="username" label="Email" :error="errors.email" v-slot="{ invalid, describedBy }">
        <input id="username" name="username" v-model="form.email" class="input" type="email" autocomplete="email" :aria-invalid="invalid" :aria-describedby="describedBy" />
      </FormField>

      <FormField id="password" label="Password" :error="errors.password" v-slot="{ invalid, describedBy }">
        <input id="password" v-model="form.password" class="input" type="password" autocomplete="current-password" :aria-invalid="invalid" :aria-describedby="describedBy" />
      </FormField>

      <button id="btn-submit" type="submit" class="btn btn-primary btn-block" :disabled="submitting">
        {{ submitting ? 'Memproses…' : 'Masuk' }}
      </button>

      <p class="switch">Belum punya akun? <RouterLink to="/daftar">Daftar sekarang</RouterLink></p>
    </form>
  </AuthLayout>
</template>

<style scoped>
.card { width: min(28rem, 100%); background: linear-gradient(180deg, rgba(255,255,255,0.98) 0%, var(--surface) 100%); border: 1px solid var(--line); border-radius: var(--radius-l); padding: clamp(1.8rem, 4vw, 2.6rem); box-shadow: var(--shadow-elevated); display: grid; gap: 1rem; }
.card-head { display: grid; gap: 0.4rem; }
.card-kicker { text-transform: uppercase; letter-spacing: 0.3em; font-size: 0.7rem; color: var(--cobalt); font-weight: 700; }
h1 { font-size: clamp(2rem, 4vw, 2.8rem); }
.lead { color: var(--ink-soft); }
.form-error { background: var(--rose-wash); color: var(--rose); border: 1px solid rgba(220, 38, 38, 0.2); border-radius: var(--radius-m); padding: 0.7rem 0.9rem; font-weight: 500; }
.switch { margin-top: 0.5rem; text-align: center; color: var(--ink-soft); }
</style>
