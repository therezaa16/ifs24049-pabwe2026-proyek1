/**
 * Penyimpanan token JWT.
 *
 * Token disimpan di localStorage karena backend memakai autentikasi Bearer (bukan cookie httpOnly),
 * sehingga frontend harus membaca token untuk header Authorization. Risikonya: skrip yang berhasil
 * disisipkan (XSS) dapat membaca token. Mitigasinya:
 *  - Content-Security-Policy ketat di vercel.json (hanya skrip dari origin sendiri),
 *  - Vue meng-escape semua interpolasi dan proyek tidak memakai v-html,
 *  - token berumur terbatas (JWT_EXPIRES_IN) dan dihapus otomatis saat server membalas 401.
 * Akses ke storage dibungkus try/catch agar aplikasi tetap jalan di mode privat / storage nonaktif.
 */
const TOKEN_KEY = 'dfm.token';

const safely = (operation, fallback) => {
  try {
    return operation();
  } catch {
    return fallback;
  }
};

export const tokenStorage = {
  get: () => safely(() => globalThis.localStorage.getItem(TOKEN_KEY), null),
  set: (token) => safely(() => globalThis.localStorage.setItem(TOKEN_KEY, token)),
  clear: () => safely(() => globalThis.localStorage.removeItem(TOKEN_KEY))
};
