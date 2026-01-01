/**
 * Promptly SDK
 *
 * A TypeScript/JavaScript SDK for the Promptly AI CMS platform.
 *
 * @example
 * ```typescript
 * import { Promptly } from '@promptly/sdk';
 *
 * const client = new Promptly({
 *   tenantId: 'my-site',
 *   baseUrl: 'https://promptly.webbyon.com',
 * });
 *
 * // Public API
 * const posts = await client.blog.list();
 * const products = await client.shop.listProducts();
 *
 * // Authentication
 * await client.auth.login({ email: 'user@example.com', password: 'password' });
 *
 * // Protected API
 * const orders = await client.shop.listOrders();
 * ```
 */

import type { PromptlyConfig } from './types';
import { HttpClient, PromptlyError } from './http';
import {
  AuthResource,
  BoardsResource,
  BlogResource,
  FormsResource,
  ShopResource,
  MediaResource,
  EntitiesResource,
} from './resources';

export class Promptly {
  private http: HttpClient;

  /** Authentication & user management */
  public readonly auth: AuthResource;

  /** Board posts and comments */
  public readonly boards: BoardsResource;

  /** Blog posts */
  public readonly blog: BlogResource;

  /** Forms and submissions */
  public readonly forms: FormsResource;

  /** E-commerce: products, cart, orders, payments */
  public readonly shop: ShopResource;

  /** Media file management */
  public readonly media: MediaResource;

  /** Custom entities - dynamic data structures created by AI */
  public readonly entities: EntitiesResource;

  constructor(config: PromptlyConfig) {
    this.http = new HttpClient(config);

    // Initialize resources
    this.auth = new AuthResource(this.http);
    this.boards = new BoardsResource(this.http);
    this.blog = new BlogResource(this.http);
    this.forms = new FormsResource(this.http);
    this.shop = new ShopResource(this.http);
    this.media = new MediaResource(this.http);
    this.entities = new EntitiesResource(this.http);
  }

  /**
   * Get site theme settings
   */
  async getTheme(): Promise<{
    name: string;
    colors: Record<string, string>;
    fonts: Record<string, string>;
  }> {
    return this.http.get('/public/theme');
  }

  /**
   * Get site settings
   */
  async getSettings(): Promise<Record<string, any>> {
    return this.http.get('/public/settings');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.auth.isAuthenticated();
  }

  /**
   * Set authentication token manually
   */
  setToken(token: string | null): void {
    this.auth.setToken(token);
  }

  /**
   * Get current authentication token
   */
  getToken(): string | null {
    return this.auth.getToken();
  }
}

// Export types
export * from './types';

// Export utilities
export { PromptlyError } from './http';

// Default export
export default Promptly;
