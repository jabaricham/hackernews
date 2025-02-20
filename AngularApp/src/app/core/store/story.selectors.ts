import { createFeatureSelector, createSelector } from '@ngrx/store';
import { StoriesState, StoryWithMetadata } from '../models/story.model';
import { selectAll } from './story.reducer';

// Feature selector
export const selectStoriesState = createFeatureSelector<StoriesState>('stories');

// Basic selectors
export const selectAllStories = createSelector(
  selectStoriesState,
  selectAll
);

export const selectStoryEntities = createSelector(
  selectStoriesState,
  state => state.entities
);

export const selectSelectedStoryId = createSelector(
  selectStoriesState,
  state => state.selectedId
);

export const selectLastId = createSelector(
  selectStoriesState,
  state => state.lastId
);

export const selectHasMore = createSelector(
  selectStoriesState,
  state => state.hasMore
);

export const selectLoading = createSelector(
  selectStoriesState,
  state => state.loading
);

export const selectError = createSelector(
  selectStoriesState,
  state => state.error
);

export const selectStoryType = createSelector(
  selectStoriesState,
  state => state.storyType
);

export const selectSearchQuery = createSelector(
  selectStoriesState,
  state => state.searchQuery
);

export const selectSortBy = createSelector(
  selectStoriesState,
  state => state.sortBy
);

// Derived selectors
export const selectSelectedStory = createSelector(
  selectStoryEntities,
  selectSelectedStoryId,
  (entities, selectedId) => selectedId ? entities[selectedId] : null
);

export const selectFilteredAndSortedStories = createSelector(
  selectAllStories,
  selectSearchQuery,
  selectSortBy,
  (stories, searchQuery, sortBy): StoryWithMetadata[] => {
    let filteredStories = stories;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredStories = stories.filter(story =>
        story.title.toLowerCase().includes(query) ||
        (story.domain || '').toLowerCase().includes(query)
      );
    }

    // Apply sorting
    return [...filteredStories].sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return b.time - a.time;
        case 'points':
          return b.score - a.score;
        case 'comments':
          return b.commentCount - a.commentCount;
        default:
          return 0;
      }
    });
  }
);

// Status selectors
export const selectStoriesLoadingStatus = createSelector(
  selectLoading,
  selectError,
  (loading, error) => ({
    loading,
    error
  })
);