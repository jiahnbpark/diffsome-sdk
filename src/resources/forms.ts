/**
 * Form Resource for Promptly SDK
 */

import type { HttpClient } from '../http';
import type { PaginatedResponse } from '../types';
import type {
  Form,
  FormSubmission,
  SubmitFormData,
  FormListParams,
  SubmissionListParams,
} from '../types';

export class FormsResource {
  constructor(private http: HttpClient) {}

  /**
   * List all forms
   */
  async list(params?: FormListParams): Promise<Form[]> {
    return this.http.get<Form[]>('/public/forms', params);
  }

  /**
   * Get form by ID or slug
   */
  async get(idOrSlug: number | string): Promise<Form> {
    return this.http.get<Form>(`/public/forms/${idOrSlug}`);
  }

  /**
   * Submit form data
   */
  async submit(formIdOrSlug: number | string, data: SubmitFormData): Promise<FormSubmission> {
    return this.http.post<FormSubmission>(`/public/forms/${formIdOrSlug}/submit`, data);
  }

  // ============================================
  // Protected endpoints (requires auth)
  // ============================================

  /**
   * Get my form submissions
   */
  async mySubmissions(params?: SubmissionListParams): Promise<PaginatedResponse<FormSubmission>> {
    return this.http.get<PaginatedResponse<FormSubmission>>('/form-submissions', params);
  }

  /**
   * Get specific submission
   */
  async getSubmission(submissionId: number): Promise<FormSubmission> {
    return this.http.get<FormSubmission>(`/form-submissions/${submissionId}`);
  }
}
