import { Routes } from '@angular/router';
import { StoryFeedComponent } from './features/story-feed/story-feed.component';

export const routes: Routes = [
  {
    path: '',
    component: StoryFeedComponent
  },
  {
    path: 'item/:id',
    loadComponent: () => import('./features/story-feed/story-details/story-details.component')
      .then(m => m.StoryDetailsComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
