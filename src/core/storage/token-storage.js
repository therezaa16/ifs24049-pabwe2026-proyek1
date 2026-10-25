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
