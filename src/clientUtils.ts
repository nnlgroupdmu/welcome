export function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key: string, value: string): boolean {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function parseJson<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function readJsonStorage<T>(key: string, fallback: T): T {
  return parseJson(readStorage(key), fallback);
}

export function writeJsonStorage(key: string, value: unknown): boolean {
  try {
    return writeStorage(key, JSON.stringify(value));
  } catch {
    return false;
  }
}

export function readBooleanStorage(key: string, fallback: boolean): boolean {
  const cached = readStorage(key);
  if (cached === 'true') return true;
  if (cached === 'false') return false;
  return fallback;
}

export function readEnumStorage<T extends string>(
  key: string,
  allowedValues: readonly T[],
  fallback: T
): T {
  const cached = readStorage(key);
  return allowedValues.includes(cached as T) ? (cached as T) : fallback;
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}, timeoutMs = 2500) {
  const controller = new AbortController();
  const timerId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timerId);
  }
}
