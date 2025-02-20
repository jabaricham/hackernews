import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideLocationMocks } from '@angular/common/testing';
import { Location } from '@angular/common';
import { provideRouter } from '@angular/router';
import { StoryCardComponent } from './story-card.component';
import { StoryWithMetadata } from '../../../core/models/story.model';

describe('StoryCardComponent', () => {
  let component: StoryCardComponent;
  let fixture: ComponentFixture<StoryCardComponent>;
  let location: Location;

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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoryCardComponent],
      providers: [
        provideRouter([
          { path: 'item/:id', component: StoryCardComponent }
        ]),
        provideLocationMocks()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StoryCardComponent);
    component = fixture.componentInstance;
    location = TestBed.inject(Location);
    component.story = mockStory;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display story title', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain(mockStory.title);
  });

  it('should display story metadata', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain(mockStory.score + ' points');
    expect(compiled.textContent).toContain('by ' + mockStory.by);
    expect(compiled.textContent).toContain(mockStory.commentCount + ' comments');
  });

  it('should have correct story link', () => {
    const compiled = fixture.nativeElement;
    const link = compiled.querySelector('h2.card-title a') as HTMLAnchorElement;
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toBe(mockStory.url);
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('should navigate to story details when clicking comments link', fakeAsync(() => {
    const compiled = fixture.nativeElement;
    const detailsLink = compiled.querySelector('.card-actions a') as HTMLAnchorElement;
    expect(detailsLink).toBeTruthy();
    
    detailsLink.click();
    tick();
    
    expect(location.path()).toBe('/item/' + mockStory.id);
  }));

  it('should display domain if available', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain(mockStory.domain);
  });

  it('should display timeAgo if available', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain(mockStory.timeAgo);
  });

  it('should handle missing optional fields', () => {
    component.story = {
      ...mockStory,
      domain: undefined,
      timeAgo: undefined,
      url: ''
    };
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const link = compiled.querySelector('h2.card-title a') as HTMLAnchorElement;
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toBe('');
    expect(link.getAttribute('target')).toBeNull();
    expect(compiled.textContent).toContain('recently');
  });
});
