/**
 * Blog types for Promptly SDK
 */

import type { Media, ListParams } from './common';

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  category?: string;
  tags?: string[];
  author_name?: string;
  is_published: boolean;
  published_at?: string;
  view_count: number;
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  updated_at: string;
}

export interface BlogListParams extends ListParams {
  category?: string;
  tag?: string;
  search?: string;
}
