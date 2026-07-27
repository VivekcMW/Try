/** In-memory AsyncStorage stand-in so zustand-persist can run in Node. */
const store: Map<string, string> = new Map();

export default {
  getItem: (k: string) => Promise.resolve(store.get(k) ?? null),
  setItem: (k: string, v: string) => { store.set(k, v); return Promise.resolve(); },
  removeItem: (k: string) => { store.delete(k); return Promise.resolve(); },
  clear: () => { store.clear(); return Promise.resolve(); },
  getAllKeys: () => Promise.resolve(Array.from(store.keys())),
  multiGet: (keys: string[]) => Promise.resolve(keys.map((k) => [k, store.get(k) ?? null] as [string, string | null])),
  multiSet: (pairs: [string, string][]) => { for (const [k, v] of pairs) store.set(k, v); return Promise.resolve(); },
  multiRemove: (keys: string[]) => { for (const k of keys) store.delete(k); return Promise.resolve(); },
};
