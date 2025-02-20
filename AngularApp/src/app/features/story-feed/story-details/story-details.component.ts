import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';

import { selectSelectedStory } from '../../../core/store/story.selectors';
import { StoryActions } from '../../../core/store';

@Component({
  selector: 'app-story-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './story-details.component.html',
  styleUrls: ['./story-details.component.css']
})
export class StoryDetailsComponent implements OnInit {
  private store = inject(Store);
  private route = inject(ActivatedRoute);

  story = this.store.selectSignal(selectSelectedStory);

  ngOnInit() {
    const storyId = Number(this.route.snapshot.paramMap.get('id'));
    if (storyId) {
      this.store.dispatch(StoryActions.loadStoryDetails({ id: storyId }));
    }
  }
}