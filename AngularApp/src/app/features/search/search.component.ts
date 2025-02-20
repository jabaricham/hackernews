import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './search.component.html',
})
export class SearchComponent {
  @Output() search = new EventEmitter<string>();
  searchQuery: string = '';

  onSearch() {
    this.search.emit(this.searchQuery);
  }
}