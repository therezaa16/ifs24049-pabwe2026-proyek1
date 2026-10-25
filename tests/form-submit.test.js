import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/core/http/api-error.js';
import { useFormSubmit } from '@/shared/composables/useFormSubmit.js';

describe('useFormSubmit', () => {
  it('tidak memanggil aksi bila validasi gagal', async () => {
    const action = vi.fn();
    const { errors, submit, submitting } = useFormSubmit({ validate: () => ({ name: 'Wajib' }), action });
    expect(await submit()).toBe(false);
    expect(errors.value).toEqual({ name: 'Wajib' });
    expect(action).not.toHaveBeenCalled();
    expect(submitting.value).toBe(false);
  });

  it('memanggil aksi dan mengembalikan true bila berhasil', async () => {
    const action = vi.fn().mockResolvedValue();
    const { errors, formError, submit } = useFormSubmit({ validate: () => ({}), action });
    expect(await submit()).toBe(true);
    expect(action).toHaveBeenCalledTimes(1);
    expect(errors.value).toEqual({});
    expect(formError.value).toBe('');
  });

  it('memetakan error server dan memanggil onServerError', async () => {
    const onServerError = vi.fn();
    const action = vi.fn().mockRejectedValue(new ApiError('Gagal', 422, { monthly_budget: 'Salah' }));
    const { errors, formError, submit } = useFormSubmit({
      validate: () => ({}),
      action,
      mapServerErrors: (serverErrors) => ({ monthlyBudget: serverErrors.monthly_budget }),
      onServerError
    });
    expect(await submit()).toBe(false);
    expect(formError.value).toBe('Gagal');
    expect(errors.value).toEqual({ monthlyBudget: 'Salah' });
    expect(onServerError).toHaveBeenCalledTimes(1);
  });

  it('memakai pemetaan bawaan dan tanpa onServerError', async () => {
    const { errors, formError, submit } = useFormSubmit({ validate: () => ({}), action: vi.fn().mockRejectedValue(new Error('putus')) });
    expect(await submit()).toBe(false);
    expect(formError.value).toBe('putus');
    expect(errors.value).toEqual({});
  });
});
