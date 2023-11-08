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

  /**
   * Establece la calificación actual a la proporcionada y emite un evento con el nuevo valor.
   * Este método es utilizado para actualizar la calificación el número de estrellas seleccionadas
   * por el usuario.
   *
   * @param {number} newRating - La nueva calificación seleccionada por el usuario.
   */
  rate(newRating: number): void {
    this.rating = newRating;
    this.ratingChange.emit(this.rating);
  }

  /**
   * Actualiza el índice de "hover" al pasar el mouse sobre una estrella.
   *
   * @param {number} index - El índice del elemento sobre el que el usuario pasa el mouse.
   */
  hoverEnter(index: number): void {
    this.hoverIndex = index;
  }

  /**
   * Restablece el índice de "hover" cuando el mouse deja una estrella.
   */
  hoverLeave(): void {
    this.hoverIndex = -1;
  }
}
