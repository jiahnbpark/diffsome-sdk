/**
 * Board Resource for Promptly SDK
 */

import type { HttpClient } from '../http';
import type { ListResponse } from '../types';
import type {
  Board,
  BoardPost,
  BoardComment,
  BoardListParams,
  PostListParams,
  CreatePostData,
  UpdatePostData,
  CreateCommentData,
  UpdateCommentData,
} from '../types';

export class BoardsResource {
  constructor(private http: HttpClient) {}

  // ============================================
  // Boards (Public)
  // ============================================

  /**
   * List all boards
   * @returns ListResponse with data array (always defined) and pagination meta
   */
  async list(params?: BoardListParams): Promise<ListResponse<Board>> {
    return this.http.getList<Board>('/public/boards', params);
  }

  /**
   * Get board by ID or slug
   */
  async get(idOrSlug: number | string): Promise<Board> {
    return this.http.get<Board>(`/public/boards/${idOrSlug}`);
  }

  // ============================================
  // Posts (Public)
  // ============================================

  /**
   * List posts in a board
   * @returns ListResponse with data array and pagination meta
   */
  async listPosts(boardIdOrSlug: number | string, params?: PostListParams): Promise<ListResponse<BoardPost>> {
    return this.http.getList<BoardPost>(`/public/boards/${boardIdOrSlug}/posts`, params);
  }

  /**
   * Get post by ID
   */
  async getPost(postId: number): Promise<BoardPost> {
    return this.http.get<BoardPost>(`/public/posts/${postId}`);
  }

  // ============================================
  // Posts (Protected - requires auth)
  // ============================================

  /**
   * Create new post
   */
  async createPost(data: CreatePostData): Promise<BoardPost> {
    return this.http.post<BoardPost>('/posts', data);
  }

  /**
   * Update post
   */
  async updatePost(postId: number, data: UpdatePostData): Promise<BoardPost> {
    return this.http.put<BoardPost>(`/posts/${postId}`, data);
  }

  /**
   * Delete post
   */
  async deletePost(postId: number): Promise<void> {
    return this.http.delete(`/posts/${postId}`);
  }

  // ============================================
  // Comments
  // ============================================

  /**
   * List comments for a post
   * @returns Array of comments (always an array, never null/undefined)
   */
  async listComments(postId: number): Promise<BoardComment[]> {
    const response = await this.http.getList<BoardComment>(`/public/posts/${postId}/comments`);
    return response.data;
  }

  /**
   * Create comment on a post
   */
  async createComment(postId: number, data: CreateCommentData): Promise<BoardComment> {
    return this.http.post<BoardComment>(`/posts/${postId}/comments`, data);
  }

  /**
   * Update comment
   */
  async updateComment(commentId: number, data: UpdateCommentData): Promise<BoardComment> {
    return this.http.put<BoardComment>(`/comments/${commentId}`, data);
  }

  /**
   * Delete comment
   */
  async deleteComment(commentId: number): Promise<void> {
    return this.http.delete(`/comments/${commentId}`);
  }
}
