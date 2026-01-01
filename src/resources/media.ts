/**
 * Media Resource for Promptly SDK
 */

import type { HttpClient } from '../http';
import type { PaginatedResponse, Media, ListParams } from '../types';

export interface MediaListParams extends ListParams {
  type?: string;
}

export class MediaResource {
  constructor(private http: HttpClient) {}

  /**
   * List my media files
   */
  async list(params?: MediaListParams): Promise<PaginatedResponse<Media>> {
    return this.http.get<PaginatedResponse<Media>>('/media', params);
  }

  /**
   * Get media by ID
   */
  async get(mediaId: number): Promise<Media> {
    return this.http.get<Media>(`/media/${mediaId}`);
  }

  /**
   * Upload file
   */
  async upload(file: File | Blob): Promise<Media> {
    return this.http.upload<Media>('/media', file, 'file');
  }

  /**
   * Upload multiple files
   */
  async uploadMultiple(files: (File | Blob)[]): Promise<Media[]> {
    const results: Media[] = [];
    for (const file of files) {
      const media = await this.upload(file);
      results.push(media);
    }
    return results;
  }

  /**
   * Delete media
   */
  async delete(mediaId: number): Promise<void> {
    return this.http.delete(`/media/${mediaId}`);
  }
}
