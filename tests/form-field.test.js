import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import FormField from '@/shared/components/FormField.vue';

const mountField = (props) => mount(FormField, {
  props: { id: 'x', label: 'Nama', ...props },
  slots: { default: '<template #default="{ invalid }"><input id="x" :aria-invalid="invalid" /></template>' }
});

describe('FormField', () => {
  it('menampilkan label dan menandai input valid', () => {
    const wrapper = mountField();
    expect(wrapper.find('label').attributes('for')).toBe('x');
    expect(wrapper.find('input').attributes('aria-invalid')).toBe('false');
    expect(wrapper.find('.field-error').exists()).toBe(false);
    expect(wrapper.find('.field-hint').exists()).toBe(false);
  });

  it('menampilkan error dan menandai input tidak valid', () => {
    const wrapper = mountField({ error: 'Wajib diisi', hint: 'Petunjuk' });
    expect(wrapper.find('.field-error').text()).toBe('Wajib diisi');
    expect(wrapper.find('.field-hint').exists()).toBe(false);
    expect(wrapper.find('input').attributes('aria-invalid')).toBe('true');
  });

  it('menampilkan petunjuk bila tidak ada error', () => {
    expect(mountField({ hint: 'Petunjuk' }).find('.field-hint').text()).toBe('Petunjuk');
  });
});
