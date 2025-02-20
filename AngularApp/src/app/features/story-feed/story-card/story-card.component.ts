import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StoryWithMetadata } from '../../../core/models/story.model';

@Component({
  selector: 'app-story-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './story-card.component.html'
})
export class StoryCardComponent {
  @Input({ required: true }) story!: StoryWithMetadata;
}