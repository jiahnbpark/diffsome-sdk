/**
 * Blog Resource for Promptly SDK
 */

import type { HttpClient } from '../http';
import type { PaginatedResponse } from '../types';
import type { BlogPost, BlogListParams } from '../types';

export class BlogResource {
  constructor(private http: HttpClient) {}

  /**
   * List blog posts
   */
  async list(params?: BlogListParams): Promise<PaginatedResponse<BlogPost>> {
    return this.http.get<PaginatedResponse<BlogPost>>('/public/blog', params);
  }

  /**
   * Get blog post by slug
   */
  async get(slug: string): Promise<BlogPost> {
    return this.http.get<BlogPost>(`/public/blog/${slug}`);
  }

  /**
   * Get blog post by ID
   */
  async getById(id: number): Promise<BlogPost> {
    return this.http.get<BlogPost>(`/public/blog/id/${id}`);
  }

  /**
   * Get featured blog posts
   */
  async featured(limit: number = 5): Promise<BlogPost[]> {
    const response = await this.http.get<PaginatedResponse<BlogPost>>('/public/blog', {
      per_page: limit,
      featured: true,
    });
    return response.data;
  }

  /**
   * Get blog posts by category
   */
  async byCategory(category: string, params?: Omit<BlogListParams, 'category'>): Promise<PaginatedResponse<BlogPost>> {
    return this.http.get<PaginatedResponse<BlogPost>>('/public/blog', {
      ...params,
      category,
    });
  }

  /**
   * Get blog posts by tag
   */
  async byTag(tag: string, params?: Omit<BlogListParams, 'tag'>): Promise<PaginatedResponse<BlogPost>> {
    return this.http.get<PaginatedResponse<BlogPost>>('/public/blog', {
      ...params,
      tag,
    });
  }

  /**
   * Search blog posts
   */
  async search(query: string, params?: Omit<BlogListParams, 'search'>): Promise<PaginatedResponse<BlogPost>> {
    return this.http.get<PaginatedResponse<BlogPost>>('/public/blog', {
      ...params,
      search: query,
    });
  }

  /**
   * Get blog categories
   */
  async categories(): Promise<string[]> {
    return this.http.get<string[]>('/public/blog/categories');
  }

  /**
   * Get blog tags
   */
  async tags(): Promise<string[]> {
    return this.http.get<string[]>('/public/blog/tags');
  }
}
