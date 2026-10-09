"use client";

/**
 * Tiny localStorage draft helper. Every access is wrapped in try/catch
 * (private mode, blocked storage). The "existed at load" flag is read once per
 * page load and cached, so autosaving doesn't make the restore banner reappear.
 */
const loadedFlags = new Map<string, boolean>();

export function readDraft<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeDraft(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify({ ...((value as object) ?? {}), savedAt: Date.now() }));
  } catch {
    /* storage unavailable */
  }
}

export function clearDraft(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
  loadedFlags.set(key, false);
}

export function draftExistedAtLoad(key: string): boolean {
  if (!loadedFlags.has(key)) loadedFlags.set(key, readDraft(key) !== null);
  return loadedFlags.get(key) ?? false;
}

export const noopSubscribe = () => () => {};
