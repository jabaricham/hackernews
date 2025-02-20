import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideLocationMocks } from '@angular/common/testing';
import { Location } from '@angular/common';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { StoryDetailsComponent } from './story-details.component';
import { StoryActions } from '../../../core/store';
import { selectSelectedStory } from '../../../core/store/story.selectors';
import { StoryWithMetadata } from '../../../core/models/story.model';

describe('StoryDetailsComponent', () => {
  let component: StoryDetailsComponent;
  let harness: RouterTestingHarness;
  let store: MockStore;
  let router: Router;
  let location: Location;
  let dispatchSpy: jasmine.Spy;

  const mockStory: StoryWithMetadata = {
    id: 1,
    title: 'Test Story',
    url: 'https://example.com/test',
    score: 100,
    time: 1708488000,
    by: 'testuser',
    descendants: 10,
    type: 'story',
    commentCount: 10,
    domain: 'example.com',
    timeAgo: '2 hours ago'
  };

  const initialState = {
    stories: {
      entities: {},
      ids: [],
      selectedId: null,
      loading: false,
      error: null,
      lastId: null,
      hasMore: true,
      storyType: 'top' as const,
      searchQuery: '',
      sortBy: 'date' as const
    }
  };

  async function setup(path: string = '/item/1') {
    await TestBed.configureTestingModule({
      imports: [StoryDetailsComponent],
      providers: [
        provideMockStore({ initialState }),
        provideRouter([
          { path: 'item/:id', component: StoryDetailsComponent },
          { path: '', component: StoryDetailsComponent }
        ]),
        provideLocationMocks()
      ]
    }).compileComponents();

    store = TestBed.inject(MockStore);
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    harness = await RouterTestingHarness.create();
    dispatchSpy = spyOn(store, 'dispatch');
    
    const navigatedComponent = await harness.navigateByUrl<StoryDetailsComponent>(path, StoryDetailsComponent);
    if (!navigatedComponent) {
      throw new Error(`Failed to navigate to ${path}`);
    }
    component = navigatedComponent;
    harness.detectChanges();

    return {
      harness,
      store,
      router,
      location,
      component
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should dispatch loadStoryDetails action on init with correct ID', async () => {
    await setup('/item/1');
    expect(dispatchSpy).toHaveBeenCalledWith(
      StoryActions.loadStoryDetails({ id: 1 })
    );
  });

  it('should not dispatch loadStoryDetails if no ID in route', async () => {
    await setup('/');
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('should show loading state when story is null', async () => {
    await setup();
    store.overrideSelector(selectSelectedStory, null);
    store.refreshState();
    harness.detectChanges();

    const compiled = harness.routeNativeElement!;
    const spinner = compiled.querySelector('.loading-spinner');
    expect(spinner).toBeTruthy();
  });

  it('should display story details when story is loaded', async () => {
    await setup();
    store.overrideSelector(selectSelectedStory, mockStory);
    store.refreshState();
    harness.detectChanges();

    const compiled = harness.routeNativeElement!;
    expect(compiled.textContent).toContain(mockStory.title);
    expect(compiled.textContent).toContain(mockStory.by);
    expect(compiled.textContent).toContain(mockStory.score + ' points');
    expect(compiled.textContent).toContain(mockStory.commentCount + ' Comments');
  });

  it('should have correct story link', async () => {
    await setup();
    store.overrideSelector(selectSelectedStory, mockStory);
    store.refreshState();
    harness.detectChanges();

    const compiled = harness.routeNativeElement!;
    const link = compiled.querySelector('h1 a') as HTMLAnchorElement;
    expect(link).toBeTruthy();
    expect(link.href).toContain(mockStory.url);
    expect(link.target).toBe('_blank');
    expect(link.rel).toBe('noopener noreferrer');
  });

  it('should navigate back to home when clicking back link', fakeAsync(async () => {
    await setup();
    store.overrideSelector(selectSelectedStory, mockStory);
    store.refreshState();
    harness.detectChanges();

    const compiled = harness.routeNativeElement!;
    const backLink = compiled.querySelector('.btn-ghost') as HTMLAnchorElement;
    expect(backLink).toBeTruthy();
    
    backLink.click();
    tick();
    
    expect(location.path()).toBe('/');
  }));

  it('should handle missing optional fields', async () => {
    await setup();
    const storyWithMissingFields: StoryWithMetadata = {
      ...mockStory,
      domain: undefined,
      timeAgo: undefined,
      url: ''
    };
    store.overrideSelector(selectSelectedStory, storyWithMissingFields);
    store.refreshState();
    harness.detectChanges();

    const compiled = harness.routeNativeElement!;
    const link = compiled.querySelector('h1 a') as HTMLAnchorElement;
    expect(link).toBeTruthy();
    expect(link.href).toBe('http://localhost:9876/');
    expect(link.target).toBe('');
    expect(compiled.textContent).toContain('recently');
  });
});
