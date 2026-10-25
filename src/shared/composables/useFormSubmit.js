import { ref } from 'vue';
import { fieldErrorsOf } from '@/core/http/api-error.js';

/**
 * Alur submit form yang seragam: validasi lokal -> panggil aksi -> petakan error dari server.
 * Mengembalikan state (`errors`, `formError`, `submitting`) dan fungsi `submit` untuk dipasang di <form>.
 */
export const useFormSubmit = ({ validate, action, mapServerErrors = (errors) => errors, onServerError }) => {
  const errors = ref({});
  const formError = ref('');
  const submitting = ref(false);

  const submit = async () => {
    formError.value = '';
    errors.value = validate();
    if (Object.keys(errors.value).length > 0) return false;

    submitting.value = true;
    try {
      await action();
      return true;
    } catch (error) {
      formError.value = error.message;
      errors.value = mapServerErrors(fieldErrorsOf(error));
      onServerError?.(error);
      return false;
    } finally {
      submitting.value = false;
    }
  };

  return { errors, formError, submitting, submit };
};
