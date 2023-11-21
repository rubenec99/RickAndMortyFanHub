import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private apiUrl = 'https://rick-and-morty-fan-hub-api.vercel.app/user';

  constructor(private http: HttpClient) {}

  /**
   * Agrega un comentario a un episodio específico.
   *
   * @param episodeId ID del episodio al que se agregará el comentario.
   * @param comment Contenido del comentario que se agregará.
   * @returns Observable de la respuesta de la API.
   */
  addComment(episodeId: number, comment: string): Observable<any> {
    const retrievedToken = localStorage.getItem('authToken');
    const url = `${this.apiUrl}/episodes/${episodeId}/comments`;
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${retrievedToken}`
    );

    return this.http.post(url, { comment }, { headers });
  }

  /**
   * Obtiene los comentarios asociados a un episodio específico.
   *
   * @param episodeId ID del episodio del que se obtendrán los comentarios.
   * @returns Observable de la lista de comentarios.
   */
  getCommentsByEpisode(episodeId: number): Observable<any> {
    const url = `${this.apiUrl}/episodes/${episodeId}/comments`;
    return this.http.get(url);
  }

  /**
   * Elimina un comentario específico.
   *
   * @param commentId ID del comentario que se eliminará.
   * @returns Observable de la respuesta de la API.
   */
  deleteComment(commentId: number): Observable<any> {
    const retrievedToken = localStorage.getItem('authToken');
    const url = `${this.apiUrl}/comments/${commentId}`;
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${retrievedToken}`
    );

    return this.http.delete(url, { headers });
  }
}
