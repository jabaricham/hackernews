import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideRouter } from '@angular/router';
import { provideLocationMocks } from '@angular/common/testing';
import { AppComponent } from './app.component';
import { Location } from '@angular/common';
import { fakeAsync, tick } from '@angular/core/testing';

describe('AppComponent', () => {
  let component: AppComponent;
  let harness: RouterTestingHarness;
  let location: Location;

  async function setup(path: string = '/') {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([
          { path: '', redirectTo: '/stories', pathMatch: 'full' },
          { path: 'stories', component: AppComponent },
          { path: 'item/:id', component: AppComponent }
        ]),
        provideLocationMocks()
      ]
    }).compileComponents();

    harness = await RouterTestingHarness.create();
    location = TestBed.inject(Location);
    const navigatedComponent = await harness.navigateByUrl<AppComponent>(path, AppComponent);
    if (!navigatedComponent) {
      throw new Error(`Failed to navigate to ${path}`);
    }
    component = navigatedComponent;
    harness.detectChanges();

    return {
      harness,
      component,
      location
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should have router outlet', async () => {
    const { harness } = await setup();
    const compiled = harness.routeNativeElement!;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });

  it('should have correct app title in navbar', async () => {
    const { harness } = await setup();
    const compiled = harness.routeNativeElement!;
    const titleLink = compiled.querySelector('.navbar-start a');
    expect(titleLink).toBeTruthy();
    expect(titleLink?.textContent?.trim()).toBe('Hacker News Reader');
    expect(titleLink?.getAttribute('href')).toBe('/');
  });

  it('should have theme toggle button', async () => {
    const { harness } = await setup();
    const compiled = harness.routeNativeElement!;
    const themeToggle = compiled.querySelector('.theme-controller') as HTMLInputElement;
    expect(themeToggle).toBeTruthy();
    expect(themeToggle.type).toBe('checkbox');
    expect(themeToggle.value).toBe('dark');
  });

  it('should have both sun and moon icons for theme toggle', async () => {
    const { harness } = await setup();
    const compiled = harness.routeNativeElement!;
    const sunIcon = compiled.querySelector('.swap-on');
    const moonIcon = compiled.querySelector('.swap-off');
    expect(sunIcon).toBeTruthy();
    expect(moonIcon).toBeTruthy();
    // The icons are SVGs with paths that define their shapes
    expect(sunIcon?.querySelector('path')).toBeTruthy();
    expect(moonIcon?.querySelector('path')).toBeTruthy();
  });

  it('should toggle theme when button is clicked', fakeAsync(async () => {
    const { harness } = await setup();
    const compiled = harness.routeNativeElement!;
    const themeToggle = compiled.querySelector('.theme-controller') as HTMLInputElement;
    const html = document.documentElement;

    // Set initial theme
    html.setAttribute('data-theme', 'light');
    harness.detectChanges();
    tick();
    expect(html.getAttribute('data-theme')).toBe('light');

    // Click theme toggle
    themeToggle.click();
    harness.detectChanges();
    tick();
    expect(html.getAttribute('data-theme')).toBe('dark');

    // Click theme toggle again
    themeToggle.click();
    harness.detectChanges();
    tick();
    expect(html.getAttribute('data-theme')).toBe('light');
  }));

  it('should redirect to stories page by default', async () => {
    const { location } = await setup('');
    expect(location.path()).toBe('/stories');
  });

  it('should navigate to story details page', async () => {
    const { location } = await setup('/item/123');
    expect(location.path()).toBe('/item/123');
  });

  it('should navigate to stories on title click', async () => {
    const { harness, location } = await setup('/stories');
    const compiled = harness.routeNativeElement!;
    const titleLink = compiled.querySelector('.navbar-start a') as HTMLAnchorElement;
    expect(titleLink).toBeTruthy();

    titleLink.click();
    harness.detectChanges();
    expect(location.path()).toBe('/stories');
  });
});
