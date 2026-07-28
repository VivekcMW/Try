import { useWalletStore } from '@/store/walletStore';

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? '';

type RequestInitWithoutBody = Omit<RequestInit, 'body'>;

interface ApiClientOptions extends RequestInitWithoutBody {
  body?: Record<string, unknown> | string | null;
  skipAuth?: boolean;
}

// Callbacks registered by the app shell to handle auth expiry
let onSessionExpired: (() => void) | null = null;

export function registerSessionExpiredHandler(cb: () => void) {
  onSessionExpired = cb;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: ApiClientOptions = {},
): Promise<T> {
  const { body, skipAuth, headers: extraHeaders, ...rest } = options;

  const token = skipAuth ? null : useWalletStore.getState().token;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(extraHeaders as Record<string, string>),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${BASE}${path}`, {
    ...rest,
    headers,
    ...(body != null ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}),
  });

  if (res.status === 401) {
    useWalletStore.getState().setToken(null);
    onSessionExpired?.();
    throw new Error('SESSION_EXPIRED');
  }

  if (!res.ok) {
    throw new Error(`API ${res.status}: ${path}`);
  }

  const text = await res.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}
