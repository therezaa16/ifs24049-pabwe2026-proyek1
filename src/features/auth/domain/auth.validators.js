const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateLoginForm = ({ email, password }) => {
  const errors = {};
  if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Masukkan alamat email yang valid';
  if (!password) errors.password = 'Password wajib diisi';
  return errors;
};

export const validateRegisterForm = ({ name, email, password, confirmPassword, monthlyBudget }) => {
  const errors = {};
  if (name.trim().length < 2) errors.name = 'Nama lengkap minimal 2 karakter';
  if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Masukkan alamat email yang valid';
  if (password.length < 6) errors.password = 'Password minimal 6 karakter';
  if (confirmPassword !== password) errors.confirmPassword = 'Konfirmasi password tidak sama';
  const budget = Number(monthlyBudget);
  if (monthlyBudget !== '' && (budget < 0 || Number.isNaN(budget))) {
    errors.monthlyBudget = 'Anggaran bulanan harus berupa angka 0 atau lebih';
  }
  return errors;
};

/** Hanya mengizinkan tujuan redirect berupa path internal agar tidak menjadi open redirect. */
export const resolveRedirect = (target) =>
  typeof target === 'string' && target.startsWith('/') && !target.startsWith('//') ? target : '/';
