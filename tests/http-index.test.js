import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { httpClient, setUnauthorizedHandler } from '@/core/http/index.js';
import { tokenStorage } from '@/core/storage/token-storage.js';

const respond = (status, body) => ({ ok: status < 400, status, json: async () => body });

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal('fetch', vi.fn());
});
afterEach(() => vi.unstubAllGlobals());

describe('httpClient bawaan', () => {
  it('menyertakan token dari storage pada header Authorization', async () => {
    tokenStorage.set('abc');
    fetch.mockResolvedValue(respond(200, { ok: true }));
    await expect(httpClient.get('/ping')).resolves.toEqual({ ok: true });
    expect(fetch).toHaveBeenCalledWith('/api/ping', expect.objectContaining({
      headers: expect.objectContaining({ Authorization: 'Bearer abc' })
    }));
  });

  it('401 saat bertoken memanggil handler bawaan (kosong) lalu handler yang didaftarkan', async () => {
    tokenStorage.set('abc');
    fetch.mockResolvedValue(respond(401, { message: 'Tidak sah' }));
    await expect(httpClient.get('/me')).rejects.toThrow('Tidak sah');

    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    await expect(httpClient.get('/me')).rejects.toThrow('Tidak sah');
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
