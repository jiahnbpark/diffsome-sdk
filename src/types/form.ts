/**
 * Form types for Promptly SDK
 */

import type { ListParams } from './common';

export interface Form {
  id: number;
  slug: string;
  name: string;
  description?: string;
  fields: FormField[];
  settings: FormSettings;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FormField {
  id: string;
  type: FormFieldType;
  name: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: FormFieldOption[];
  validation?: FormFieldValidation;
}

export type FormFieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'number'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'date'
  | 'time'
  | 'file';

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormFieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  message?: string;
}

export interface FormSettings {
  submit_button_text: string;
  success_message: string;
  redirect_url?: string;
  notify_email?: string;
}

export interface FormSubmission {
  id: number;
  form_id: number;
  form?: Form;
  member_id?: number;
  data: Record<string, any>;
  status: 'pending' | 'reviewed' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface SubmitFormData {
  [key: string]: any;
}

export interface FormListParams extends ListParams {
  // No additional params
}

export interface SubmissionListParams extends ListParams {
  form_id?: number;
  status?: string;
}
