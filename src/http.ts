/**
 * HTTP Client for Promptly SDK
 */

import type { PromptlyConfig, ApiError } from './types';

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: Record<string, any>;
  params?: Record<string, any>;
  headers?: Record<string, string>;
}

export class PromptlyError extends Error {
  public status: number;
  public errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'PromptlyError';
    this.status = status;
    this.errors = errors;
  }
}

export class HttpClient {
  private baseUrl: string;
  private tenantId: string;
  private timeout: number;
  private token: string | null = null;

  constructor(config: PromptlyConfig) {
    this.tenantId = config.tenantId;
    this.baseUrl = (config.baseUrl || 'https://promptly.webbyon.com').replace(/\/$/, '');
    this.timeout = config.timeout || 30000;
  }

  /**
   * Set authentication token
   */
  setToken(token: string | null): void {
    this.token = token;
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    return this.token !== null;
  }

  /**
   * Build full URL with query params
   */
  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(`${this.baseUrl}/api/${this.tenantId}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  /**
   * Build request headers
   */
  private buildHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...customHeaders,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Make HTTP request
   */
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, params, headers } = options;

    const url = this.buildUrl(endpoint, params);
    const requestHeaders = this.buildHeaders(headers);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw new PromptlyError(
          data.message || 'Request failed',
          response.status,
          data.errors
        );
      }

      // API returns { success: true, data: ... } format
      return data.data !== undefined ? data.data : data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof PromptlyError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new PromptlyError('Request timeout', 408);
        }
        throw new PromptlyError(error.message, 0);
      }

      throw new PromptlyError('Unknown error', 0);
    }
  }

  /**
   * GET request
   */
  get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  /**
   * POST request
   */
  post<T>(endpoint: string, body?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body });
  }

  /**
   * PUT request
   */
  put<T>(endpoint: string, body?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body });
  }

  /**
   * PATCH request
   */
  patch<T>(endpoint: string, body?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', body });
  }

  /**
   * DELETE request
   */
  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * Upload file
   */
  async upload<T>(endpoint: string, file: File | Blob, fieldName: string = 'file'): Promise<T> {
    const url = this.buildUrl(endpoint);
    const formData = new FormData();
    formData.append(fieldName, file);

    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw new PromptlyError(
          data.message || 'Upload failed',
          response.status,
          data.errors
        );
      }

      return data.data !== undefined ? data.data : data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof PromptlyError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new PromptlyError('Upload timeout', 408);
        }
        throw new PromptlyError(error.message, 0);
      }

      throw new PromptlyError('Unknown error', 0);
    }
  }
}
