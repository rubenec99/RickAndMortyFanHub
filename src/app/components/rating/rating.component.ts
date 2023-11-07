import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.css'],
})
export class RatingComponent {
  @Input() rating: number = 0;
  @Output() ratingChange = new EventEmitter<number>();
  hoverIndex = -1;
  stars: boolean[] = Array(5).fill(false);

  rate(newRating: number): void {
    this.rating = newRating;
    this.ratingChange.emit(this.rating);
  }

  hoverEnter(index: number): void {
    this.hoverIndex = index;
  }

  hoverLeave(): void {
    this.hoverIndex = -1;
  }
}
