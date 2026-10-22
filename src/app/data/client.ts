const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

/**
 * Placeholder identity. The API resolves the caller from this header; with an
 * empty database the caller is anonymous. Replace with real sessions when
 * authentication is implemented.
 */
export const CURRENT_USER_HANDLE = 'vm-user';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      'x-user-handle': CURRENT_USER_HANDLE,
      ...init.headers,
    },
  });

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const error = (body as { error?: { message?: string; details?: unknown } } | null)?.error;
    throw new ApiError(
      response.status,
      error?.message ?? `Request failed with status ${response.status}`,
      error?.details,
    );
  }

  return body as T;
}
