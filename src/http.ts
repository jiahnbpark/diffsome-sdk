/**
 * HTTP Client for Diffsome SDK
 */

import type { DiffsomeConfig, ApiError, ListResponse, PaginationMeta } from './types';

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: Record<string, any>;
  params?: Record<string, any>;
  headers?: Record<string, string>;
}

/**
 * Default pagination meta for empty/missing responses
 */
const DEFAULT_META: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
  from: null,
  to: null,
};

/**
 * Normalize any response to ListResponse format
 * Handles: [], { data: [] }, { data: [], meta: {} }, null, undefined
 */
function normalizeListResponse<T>(response: any): ListResponse<T> {
  // Handle null/undefined
  if (response == null) {
    return { data: [], meta: { ...DEFAULT_META } };
  }

  // Handle direct array response
  if (Array.isArray(response)) {
    return {
      data: response,
      meta: { ...DEFAULT_META, total: response.length, from: response.length > 0 ? 1 : null, to: response.length > 0 ? response.length : null },
    };
  }

  // Handle object response
  if (typeof response === 'object') {
    const data = Array.isArray(response.data) ? response.data : [];
    const meta: PaginationMeta = {
      current_page: response.meta?.current_page ?? response.current_page ?? 1,
      last_page: response.meta?.last_page ?? response.last_page ?? 1,
      per_page: response.meta?.per_page ?? response.per_page ?? 15,
      total: response.meta?.total ?? response.total ?? data.length,
      from: response.meta?.from ?? response.from ?? (data.length > 0 ? 1 : null),
      to: response.meta?.to ?? response.to ?? (data.length > 0 ? data.length : null),
    };
    return { data, meta };
  }

  // Fallback
  return { data: [], meta: { ...DEFAULT_META } };
}

export class DiffsomeError extends Error {
  public status: number;
  public errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'DiffsomeError';
    this.status = status;
    this.errors = errors;
  }
}

export class HttpClient {
  private baseUrl: string;
  private tenantId: string;
  private timeout: number;
  private token: string | null = null;
  private apiKey: string | null = null;
  private cartSessionId: string | null = null;

  // Token persistence options
  private persistToken: boolean = false;
  private storageType: 'localStorage' | 'sessionStorage' = 'localStorage';
  private storageKey: string;
  private onAuthStateChange?: (token: string | null, member?: any) => void;

  constructor(config: DiffsomeConfig) {
    this.tenantId = config.tenantId;
    this.baseUrl = (config.baseUrl || 'https://diffsome.com').replace(/\/$/, '');
    this.timeout = config.timeout || 30000;
    this.apiKey = config.apiKey || null;

    // Token persistence configuration
    this.persistToken = config.persistToken ?? false;
    this.storageType = config.storageType ?? 'localStorage';
    this.storageKey = config.storageKey ?? `diffsome_auth_token_${this.tenantId}`;
    this.onAuthStateChange = config.onAuthStateChange;

    // Load cart session from localStorage if available (browser only)
    if (typeof window !== 'undefined' && window.localStorage) {
      this.cartSessionId = localStorage.getItem(`diffsome_cart_session_${this.tenantId}`);
    }

    // Auto-restore token from storage if persistence is enabled
    if (this.persistToken && typeof window !== 'undefined') {
      const storage = this.getStorage();
      if (storage) {
        const savedToken = storage.getItem(this.storageKey);
        if (savedToken) {
          this.token = savedToken;
          // Notify about restored token (without member data - will be fetched separately)
          this.onAuthStateChange?.(savedToken, undefined);
        }
      }
    }

    // Apply initial token from config (overrides stored token)
    if (config.token) {
      this.token = config.token;
    }
  }

  /**
   * Get the storage object based on config
   */
  private getStorage(): Storage | null {
    if (typeof window === 'undefined') return null;
    return this.storageType === 'sessionStorage' ? window.sessionStorage : window.localStorage;
  }

  /**
   * Set authentication token
   * If persistToken is enabled, automatically saves/removes from storage
   * @param token - The auth token or null to clear
   * @param user - The logged-in user (Member) for the callback
   */
  setToken(token: string | null, user?: any): void {
    this.token = token;

    // Auto-persist to storage if enabled
    if (this.persistToken) {
      const storage = this.getStorage();
      if (storage) {
        if (token) {
          storage.setItem(this.storageKey, token);
        } else {
          storage.removeItem(this.storageKey);
        }
      }
    }

    // Notify about auth state change
    this.onAuthStateChange?.(token, user ?? null);
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
    return this.token !== null || this.apiKey !== null;
  }

  /**
   * Set API key for server-to-server authentication
   */
  setApiKey(apiKey: string | null): void {
    this.apiKey = apiKey;
  }

  /**
   * Get current API key
   */
  getApiKey(): string | null {
    return this.apiKey;
  }

  /**
   * Get the base URL with tenant path
   */
  getBaseUrl(): string {
    return `${this.baseUrl}/api/${this.tenantId}`;
  }

  /**
   * Get the download URL for a digital file
   * Includes auth_token query parameter for authentication
   */
  getDownloadUrl(token: string): string {
    const url = `${this.baseUrl}/download/${this.tenantId}/${token}`;
    // Include auth token if available
    if (this.token) {
      return `${url}?auth_token=${encodeURIComponent(this.token)}`;
    }
    return url;
  }

  /**
   * Set cart session ID (for guest cart persistence)
   */
  setCartSessionId(sessionId: string | null): void {
    this.cartSessionId = sessionId;
    // Persist to localStorage if available
    if (typeof window !== 'undefined' && window.localStorage) {
      if (sessionId) {
        localStorage.setItem(`diffsome_cart_session_${this.tenantId}`, sessionId);
      } else {
        localStorage.removeItem(`diffsome_cart_session_${this.tenantId}`);
      }
    }
  }

  /**
   * Get cart session ID
   */
  getCartSessionId(): string | null {
    return this.cartSessionId;
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
   * Both API key and bearer token can be sent together
   */
  private buildHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...customHeaders,
    };

    // API key for tenant authentication
    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    // Bearer token for member authentication
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // Cart session for guest cart persistence
    if (this.cartSessionId) {
      headers['X-Cart-Session'] = this.cartSessionId;
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
        throw new DiffsomeError(
          data.message || 'Request failed',
          response.status,
          data.errors
        );
      }

      // API returns { success: true, data: ... } format
      return data.data !== undefined ? data.data : data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof DiffsomeError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new DiffsomeError('Request timeout', 408);
        }
        throw new DiffsomeError(error.message, 0);
      }

      throw new DiffsomeError('Unknown error', 0);
    }
  }

  /**
   * GET request
   */
  get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  /**
   * GET request for list endpoints - ALWAYS returns normalized ListResponse
   * Guarantees: data is always an array, meta is always present
   */
  async getList<T>(endpoint: string, params?: Record<string, any>): Promise<ListResponse<T>> {
    const response = await this.request<any>(endpoint, { method: 'GET', params });
    return normalizeListResponse<T>(response);
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
  delete<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', params });
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

    // API key for tenant authentication
    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    // Bearer token for member authentication
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
        throw new DiffsomeError(
          data.message || 'Upload failed',
          response.status,
          data.errors
        );
      }

      return data.data !== undefined ? data.data : data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof DiffsomeError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new DiffsomeError('Upload timeout', 408);
        }
        throw new DiffsomeError(error.message, 0);
      }

      throw new DiffsomeError('Unknown error', 0);
    }
  }
}
