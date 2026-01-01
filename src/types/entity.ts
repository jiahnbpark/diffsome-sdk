/**
 * Custom Entity types for Promptly SDK
 */

export interface EntityField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'email' | 'url' | 'date' | 'datetime' | 'boolean' | 'select' | 'multiselect';
  required?: boolean;
  searchable?: boolean;
  default?: any;
  options?: Array<{ value: string; label: string }>;
}

export interface EntitySchema {
  fields: EntityField[];
  display?: {
    title_field?: string;
    list_fields?: string;
  };
}

export interface CustomEntity {
  id: number;
  name: string;
  slug: string;
  description?: string;
  schema: EntitySchema;
  icon?: string;
  is_active: boolean;
  records_count?: number;
  created_at: string;
  updated_at: string;
}

export interface EntityRecord {
  id: number;
  entity_id: number;
  data: Record<string, any>;
  status: 'active' | 'archived' | 'draft';
  created_by?: number;
  updated_by?: number;
  created_at: string;
  updated_at: string;
}

export interface EntityListParams {
  page?: number;
  per_page?: number;
  status?: 'active' | 'archived' | 'draft';
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  [key: string]: any; // Allow filtering by any field in data
}

export interface CreateEntityRecordData {
  data: Record<string, any>;
  status?: 'active' | 'archived' | 'draft';
}

export interface UpdateEntityRecordData {
  data?: Record<string, any>;
  status?: 'active' | 'archived' | 'draft';
}
