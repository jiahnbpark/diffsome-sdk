/**
 * Diffsome SDK
 *
 * A TypeScript/JavaScript SDK for the Diffsome platform.
 * Different + Awesome = Diffsome
 * API Key is required for all API requests.
 *
 * @example
 * ```typescript
 * import { Diffsome } from '@diffsome/sdk';
 *
 * const client = new Diffsome({
 *   tenantId: 'my-site',
 *   apiKey: 'pky_your_api_key_here',  // Required
 * });
 *
 * // All APIs require API key
 * const posts = await client.blog.list();
 * const products = await client.shop.listProducts();
 * ```
 */

import type { DiffsomeConfig } from './types';
import { HttpClient, DiffsomeError } from './http';
import {
  AuthResource,
  BoardsResource,
  BlogResource,
  CommentsResource,
  FormsResource,
  ShopResource,
  MediaResource,
  EntitiesResource,
  ReservationResource,
} from './resources';

export class Diffsome {
  private http: HttpClient;

  /** Authentication & user management */
  public readonly auth: AuthResource;

  /** Board posts */
  public readonly boards: BoardsResource;

  /** Blog posts */
  public readonly blog: BlogResource;

  /** Comments for boards, blogs, and standalone pages */
  public readonly comments: CommentsResource;

  /** Forms and submissions */
  public readonly forms: FormsResource;

  /** E-commerce: products, cart, orders, payments */
  public readonly shop: ShopResource;

  /** Media file management */
  public readonly media: MediaResource;

  /** Custom entities - dynamic data structures created by AI */
  public readonly entities: EntitiesResource;

  /** Reservations - booking services and time slots */
  public readonly reservation: ReservationResource;

  constructor(config: DiffsomeConfig) {
    if (!config.apiKey) {
      throw new Error('API key is required. Get your API key from Dashboard > Settings > API Tokens');
    }

    this.http = new HttpClient(config);

    // Initialize resources
    this.auth = new AuthResource(this.http);
    this.boards = new BoardsResource(this.http);
    this.blog = new BlogResource(this.http);
    this.comments = new CommentsResource(this.http);
    this.forms = new FormsResource(this.http);
    this.shop = new ShopResource(this.http);
    this.media = new MediaResource(this.http);
    this.entities = new EntitiesResource(this.http);
    this.reservation = new ReservationResource(this.http);
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

  /**
   * Set API key for server-to-server authentication
   * Alternative to user token authentication
   *
   * @example
   * ```typescript
   * const client = new Diffsome({
   *   tenantId: 'my-site',
   *   apiKey: 'pky_your_api_key_here',
   * });
   *
   * // Or set later
   * client.setApiKey('pky_your_api_key_here');
   * ```
   */
  setApiKey(apiKey: string | null): void {
    this.http.setApiKey(apiKey);
  }

  /**
   * Get current API key
   */
  getApiKey(): string | null {
    return this.http.getApiKey();
  }
}

// Export types
export * from './types';

// Export utilities
export { DiffsomeError } from './http';

// Backward compatibility aliases
export { Diffsome as Promptly };
export { DiffsomeError as PromptlyError };

// Default export
export default Diffsome;
