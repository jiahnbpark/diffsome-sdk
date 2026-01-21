import { HttpClient } from '../http';
import type {
  Comment,
  ListResponse,
  CreateCommentData,
  UpdateCommentData,
  ListParams,
} from '../types';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface CommentDeleteData {
  password?: string;
}

export type CommentListResponse = ListResponse<Comment>;
export type CommentListParams = ListParams;
export type CommentCreateData = CreateCommentData;
export type CommentUpdateData = UpdateCommentData;

export class CommentsResource {
  constructor(private http: HttpClient) {}

  /**
   * Get comments for a board post
   */
  async boardPost(postId: number, params?: CommentListParams): Promise<CommentListResponse> {
    return this.http.get<CommentListResponse>(`/posts/${postId}/comments`, params);
  }

  /**
   * Create a comment on a board post
   */
  async createBoardPost(postId: number, data: CommentCreateData): Promise<ApiResponse<Comment>> {
    return this.http.post<ApiResponse<Comment>>(`/posts/${postId}/comments`, data);
  }

  /**
   * Get comments for a blog post
   */
  async blogPost(slug: string, params?: CommentListParams): Promise<CommentListResponse> {
    return this.http.get<CommentListResponse>(`/blog/${slug}/comments`, params);
  }

  /**
   * Create a comment on a blog post
   */
  async createBlogPost(slug: string, data: CommentCreateData): Promise<ApiResponse<Comment>> {
    return this.http.post<ApiResponse<Comment>>(`/blog/${slug}/comments`, data);
  }

  /**
   * Get standalone comments (guestbook, feedback, etc.)
   */
  async standalone(pageSlug: string, params?: CommentListParams): Promise<CommentListResponse> {
    return this.http.get<CommentListResponse>(`/comments/${pageSlug}`, params);
  }

  /**
   * Create a standalone comment
   */
  async createStandalone(pageSlug: string, data: CommentCreateData): Promise<ApiResponse<Comment>> {
    return this.http.post<ApiResponse<Comment>>(`/comments/${pageSlug}`, data);
  }

  /**
   * Update a comment
   */
  async update(commentId: number, data: CommentUpdateData): Promise<ApiResponse<Comment>> {
    return this.http.put<ApiResponse<Comment>>(`/comments/${commentId}`, data);
  }

  /**
   * Delete a comment
   */
  async delete(commentId: number, data?: CommentDeleteData): Promise<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`/comments/${commentId}`, data);
  }

  /**
   * Like a comment
   */
  async like(commentId: number): Promise<ApiResponse<{ likes: number }>> {
    return this.http.post<ApiResponse<{ likes: number }>>(`/comments/${commentId}/like`);
  }
}
