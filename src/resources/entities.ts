/**
 * Custom Entities Resource for Promptly SDK
 *
 * Provides full CRUD for entity definitions and their records.
 * Entity definitions can be created/updated/deleted via API.
 */

import type { HttpClient } from '../http';
import type { ListResponse } from '../types';
import type {
  CustomEntity,
  EntityRecord,
  EntitySchema,
  EntityListParams,
  CreateEntityData,
  UpdateEntityData,
  CreateEntityRecordData,
  UpdateEntityRecordData,
} from '../types';

export class EntitiesResource {
  constructor(private http: HttpClient) {}

  // ============================================
  // Entity Definitions CRUD
  // ============================================

  /**
   * List all custom entities
   * @returns Array of entities
   *
   * @example
   * ```typescript
   * const entities = await client.entities.list();
   * // [{ id: 1, name: 'Customer', slug: 'customer', records_count: 150, ... }]
   * ```
   */
  async list(): Promise<CustomEntity[]> {
    const response = await this.http.getList<CustomEntity>('/entities');
    return response.data;
  }

  /**
   * Create a new entity definition
   *
   * @example
   * ```typescript
   * const entity = await client.entities.create({
   *   name: '고객',
   *   slug: 'customers',  // optional, auto-generated from name
   *   description: '고객 관리',
   *   schema: {
   *     fields: [
   *       { name: 'company', label: '회사명', type: 'text', required: true },
   *       { name: 'email', label: '이메일', type: 'email', required: true },
   *       { name: 'status', label: '상태', type: 'select', options: [
   *         { value: 'active', label: '활성' },
   *         { value: 'inactive', label: '비활성' }
   *       ]}
   *     ]
   *   },
   *   icon: 'users'
   * });
   * ```
   */
  async create(data: CreateEntityData): Promise<CustomEntity> {
    return this.http.post<CustomEntity>('/entities', data);
  }

  /**
   * Get entity definition by slug (includes schema)
   *
   * @example
   * ```typescript
   * const entity = await client.entities.get('customers');
   * console.log(entity.schema.fields);
   * ```
   */
  async get(slug: string): Promise<CustomEntity> {
    return this.http.get<CustomEntity>(`/entities/${slug}`);
  }

  /**
   * Update an entity definition
   *
   * @example
   * ```typescript
   * const updated = await client.entities.update('customers', {
   *   name: '고객사',
   *   description: '고객사 관리'
   * });
   * ```
   */
  async update(slug: string, data: UpdateEntityData): Promise<CustomEntity> {
    return this.http.put<CustomEntity>(`/entities/${slug}`, data);
  }

  /**
   * Delete an entity definition
   * If entity has records, use force=true to delete anyway
   *
   * @example
   * ```typescript
   * // Will fail if entity has records
   * await client.entities.delete('customers');
   *
   * // Force delete with all records
   * await client.entities.delete('customers', true);
   * ```
   */
  async delete(slug: string, force: boolean = false): Promise<void> {
    const params = force ? { force: 'true' } : undefined;
    return this.http.delete(`/entities/${slug}`, params);
  }

  /**
   * Get entity schema (convenience method)
   * @deprecated Use get(slug) instead - it includes schema
   */
  async getSchema(slug: string): Promise<EntitySchema> {
    const entity = await this.get(slug);
    return entity.schema;
  }

  // ============================================
  // Records CRUD
  // ============================================

  /**
   * List records for an entity
   * @returns ListResponse with data array and pagination meta
   *
   * @example
   * ```typescript
   * // Basic listing
   * const customers = await client.entities.listRecords('customers');
   *
   * // With pagination and search
   * const customers = await client.entities.listRecords('customers', {
   *   page: 1,
   *   per_page: 20,
   *   search: 'ACME',
   *   sort: 'company',
   *   dir: 'asc'
   * });
   *
   * // With filtering
   * const vipCustomers = await client.entities.listRecords('customers', {
   *   filters: JSON.stringify({ tier: 'vip' })
   * });
   * ```
   */
  async listRecords(slug: string, params?: EntityListParams): Promise<ListResponse<EntityRecord>> {
    return this.http.getList<EntityRecord>(`/entities/${slug}/records`, params);
  }

  /**
   * Get a single record by ID
   *
   * @example
   * ```typescript
   * const customer = await client.entities.getRecord('customers', 1);
   * console.log(customer.data.company); // 'ABC Corp'
   * ```
   */
  async getRecord(slug: string, id: number): Promise<EntityRecord> {
    return this.http.get<EntityRecord>(`/entities/${slug}/records/${id}`);
  }

  /**
   * Create a new record
   * Request body fields are defined by entity schema
   *
   * @example
   * ```typescript
   * const newCustomer = await client.entities.createRecord('customers', {
   *   company: 'ABC Corp',
   *   email: 'contact@abc.com',
   *   tier: 'standard',
   * });
   * ```
   */
  async createRecord(slug: string, data: Record<string, any>): Promise<EntityRecord> {
    return this.http.post<EntityRecord>(`/entities/${slug}/records`, data);
  }

  /**
   * Update a record
   * Only provided fields will be updated, existing data is preserved
   *
   * @example
   * ```typescript
   * const updated = await client.entities.updateRecord('customers', 1, {
   *   tier: 'vip',
   *   email: 'new@abc.com'
   * });
   * ```
   */
  async updateRecord(slug: string, id: number, data: Record<string, any>): Promise<EntityRecord> {
    return this.http.put<EntityRecord>(`/entities/${slug}/records/${id}`, data);
  }

  /**
   * Delete a record
   *
   * @example
   * ```typescript
   * await client.entities.deleteRecord('customers', 1);
   * ```
   */
  async deleteRecord(slug: string, id: number): Promise<void> {
    return this.http.delete(`/entities/${slug}/records/${id}`);
  }

  // ============================================
  // Helper Methods
  // ============================================

  /**
   * Get a value from a record's data
   *
   * @example
   * ```typescript
   * const record = await client.entities.getRecord('customers', 1);
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
   * const customers = client.entities.typed<Customer>('customers');
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
      create: async (data: T) => {
        const record = await this.createRecord(slug, data);
        return record as Omit<EntityRecord, 'data'> & { data: T };
      },
      update: async (id: number, data: Partial<T>) => {
        const record = await this.updateRecord(slug, id, data);
        return record as Omit<EntityRecord, 'data'> & { data: T };
      },
      delete: (id: number) => this.deleteRecord(slug, id),
    };
  }
}
