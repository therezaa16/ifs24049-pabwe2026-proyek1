import { TRANSACTION_STATUSES, TRANSACTION_TYPES } from '@/shared/domain/transaction-types.js';

// Berkas ini khusus presentasi: label teks dan nada tampilan untuk transaksi.
// Domain hanya mengenal tipe dan status, bukan cara menampilkannya.

export const TYPE_LABELS = Object.freeze({
  [TRANSACTION_TYPES.INCOME]: 'Pemasukan',
  [TRANSACTION_TYPES.NEED]: 'Kebutuhan',
  [TRANSACTION_TYPES.WANT]: 'Keinginan'
});

export const STATUS_LABELS = Object.freeze({
  [TRANSACTION_STATUSES.ACTIVE]: 'Tercatat',
  [TRANSACTION_STATUSES.LOCKED]: 'Terkunci',
  [TRANSACTION_STATUSES.UNLOCKED]: 'Terbuka',
  [TRANSACTION_STATUSES.CANCELLED]: 'Dibatalkan'
});

export const STATUS_TONES = Object.freeze({
  [TRANSACTION_STATUSES.ACTIVE]: 'active',
  [TRANSACTION_STATUSES.LOCKED]: 'locked',
  [TRANSACTION_STATUSES.UNLOCKED]: 'unlocked',
  [TRANSACTION_STATUSES.CANCELLED]: 'cancelled'
});

/** Menentukan tanda dan nada tampilan nominal: hanya uang yang benar-benar berlaku yang bertanda. */
export const presentAmount = (transaction) => {
  if (transaction.type === TRANSACTION_TYPES.INCOME) return { prefix: '+', tone: 'positive' };
  if (transaction.status === TRANSACTION_STATUSES.LOCKED) return { prefix: '', tone: 'pending' };
  if (transaction.status === TRANSACTION_STATUSES.CANCELLED) return { prefix: '', tone: 'muted' };
  return { prefix: '−', tone: 'negative' };
};
