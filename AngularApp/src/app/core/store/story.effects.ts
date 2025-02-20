import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';

import { HackerNewsApiService } from '../api/hacker-news-api.service';
import { StoryActions } from './story.actions';
import { StoriesState } from '../models/story.model';
import { selectStoryType, selectLastId } from './story.selectors';

@Injectable()
export class StoryEffects {
  private readonly actions$ = inject(Actions);
  private readonly store = inject(Store<StoriesState>);
  private readonly hackerNewsService = inject(HackerNewsApiService);

  readonly loadStories$ = createEffect(() => 
    this.actions$.pipe(
      ofType(StoryActions.loadStories),
      mergeMap(({ storyType }) => 
        this.hackerNewsService.getStories(storyType).pipe(
          map(stories => StoryActions.loadStoriesSuccess({ stories })),
          catchError(error => 
            of(StoryActions.loadStoriesFailure({ error: error.message }))
          )
        )
      )
    )
  );

  readonly loadMoreStories$ = createEffect(() => 
    this.actions$.pipe(
      ofType(StoryActions.loadMoreStories),
      withLatestFrom(
        this.store.select(selectStoryType),
        this.store.select(selectLastId)
      ),
      mergeMap(([_, storyType, lastId]) => 
        this.hackerNewsService
          .getStories(storyType, lastId || undefined)
          .pipe(
            map(stories => StoryActions.loadMoreStoriesSuccess({ stories })),
            catchError(error => 
              of(StoryActions.loadMoreStoriesFailure({ error: error.message }))
            )
          )
      )
    )
  );

  readonly loadStoryDetails$ = createEffect(() => 
    this.actions$.pipe(
      ofType(StoryActions.loadStoryDetails),
      mergeMap(({ id }) => 
        this.hackerNewsService.getStoryById(id).pipe(
          map(story => this.hackerNewsService['enrichStoryMetadata'](story)),
          map(story => StoryActions.loadStoryDetailsSuccess({ story })),
          catchError(error => 
            of(StoryActions.loadStoryDetailsFailure({ error: error.message }))
          )
        )
      )
    )
  );

  constructor() {}
}