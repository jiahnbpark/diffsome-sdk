/**
 * Form Resource for Promptly SDK
 */

import type { HttpClient } from '../http';
import type { ListResponse } from '../types';
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
   * @returns ListResponse with data array and pagination meta
   */
  async list(params?: FormListParams): Promise<ListResponse<Form>> {
    return this.http.getList<Form>('/forms', params);
  }

  /**
   * Get form by ID or slug
   */
  async get(idOrSlug: number | string): Promise<Form> {
    return this.http.get<Form>(`/forms/${idOrSlug}`);
  }

  /**
   * Submit form data
   */
  async submit(formIdOrSlug: number | string, data: SubmitFormData): Promise<FormSubmission> {
    return this.http.post<FormSubmission>(`/forms/${formIdOrSlug}/submit`, data);
  }

  // ============================================
  // Protected endpoints (requires auth)
  // ============================================

  /**
   * Get my form submissions
   * @returns ListResponse with data array and pagination meta
   */
  async mySubmissions(params?: SubmissionListParams): Promise<ListResponse<FormSubmission>> {
    return this.http.getList<FormSubmission>('/form-submissions', params);
  }

  /**
   * Get specific submission
   */
  async getSubmission(submissionId: number): Promise<FormSubmission> {
    return this.http.get<FormSubmission>(`/form-submissions/${submissionId}`);
  }
}
