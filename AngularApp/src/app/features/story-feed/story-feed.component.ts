import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { StoryCardComponent } from './story-card/story-card.component';
import { SearchComponent } from '../search/search.component';
import { StoryActions } from '../../core/store';
import { StoryType } from '../../core/models/story.model';
import {
  selectFilteredAndSortedStories,
  selectHasMore,
  selectStoriesLoadingStatus,
  selectStoryType
} from '../../core/store/story.selectors';

@Component({
  selector: 'app-story-feed',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    StoryCardComponent,
    SearchComponent
  ],
  templateUrl: './story-feed.component.html',
  styleUrls: ['./story-feed.component.scss']
})
export class StoryFeedComponent implements OnInit {
  private store = inject(Store);
  private destroyRef = inject(DestroyRef);

  stories = this.store.selectSignal(selectFilteredAndSortedStories);
  loadingStatus = this.store.selectSignal(selectStoriesLoadingStatus);
  currentStoryType = this.store.selectSignal(selectStoryType);
  hasMoreStories = this.store.selectSignal(selectHasMore);

  readonly storyTypes: { value: StoryType; label: string }[] = [
    { value: 'top', label: 'Top' },
    { value: 'new', label: 'New' },
    { value: 'best', label: 'Best' },
    { value: 'ask', label: 'Ask' },
    { value: 'show', label: 'Show' }
  ];

  ngOnInit() {
    // Initial load
    this.store.dispatch(StoryActions.loadStories({ storyType: 'top' }));

    // Handle loading errors
    this.store.select(selectStoriesLoadingStatus)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ error }) => {
        if (error) {
          console.error('Error loading stories:', error);
        }
      });
  }

  onStoryTypeChange(type: StoryType) {
    this.store.dispatch(StoryActions.loadStories({ storyType: type }));
  }

  onSearch(query: string) {
    this.store.dispatch(StoryActions.setSearchFilters({ 
      filters: { 
        searchQuery: query,
        storyType: this.currentStoryType(),
        sortBy: 'date'
      } 
    }));
  }

  loadMore() {
    if (this.hasMoreStories() && !this.loadingStatus().loading) {
      this.store.dispatch(StoryActions.loadMoreStories());
    }
  }
}