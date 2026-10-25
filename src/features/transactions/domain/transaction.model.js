import { TRANSACTION_STATUSES, TRANSACTION_TYPES } from '@/shared/domain/transaction-types.js';

export { TRANSACTION_STATUSES, TRANSACTION_TYPES };

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
