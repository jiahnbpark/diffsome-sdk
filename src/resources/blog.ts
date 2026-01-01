/**
 * Blog Resource for Promptly SDK
 */

import type { HttpClient } from '../http';
import type { ListResponse } from '../types';
import type { BlogPost, BlogListParams } from '../types';

export class BlogResource {
  constructor(private http: HttpClient) {}

  /**
   * List blog posts
   * @returns ListResponse with data array (always defined) and pagination meta
   */
  async list(params?: BlogListParams): Promise<ListResponse<BlogPost>> {
    return this.http.getList<BlogPost>('/public/blog', params);
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
   * @returns Array of featured posts (always an array, never null/undefined)
   */
  async featured(limit: number = 5): Promise<BlogPost[]> {
    const response = await this.http.getList<BlogPost>('/public/blog', {
      per_page: limit,
      featured: true,
    });
    return response.data;
  }

  /**
   * Get blog posts by category
   * @returns ListResponse with data array and pagination meta
   */
  async byCategory(category: string, params?: Omit<BlogListParams, 'category'>): Promise<ListResponse<BlogPost>> {
    return this.http.getList<BlogPost>('/public/blog', {
      ...params,
      category,
    });
  }

  /**
   * Get blog posts by tag
   * @returns ListResponse with data array and pagination meta
   */
  async byTag(tag: string, params?: Omit<BlogListParams, 'tag'>): Promise<ListResponse<BlogPost>> {
    return this.http.getList<BlogPost>('/public/blog', {
      ...params,
      tag,
    });
  }

  /**
   * Search blog posts
   * @returns ListResponse with data array and pagination meta
   */
  async search(query: string, params?: Omit<BlogListParams, 'search'>): Promise<ListResponse<BlogPost>> {
    return this.http.getList<BlogPost>('/public/blog', {
      ...params,
      search: query,
    });
  }

  /**
   * Get blog categories
   * @returns Array of category names (always an array)
   */
  async categories(): Promise<string[]> {
    const response = await this.http.get<string[] | { data: string[] }>('/public/blog/categories');
    return Array.isArray(response) ? response : (response?.data ?? []);
  }

  /**
   * Get blog tags
   * @returns Array of tag names (always an array)
   */
  async tags(): Promise<string[]> {
    const response = await this.http.get<string[] | { data: string[] }>('/public/blog/tags');
    return Array.isArray(response) ? response : (response?.data ?? []);
  }
}
