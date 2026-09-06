/**
 * MVP operations persistence abstraction.
 * Application code should depend on this interface, not on localStorage/sessionStorage directly.
 * The browser adapter still uses those stores; a future durable backend can swap adapters.
 */

export const OPERATIONS_OVERLAY_KEY = "vti-operations-overlay";

export type OperationsPersistenceAdapter = {
  /** Load raw serialized state, or null if none. */
  load(): string | null;
  /** Persist serialized state. */
  save(raw: string): void;
  /** Clear persisted state (demo reset). */
  clear(): void;
};

/** Dual-write browser adapter: localStorage primary, sessionStorage mirror (existing MVP behavior). */
export function createBrowserOperationsPersistence(
  key: string = OPERATIONS_OVERLAY_KEY,
): OperationsPersistenceAdapter {
  return {
    load() {
      if (typeof window === "undefined") return null;
      try {
        return window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key);
      } catch {
        return null;
      }
    },
    save(raw: string) {
      if (typeof window === "undefined") return;
      try {
        window.localStorage.setItem(key, raw);
      } catch {
        /* quota */
      }
      try {
        window.sessionStorage.setItem(key, raw);
      } catch {
        /* quota / private mode */
      }
    },
    clear() {
      if (typeof window === "undefined") return;
      try {
        window.localStorage.removeItem(key);
      } catch {
        /* private mode */
      }
      try {
        window.sessionStorage.removeItem(key);
      } catch {
        /* private mode */
      }
    },
  };
}

let activeAdapter: OperationsPersistenceAdapter = createBrowserOperationsPersistence();

/** Replace the active adapter (tests / future backends). */
export function setOperationsPersistenceAdapter(adapter: OperationsPersistenceAdapter) {
  activeAdapter = adapter;
}

export function getOperationsPersistenceAdapter() {
  return activeAdapter;
}

export function loadPersistedRaw() {
  return activeAdapter.load();
}

export function savePersistedRaw(raw: string) {
  activeAdapter.save(raw);
}

export function clearPersistedRaw() {
  activeAdapter.clear();
}
