import { describe, expect, it } from 'vitest';
import { STATUS_LABELS, STATUS_TONES, TYPE_LABELS, presentAmount } from '@/features/transactions/presentation/transaction.presenter.js';

const want = (status) => ({ type: 'keinginan', status });

describe('transaction.presenter', () => {
  it('menampilkan tanda nominal sesuai kondisi uang', () => {
    expect(presentAmount({ type: 'pemasukan', status: 'aktif' })).toEqual({ prefix: '+', tone: 'positive' });
    expect(presentAmount(want('terkunci'))).toEqual({ prefix: '', tone: 'pending' });
    expect(presentAmount(want('dibatalkan'))).toEqual({ prefix: '', tone: 'muted' });
    expect(presentAmount(want('terbuka'))).toEqual({ prefix: '−', tone: 'negative' });
    expect(presentAmount({ type: 'kebutuhan', status: 'aktif' }).tone).toBe('negative');
  });

  it('menyediakan label dan nada untuk setiap tipe dan status', () => {
    expect(TYPE_LABELS.keinginan).toBe('Keinginan');
    expect(STATUS_LABELS.terkunci).toBe('Terkunci');
    expect(STATUS_TONES.dibatalkan).toBe('cancelled');
  });
});
