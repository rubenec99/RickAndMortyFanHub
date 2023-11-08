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

  /**
   * Emite un evento cuando se hace clic en una estrella, indicando una acción de selección por parte del usuario.
   */
  onClick() {
    this.starClick.emit();
  }

  /**
   * Emite un evento cuando el cursor del mouse pasa sobre una estrella, indicando un posible interés del usuario
   * en seleccionar esa calificación.
   */
  onMouseOver() {
    this.starHover.emit();
  }

  /**
   * Emite un evento cuando el cursor del mouse deja una estrella, indicando que el usuario ha dejado de considerar
   * esa calificación específica.
   */
  onMouseLeave() {
    this.starHoverLeave.emit();
  }
}
