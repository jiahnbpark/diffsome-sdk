/**
 * Common types for Promptly SDK
 */

export interface PromptlyConfig {
  /** Tenant ID (subdomain) */
  tenantId: string;
  /** Base URL of Promptly API */
  baseUrl?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

/**
 * Unified list response - ALWAYS returns this structure for list APIs
 * - data is ALWAYS an array (never null/undefined)
 * - meta contains pagination info
 */
export interface ListResponse<T> {
  /** Array of items - guaranteed to be an array (empty if no data) */
  data: T[];
  /** Pagination metadata */
  meta: PaginationMeta;
}

/**
 * @deprecated Use ListResponse<T> instead. Kept for backward compatibility.
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  links?: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

export interface ListParams {
  page?: number;
  per_page?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

export interface Media {
  id: number;
  url: string;
  thumbnail_url?: string;
  filename: string;
  mime_type: string;
  size: number;
  created_at: string;
}
