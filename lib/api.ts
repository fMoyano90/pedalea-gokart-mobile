import { API_BASE_URL } from '@/constants/config';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export async function apiFetch<TResponse>(
  path: string,
  options: { method?: HttpMethod; body?: unknown; token?: string } = {}
): Promise<TResponse> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : undefined;

  if (!res.ok) {
    const message = (data && (data.message || data.error)) || 'Error en la solicitud';
    throw new ApiError(Array.isArray(message) ? message.join(', ') : String(message), res.status, data);
  }

  return data as TResponse;
}


