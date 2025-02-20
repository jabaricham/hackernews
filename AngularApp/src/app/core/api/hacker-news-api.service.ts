import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, catchError } from 'rxjs';
import { Story, StoryType, StoryWithMetadata } from '../models/story.model';

@Injectable({
  providedIn: 'root'
})
export class HackerNewsApiService {
  private readonly baseUrl = 'http://localhost:5019/hackernews';
  private readonly pageSize = 20;

  /**
   * @constructor
   * @param http The `HttpClient` instance used to make API requests.
   */
  constructor(private http: HttpClient) {}

  getStories(type: StoryType, lastId?: number): Observable<StoryWithMetadata[]> {
    const endpoint = this.getEndpointForType(type);
    const url = lastId 
      ? `${this.baseUrl}/${endpoint}?lastId=${lastId}&pageSize=${this.pageSize}`
      : `${this.baseUrl}/${endpoint}?pageSize=${this.pageSize}`;
      
    return this.http.get<Story[]>(url).pipe(
      map(stories => stories.map(story => this.enrichStoryMetadata(story))),
      catchError(error => {
        console.error('Error fetching stories:', error);
        throw error;
      })
    );
  }

  getStoryById(id: number): Observable<StoryWithMetadata> {
    return this.http.get<Story>(`${this.baseUrl}/story/${id}`).pipe(
      map(story => this.enrichStoryMetadata(story)),
      catchError(error => {
        console.error(`Error fetching story ${id}:`, error);
        throw error;
      })
    );
  }

  private enrichStoryMetadata(story: Story): StoryWithMetadata {
    return {
      ...story,
      domain: this.extractDomain(story.url),
      timeAgo: this.getTimeAgo(story.time),
      commentCount: story.descendants || 0
    };
  }

  private getEndpointForType(type: StoryType): string {
    switch (type) {
      case 'top':
        return 'topstories';
      case 'new':
        return 'newstories';
      case 'best':
        return 'beststories';
      case 'ask':
        return 'askstories';
      case 'show':
        return 'showstories';
      default:
        return 'topstories';
    }
  }

  private extractDomain(url?: string): string | undefined {
    if (!url) return undefined;
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain;
    } catch {
      return undefined;
    }
  }

  private getTimeAgo(timestamp: number): string {
    const seconds = Math.floor((Date.now() / 1000) - timestamp);
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
      }
    }
    return 'just now';
  }
}
