import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-star',
  templateUrl: './star.component.html',
  styleUrls: ['./star.component.css'],
})
export class StarComponent {
  @Input() filled: boolean = false;
  @Output() starClick = new EventEmitter<void>();
  @Output() starHover = new EventEmitter<void>();
  @Output() starHoverLeave = new EventEmitter<void>();

  onClick() {
    this.starClick.emit();
  }

  onMouseOver() {
    this.starHover.emit();
  }

  onMouseLeave() {
    this.starHoverLeave.emit();
  }
}
