export const TRANSACTION_TYPES = Object.freeze({
  INCOME: 'pemasukan',
  NEED: 'kebutuhan',
  WANT: 'keinginan'
});

export const TRANSACTION_STATUSES = Object.freeze({
  ACTIVE: 'aktif',
  LOCKED: 'terkunci',
  UNLOCKED: 'terbuka',
  CANCELLED: 'dibatalkan'
});

export const CATEGORIES = Object.freeze([
  'Makanan & Minuman',
  'Transportasi',
  'Kuliah & Buku',
  'Kos & Tagihan',
  'Hiburan',
  'Fashion',
  'Uang Saku',
  'Lainnya'
]);

export const isLockedWish = (transaction) =>
  transaction.type === TRANSACTION_TYPES.WANT && transaction.status === TRANSACTION_STATUSES.LOCKED;

export const filterTransactions = (transactions, { type = '', status = '' } = {}) =>
  transactions.filter((item) => (!type || item.type === type) && (!status || item.status === status));
