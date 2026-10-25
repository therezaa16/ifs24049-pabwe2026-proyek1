export class ApiError extends Error {
  constructor(message, status = 0, errors = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export const fieldErrorsOf = (error) =>
  error instanceof ApiError && error.errors && typeof error.errors === 'object' ? error.errors : {};

/** Sisa detik tunggu yang dikirim server saat misi belum boleh diselesaikan; null bila tidak ada. */
export const remainingSecondsOf = (error) => fieldErrorsOf(error).remaining_seconds ?? null;

/** Pesan error untuk ditampilkan ke pengguna, dengan cadangan bila error tidak membawa pesan. */
export const errorMessageOf = (error, fallback) => error?.message || fallback;
