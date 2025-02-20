import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Story, StorySearchFilters, StoryType, StoryWithMetadata } from '../models/story.model';

export const StoryActions = createActionGroup({
  source: 'Stories',
  events: {
    // Load stories
    'Load Stories': props<{ storyType: StoryType }>(),
    'Load Stories Success': props<{ stories: StoryWithMetadata[] }>(),
    'Load Stories Failure': props<{ error: string }>(),

    // Load more stories (pagination)
    'Load More Stories': emptyProps(),
    'Load More Stories Success': props<{ stories: StoryWithMetadata[] }>(),
    'Load More Stories Failure': props<{ error: string }>(),

    // Search and filter
    'Set Search Filters': props<{ filters: StorySearchFilters }>(),
    'Clear Search Filters': emptyProps(),

    // Select story
    'Select Story': props<{ id: number }>(),
    'Clear Selected Story': emptyProps(),

    // Story details
    'Load Story Details': props<{ id: number }>(),
    'Load Story Details Success': props<{ story: StoryWithMetadata }>(),
    'Load Story Details Failure': props<{ error: string }>(),

    // Update story metadata
    'Update Story Metadata': props<{ id: number, changes: Partial<StoryWithMetadata> }>(),
  }
});