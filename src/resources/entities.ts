/**
 * Custom Entities Resource for Promptly SDK
 *
 * Provides access to dynamically created data structures.
 * AI can create custom entities through MCP, and this SDK allows
 * frontend applications to interact with them.
 */

import type { HttpClient } from '../http';
import type { ListResponse } from '../types';
import type {
  CustomEntity,
  EntityRecord,
  EntitySchema,
  EntityListParams,
  CreateEntityRecordData,
  UpdateEntityRecordData,
} from '../types';

export class EntitiesResource {
  constructor(private http: HttpClient) {}

  // ============================================
  // Entities (Public)
  // ============================================

  /**
   * List all active custom entities
   * @returns Array of entities (always an array)
   *
   * @example
   * ```typescript
   * const entities = await client.entities.list();
   * // [{ id: 1, name: 'Customer', slug: 'customer', ... }]
   * ```
   */
  async list(): Promise<CustomEntity[]> {
    const response = await this.http.getList<CustomEntity>('/public/entities');
    return response.data;
  }

  /**
   * Get entity schema by slug
   *
   * @example
   * ```typescript
   * const schema = await client.entities.getSchema('customer');
   * // { fields: [{ name: 'company', label: '회사명', type: 'text', ... }] }
   * ```
   */
  async getSchema(slug: string): Promise<EntitySchema> {
    return this.http.get<EntitySchema>(`/public/entities/${slug}/schema`);
  }

  // ============================================
  // Records (Public Read)
  // ============================================

  /**
   * List records for an entity
   * @returns ListResponse with data array and pagination meta
   *
   * @example
   * ```typescript
   * // Basic listing
   * const customers = await client.entities.listRecords('customer');
   *
   * // With pagination
   * const customers = await client.entities.listRecords('customer', {
   *   page: 1,
   *   per_page: 20,
   *   status: 'active',
   * });
   *
   * // With filtering by data fields
   * const vipCustomers = await client.entities.listRecords('customer', {
   *   'data.tier': 'vip',
   * });
   * ```
   */
  async listRecords(slug: string, params?: EntityListParams): Promise<ListResponse<EntityRecord>> {
    return this.http.getList<EntityRecord>(`/public/entities/${slug}`, params);
  }

  /**
   * Get a single record by ID
   *
   * @example
   * ```typescript
   * const customer = await client.entities.getRecord('customer', 1);
   * console.log(customer.data.company); // 'ABC Corp'
   * ```
   */
  async getRecord(slug: string, id: number): Promise<EntityRecord> {
    return this.http.get<EntityRecord>(`/public/entities/${slug}/${id}`);
  }

  // ============================================
  // Records (Protected - requires auth)
  // ============================================

  /**
   * Create a new record
   *
   * @example
   * ```typescript
   * const newCustomer = await client.entities.createRecord('customer', {
   *   data: {
   *     company: 'ABC Corp',
   *     email: 'contact@abc.com',
   *     tier: 'standard',
   *   },
   *   status: 'active',
   * });
   * ```
   */
  async createRecord(slug: string, data: CreateEntityRecordData): Promise<EntityRecord> {
    return this.http.post<EntityRecord>(`/entities/${slug}`, data);
  }

  /**
   * Update a record
   *
   * @example
   * ```typescript
   * const updated = await client.entities.updateRecord('customer', 1, {
   *   data: {
   *     tier: 'vip',
   *   },
   * });
   * ```
   */
  async updateRecord(slug: string, id: number, data: UpdateEntityRecordData): Promise<EntityRecord> {
    return this.http.put<EntityRecord>(`/entities/${slug}/${id}`, data);
  }

  /**
   * Delete a record
   *
   * @example
   * ```typescript
   * await client.entities.deleteRecord('customer', 1);
   * ```
   */
  async deleteRecord(slug: string, id: number): Promise<void> {
    return this.http.delete(`/entities/${slug}/${id}`);
  }

  // ============================================
  // Helper Methods
  // ============================================

  /**
   * Get a value from a record's data
   *
   * @example
   * ```typescript
   * const record = await client.entities.getRecord('customer', 1);
   * const company = client.entities.getValue(record, 'company');
   * ```
   */
  getValue(record: EntityRecord, field: string): any {
    return record.data?.[field];
  }

  /**
   * Create a typed accessor for an entity
   *
   * @example
   * ```typescript
   * interface Customer {
   *   company: string;
   *   email: string;
   *   tier: 'standard' | 'vip';
   * }
   *
   * const customers = client.entities.typed<Customer>('customer');
   * const list = await customers.list(); // Typed records
   * const record = await customers.get(1);
   * console.log(record.data.company); // TypeScript knows this is string
   * ```
   */
  typed<T extends Record<string, any>>(slug: string) {
    return {
      list: async (params?: EntityListParams) => {
        const response = await this.listRecords(slug, params);
        return {
          ...response,
          data: response.data as Array<Omit<EntityRecord, 'data'> & { data: T }>,
        };
      },
      get: async (id: number) => {
        const record = await this.getRecord(slug, id);
        return record as Omit<EntityRecord, 'data'> & { data: T };
      },
      create: async (data: T, status?: EntityRecord['status']) => {
        const record = await this.createRecord(slug, { data, status });
        return record as Omit<EntityRecord, 'data'> & { data: T };
      },
      update: async (id: number, data: Partial<T>, status?: EntityRecord['status']) => {
        const record = await this.updateRecord(slug, id, { data, status });
        return record as Omit<EntityRecord, 'data'> & { data: T };
      },
      delete: (id: number) => this.deleteRecord(slug, id),
    };
  }
}
