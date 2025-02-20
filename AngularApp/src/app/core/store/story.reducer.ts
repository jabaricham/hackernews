import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { StoryWithMetadata, StoriesState, StoryType } from '../models/story.model';
import { StoryActions } from './story.actions';

// Create entity adapter
export const storyAdapter: EntityAdapter<StoryWithMetadata> = createEntityAdapter<StoryWithMetadata>({
  selectId: (story: StoryWithMetadata) => story.id,
  sortComparer: (a, b) => b.time - a.time // Default sort by time
});

// Define initial state
export const initialState: StoriesState = storyAdapter.getInitialState({
  selectedId: null,
  loading: false,
  error: null,
  lastId: null,
  storyType: 'top' as StoryType,
  searchQuery: '',
  sortBy: 'date',
  hasMore: true
});

// Create reducer
export const storyReducer = createReducer(
  initialState,

  // Load stories
  on(StoryActions.loadStories, (state, { storyType }) => ({
    ...state,
    loading: true,
    error: null,
    storyType,
    lastId: null,
    hasMore: true
  })),

  on(StoryActions.loadStoriesSuccess, (state, { stories }) => 
    storyAdapter.setAll(stories, {
      ...state,
      loading: false,
      lastId: stories.length > 0 ? Math.max(...stories.map(s => s.id)) : null,
      hasMore: stories.length >= 20
    })
  ),

  on(StoryActions.loadStoriesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
    hasMore: false
  })),

  // Load more stories
  on(StoryActions.loadMoreStories, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(StoryActions.loadMoreStoriesSuccess, (state, { stories }) =>
    storyAdapter.addMany(stories, {
      ...state,
      loading: false,
      lastId: stories.length > 0 ? Math.max(...stories.map(s => s.id)) : state.lastId,
      hasMore: stories.length >= 20
    })
  ),

  on(StoryActions.loadMoreStoriesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
    hasMore: false
  })),

  // Search and filters
  on(StoryActions.setSearchFilters, (state, { filters }) => ({
    ...state,
    ...filters,
    lastId: null,
    hasMore: true
  })),

  on(StoryActions.clearSearchFilters, (state) => ({
    ...state,
    searchQuery: '',
    storyType: 'top' as StoryType,
    sortBy: 'date' as 'date' | 'points' | 'comments',
    lastId: null,
    hasMore: true
  })),

  // Story selection
  on(StoryActions.selectStory, (state, { id }) => ({
    ...state,
    selectedId: id
  })),

  on(StoryActions.clearSelectedStory, (state) => ({
    ...state,
    selectedId: null
  })),

  // Update story metadata
  on(StoryActions.updateStoryMetadata, (state, { id, changes }) =>
    storyAdapter.updateOne(
      { id, changes },
      state
    )
  ),

  // Load story details
  on(StoryActions.loadStoryDetails, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(StoryActions.loadStoryDetailsSuccess, (state, { story }) => 
    storyAdapter.upsertOne(story, {
      ...state,
      loading: false,
      selectedId: story.id
    })
  ),

  on(StoryActions.loadStoryDetailsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
);

// Export entity adapter selectors
export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = storyAdapter.getSelectors();