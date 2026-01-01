/**
 * Board types for Promptly SDK
 */

import type { Media, ListParams } from './common';
import type { Member } from './auth';

export interface Board {
  id: number;
  slug: string;
  name: string;
  description?: string;
  settings: BoardSettings;
  posts_count?: number;
  created_at: string;
  updated_at: string;
}

export interface BoardSettings {
  allow_comments: boolean;
  allow_attachments: boolean;
  require_login_to_view: boolean;
  require_login_to_write: boolean;
  posts_per_page: number;
}

export interface BoardPost {
  id: number;
  board_id: number;
  board?: Board;
  member_id?: number;
  member?: Member;
  title: string;
  content: string;
  excerpt?: string;
  is_notice: boolean;
  is_private: boolean;
  view_count: number;
  comment_count: number;
  attachments?: Media[];
  created_at: string;
  updated_at: string;
}

export interface BoardComment {
  id: number;
  post_id: number;
  member_id?: number;
  member?: Member;
  parent_id?: number;
  content: string;
  replies?: BoardComment[];
  created_at: string;
  updated_at: string;
}

export interface BoardListParams extends ListParams {
  // No additional params for board list
}

export interface PostListParams extends ListParams {
  search?: string;
  is_notice?: boolean;
}

export interface CreatePostData {
  board_id: number;
  title: string;
  content: string;
  is_notice?: boolean;
  is_private?: boolean;
  attachments?: number[];
}

export interface UpdatePostData {
  title?: string;
  content?: string;
  is_notice?: boolean;
  is_private?: boolean;
  attachments?: number[];
}

export interface CreateCommentData {
  content: string;
  parent_id?: number;
}

export interface UpdateCommentData {
  content: string;
}
