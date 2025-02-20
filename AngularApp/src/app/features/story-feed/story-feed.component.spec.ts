import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideLocationMocks } from '@angular/common/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { StoryFeedComponent } from './story-feed.component';
import { StoryCardComponent } from './story-card/story-card.component';
import { SearchComponent } from '../search/search.component';
import { StoryActions } from '../../core/store';
import { StoryType, StoryWithMetadata } from '../../core/models/story.model';
import {
  selectFilteredAndSortedStories,
  selectHasMore,
  selectStoriesLoadingStatus,
  selectStoryType
} from '../../core/store/story.selectors';

describe('StoryFeedComponent', () => {
  let component: StoryFeedComponent;
  let harness: RouterTestingHarness;
  let store: MockStore;
  let dispatchSpy: jasmine.Spy;

  const mockStories: StoryWithMetadata[] = [
    { 
      id: 1, 
      title: 'Story 1', 
      time: 1234567890, 
      score: 100,
      url: 'https://example.com/story1',
      by: 'user1',
      descendants: 10,
      type: 'story' as const,
      commentCount: 10,
      domain: 'example.com',
      timeAgo: '2 hours ago'
    },
    { 
      id: 2, 
      title: 'Story 2', 
      time: 1234567891, 
      score: 200,
      url: 'https://example.com/story2',
      by: 'user2',
      descendants: 20,
      type: 'story' as const,
      commentCount: 20,
      domain: 'example.com',
      timeAgo: '1 hour ago'
    }
  ];

  const initialState = {
    stories: {
      ids: [],
      entities: {},
      selectedId: null,
      loading: false,
      error: null,
      lastId: null,
      storyType: 'top' as StoryType,
      searchQuery: '',
      sortBy: 'date',
      hasMore: true
    }
  };

  async function setup(path: string = '/') {
    await TestBed.configureTestingModule({
      imports: [
        StoryFeedComponent,
        StoryCardComponent,
        SearchComponent
      ],
      providers: [
        provideMockStore({ initialState }),
        provideRouter([
          { path: '', component: StoryFeedComponent },
          { path: 'item/:id', component: StoryFeedComponent }
        ]),
        provideLocationMocks()
      ]
    }).compileComponents();

    store = TestBed.inject(MockStore);
    dispatchSpy = spyOn(store, 'dispatch');
    harness = await RouterTestingHarness.create();
    
    const navigatedComponent = await harness.navigateByUrl<StoryFeedComponent>(path, StoryFeedComponent);
    if (!navigatedComponent) {
      throw new Error(`Failed to navigate to ${path}`);
    }
    component = navigatedComponent;
    harness.detectChanges();

    return {
      harness,
      store,
      component
    };
  }

  afterEach(() => {
    store.resetSelectors();
  });

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should initialize with top stories on load', async () => {
    await setup();
    expect(dispatchSpy).toHaveBeenCalledWith(
      StoryActions.loadStories({ storyType: 'top' })
    );
  });

  it('should change story type and load new stories', async () => {
    const { component } = await setup();
    const newStoryType: StoryType = 'new';

    component.onStoryTypeChange(newStoryType);

    expect(dispatchSpy).toHaveBeenCalledWith(
      StoryActions.loadStories({ storyType: newStoryType })
    );
  });

  it('should update search filters when search is performed', fakeAsync(async () => {
    const { component } = await setup();
    store.overrideSelector(selectStoryType, 'top');
    store.refreshState();
    harness.detectChanges();

    const searchQuery = 'test search';
    component.onSearch(searchQuery);
    tick();

    expect(dispatchSpy).toHaveBeenCalledWith(
      StoryActions.setSearchFilters({
        filters: {
          searchQuery,
          storyType: 'top',
          sortBy: 'date'
        }
      })
    );
  }));

  it('should load more stories when conditions are met', async () => {
    const { component } = await setup();
    store.overrideSelector(selectHasMore, true);
    store.overrideSelector(selectStoriesLoadingStatus, { loading: false, error: null });
    store.refreshState();
    harness.detectChanges();

    component.loadMore();

    expect(dispatchSpy).toHaveBeenCalledWith(
      StoryActions.loadMoreStories()
    );
  });

  it('should not load more stories when already loading', async () => {
    const { component } = await setup();
    dispatchSpy.calls.reset(); // Reset spy to ignore initial load
    
    store.overrideSelector(selectHasMore, true);
    store.overrideSelector(selectStoriesLoadingStatus, { loading: true, error: null });
    store.refreshState();
    harness.detectChanges();

    component.loadMore();

    expect(dispatchSpy).not.toHaveBeenCalledWith(
      StoryActions.loadMoreStories()
    );
  });

  it('should not load more stories when no more stories available', async () => {
    const { component } = await setup();
    dispatchSpy.calls.reset(); // Reset spy to ignore initial load
    
    store.overrideSelector(selectHasMore, false);
    store.overrideSelector(selectStoriesLoadingStatus, { loading: false, error: null });
    store.refreshState();
    harness.detectChanges();

    component.loadMore();

    expect(dispatchSpy).not.toHaveBeenCalledWith(
      StoryActions.loadMoreStories()
    );
  });

  it('should display loading state correctly', async () => {
    const { component } = await setup();
    store.overrideSelector(selectStoriesLoadingStatus, { loading: true, error: null });
    store.overrideSelector(selectFilteredAndSortedStories, []);
    store.refreshState();
    harness.detectChanges();

    const compiled = harness.routeNativeElement!;
    const spinner = compiled.querySelector('.loading-spinner');
    expect(spinner).toBeTruthy();
    expect(compiled.textContent).toContain('Loading stories...');
  });

  it('should handle and log errors when loading stories fails', fakeAsync(async () => {
    const { component } = await setup();
    const consoleSpy = spyOn(console, 'error');
    const error = 'Failed to load stories';
    
    store.overrideSelector(selectStoriesLoadingStatus, { loading: false, error });
    store.refreshState();
    harness.detectChanges();
    tick();

    expect(consoleSpy).toHaveBeenCalledWith('Error loading stories:', error);
  }));

  it('should display stories from store', async () => {
    const { component } = await setup();
    store.overrideSelector(selectFilteredAndSortedStories, mockStories);
    store.refreshState();
    harness.detectChanges();

    expect(component.stories()).toEqual(mockStories);

    const compiled = harness.routeNativeElement!;
    const storyCards = compiled.querySelectorAll('app-story-card');
    expect(storyCards.length).toBe(mockStories.length);
  });

  it('should display story type selector', async () => {
    const { component } = await setup();
    const compiled = harness.routeNativeElement!;
    const storyTypeTabs = compiled.querySelectorAll('.tab');
    expect(storyTypeTabs.length).toBe(component.storyTypes.length);
  });

  it('should highlight active story type', async () => {
    const { component } = await setup();
    store.overrideSelector(selectStoryType, 'new');
    store.refreshState();
    harness.detectChanges();

    const compiled = harness.routeNativeElement!;
    const activeTab = compiled.querySelector('.tab-active');
    expect(activeTab?.textContent?.trim()).toBe('New');
  });

  it('should show load more button when more stories are available', fakeAsync(async () => {
    const { component } = await setup();
    store.overrideSelector(selectHasMore, true);
    store.overrideSelector(selectStoriesLoadingStatus, { loading: false, error: null });
    store.overrideSelector(selectFilteredAndSortedStories, mockStories);
    store.refreshState();
    tick();
    harness.detectChanges();

    // Verify hasMore signal
    expect(component.hasMoreStories()).toBe(true);

    const compiled = harness.routeNativeElement!;
    const loadMoreContainer = compiled.querySelector('.flex.justify-center.py-8');
    expect(loadMoreContainer).toBeTruthy();
    
    const loadMoreButton = loadMoreContainer?.querySelector('button.btn.btn-primary');
    expect(loadMoreButton).toBeTruthy();
    expect(loadMoreButton?.textContent?.trim()).toBe('Load More Stories');
  }));

  it('should disable load more button when loading', fakeAsync(async () => {
    const { component } = await setup();
    store.overrideSelector(selectHasMore, true);
    store.overrideSelector(selectStoriesLoadingStatus, { loading: true, error: null });
    store.overrideSelector(selectFilteredAndSortedStories, mockStories);
    store.refreshState();
    tick();
    harness.detectChanges();

    // Verify hasMore signal
    expect(component.hasMoreStories()).toBe(true);

    const compiled = harness.routeNativeElement!;
    const loadMoreContainer = compiled.querySelector('.flex.justify-center.py-8');
    expect(loadMoreContainer).toBeTruthy();
    
    const loadMoreButton = loadMoreContainer?.querySelector('button.btn.btn-primary');
    expect(loadMoreButton).toBeTruthy();
    expect(loadMoreButton?.hasAttribute('disabled')).toBe(true);
    expect(loadMoreButton?.classList.contains('loading')).toBe(true);
    expect(loadMoreButton?.textContent?.trim()).toBe('');
  }));
});
