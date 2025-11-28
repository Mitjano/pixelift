/**
 * Fetch wrapper with timeout and retry support
 * Prevents hanging requests and improves reliability
 */

export interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export class FetchTimeoutError extends Error {
  constructor(url: string, timeout: number) {
    super(`Request to ${url} timed out after ${timeout}ms`);
    this.name = 'FetchTimeoutError';
  }
}

export class FetchRetryError extends Error {
  constructor(url: string, attempts: number, lastError: Error) {
    super(`Request to ${url} failed after ${attempts} attempts: ${lastError.message}`);
    this.name = 'FetchRetryError';
  }
}

/**
 * Fetch with timeout support
 */
export async function fetchWithTimeout(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const {
    timeout = 30000, // 30 seconds default
    retries = 0,
    retryDelay = 1000,
    ...fetchOptions
  } = options;

  let lastError: Error = new Error('Unknown error');

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          lastError = new FetchTimeoutError(url, timeout);
        } else {
          lastError = error;
        }
      }

      // If we have retries left, wait and try again
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
        continue;
      }
    }
  }

  if (retries > 0) {
    throw new FetchRetryError(url, retries + 1, lastError);
  }
  throw lastError;
}

/**
 * Fetch JSON with timeout
 */
export async function fetchJSON<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const response = await fetchWithTimeout(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Post JSON with timeout
 */
export async function postJSON<T>(
  url: string,
  data: unknown,
  options: FetchOptions = {}
): Promise<T> {
  return fetchJSON<T>(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Download file with timeout (returns Buffer)
 */
export async function downloadFile(
  url: string,
  options: FetchOptions = {}
): Promise<Buffer> {
  const response = await fetchWithTimeout(url, {
    timeout: 60000, // 60 seconds for downloads
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Failed to download: HTTP ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
