import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RatingService {
  private apiUrl = 'http://localhost:3000/user';

  constructor(private http: HttpClient) {}

  /**
   * Agrega una calificación de usuario para un episodio específico.
   *
   * @param {number} episodeId El ID del episodio al que se va a agregar la calificación.
   * @param {number} rating La calificación que el usuario desea agregar.
   * @returns {Observable<any>} Observable que representa la respuesta de la solicitud de agregar calificación.
   */
  addRating(episodeId: number, rating: number): Observable<any> {
    const retrievedToken = localStorage.getItem('authToken');
    const url = `${this.apiUrl}/episodes/${episodeId}/ratings`;
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${retrievedToken}`
    );
    const body = { rating };
    return this.http.post(url, body, { headers });
  }

  /**
   * Obtiene la calificación de un episodio específico realizada por el usuario autenticado.
   *
   * @param {number} episodeId El ID del episodio del que se desea obtener la calificación del usuario.
   * @returns {Observable<any>} Observable que representa la respuesta de la solicitud de obtener la calificación del usuario.
   */
  getRatingByUser(episodeId: number): Observable<any> {
    const retrievedToken = localStorage.getItem('authToken');
    const url = `${this.apiUrl}/episodes/${episodeId}/user-rating`;
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${retrievedToken}`
    );
    return this.http.get(url, { headers });
  }

  /**
   * Obtiene la calificación promedio de un episodio específico.
   *
   * @param {string} episodeId El ID del episodio del que se desea obtener la calificación promedio.
   * @returns {Observable<any>} Observable que representa la respuesta de la solicitud de obtener la calificación promedio.
   */
  getAverageRating(episodeId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/episodes/${episodeId}/details`);
  }
}
