import { EntityState } from '@ngrx/entity';

export interface Story {
  id: number;
  title: string;
  url: string;
  score: number;
  time: number;
  by: string;
  descendants: number; // number of comments
  type: 'story' | 'job' | 'poll' | 'comment';
  kids?: number[]; // comment IDs
}

export interface StoryWithMetadata extends Story {
  domain?: string; // extracted from URL
  timeAgo?: string; // formatted time
  commentCount: number;
}

export type StoryType = 'top' | 'new' | 'best' | 'ask' | 'show';

export interface StoriesState extends EntityState<StoryWithMetadata> {
  selectedId: number | null;
  loading: boolean;
  error: string | null;
  lastId: number | null;
  hasMore: boolean;
  storyType: StoryType;
  searchQuery: string;
  sortBy: 'date' | 'points' | 'comments';
}

export interface StorySearchFilters {
  storyType: StoryType;
  sortBy: 'date' | 'points' | 'comments';
  searchQuery: string;
}