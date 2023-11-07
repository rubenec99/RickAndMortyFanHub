import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private apiUrl = 'http://localhost:3000/user';

  constructor(private http: HttpClient) {}

  addComment(episodeId: number, comment: string): Observable<any> {
    const retrievedToken = localStorage.getItem('authToken');
    const url = `${this.apiUrl}/episodes/${episodeId}/comments`;
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${retrievedToken}`
    );
    return this.http.post(url, { comment }, { headers });
  }

  getCommentsByEpisode(episodeId: number): Observable<any> {
    console.log(`Loading comments for episodeId: ${episodeId}`); // Inicio de la llamada
    return this.http.get(`${this.apiUrl}/episodes/${episodeId}/comments`).pipe(
      tap((comments) => console.log(`Received comments:`, comments)), // Resultados obtenidos
      catchError((error) => {
        console.error(
          `Error loading comments for episodeId ${episodeId}:`,
          error
        ); // Error al cargar comentarios
        return throwError(() => error);
      })
    );
  }

  // Método para eliminar un comentario
  deleteComment(commentId: number): Observable<any> {
    const retrievedToken = localStorage.getItem('authToken');
    const url = `${this.apiUrl}/comments/${commentId}`;
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${retrievedToken}`
    );
    return this.http.delete(url, { headers }).pipe(
      catchError(this.handleError) // Asegúrate de tener un método para manejar errores.
    );
  }

  // Puedes tener un método genérico para manejar errores
  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(() => new Error(error.message || 'An error occurred'));
  }
}
