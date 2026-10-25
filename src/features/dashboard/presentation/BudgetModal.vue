<script setup>
import { ref } from 'vue';
import BaseModal from '@/shared/components/BaseModal.vue';
import { useToast } from '@/shared/composables/useToast.js';
import { useAuthStore } from '@/features/auth/application/auth.store.js';
import FormField from '@/shared/components/FormField.vue';

const props = defineProps({ current: { type: Number, default: 0 } });
const emit = defineEmits(['close', 'saved']);

const auth = useAuthStore();
const toast = useToast();

const value = ref(String(props.current));
const error = ref('');
const saving = ref(false);

const save = async () => {
  error.value = Number(value.value) >= 0 && value.value !== '' ? '' : 'Masukkan angka 0 atau lebih';
  if (error.value) return;

  saving.value = true;
  try {
    await auth.updateBudget(value.value);
    toast.success('Anggaran bulanan diperbarui');
    emit('saved');
    emit('close');
  } catch (error_) {
    error.value = error_.message;
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <BaseModal title="Atur anggaran bulanan" @close="emit('close')">
    <form novalidate @submit.prevent="save">
      <FormField id="budget-input" label="Anggaran per bulan (Rp)" :error="error" hint="Isi 0 untuk menonaktifkan perhitungan sisa anggaran." v-slot="{ invalid }">
        <input id="budget-input" v-model="value" class="input num" type="number" min="0" step="10000" inputmode="numeric" :aria-invalid="invalid" />
      </FormField>
      <div class="foot">
        <button type="button" class="btn" @click="emit('close')">Batal</button>
        <button type="submit" class="btn btn-primary" :disabled="saving">{{ saving ? 'Menyimpan…' : 'Simpan' }}</button>
      </div>
    </form>
  </BaseModal>
</template>

<style scoped>
.foot { display: flex; justify-content: flex-end; gap: 0.6rem; }
</style>
