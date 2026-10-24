export const validateTransactionForm = ({ title, amount, category }) => {
  const errors = {};
  if (title.trim().length < 2) errors.title = 'Judul minimal 2 karakter';
  const numericAmount = Number(amount);
  if (numericAmount <= 0 || Number.isNaN(numericAmount)) errors.amount = 'Nominal harus lebih besar dari 0';
  if (!category.trim()) errors.category = 'Pilih atau isi kategori';
  return errors;
};
