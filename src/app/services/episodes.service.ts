import { Injectable } from '@angular/core';

import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { EpisodeResponse, Episode } from '../models/episode.model';

@Injectable({
  providedIn: 'root',
})
export class EpisodesService {
  // URL base de la API de episodios de "Rick and Morty".
  private baseURL = 'https://rickandmortyapi.com/api/episode';

  constructor(private http: HttpClient) {}

  /**
   * Recupera una lista de episodios desde la API con opciones de paginación.
   *
   * @param page (Opcional) Página de resultados. Por defecto es la página 1.
   * @returns Observable<EpisodeResponse> Lista paginada de episodios.
   */
  getAllEpisodes(page: number = 1): Observable<EpisodeResponse> {
    const url = `${this.baseURL}?page=${page}`;
    return this.http
      .get<EpisodeResponse>(url)
      .pipe(catchError(this.handleError));
  }

  /**
   * Recupera múltiples episodios basados en una lista de IDs.
   *
   * @param ids - Lista de IDs de episodios.
   * @returns Observable<Episode[]> - Datos de los episodios correspondientes a los IDs.
   */
  getMultipleEpisodes(ids: number[]): Observable<Episode[]> {
    if (ids.length === 1) {
      const url = `${this.baseURL}/${ids[0]}`;
      return this.http.get<Episode>(url).pipe(
        map((episode) => [episode]),
        catchError(this.handleError)
      );
    } else if (ids.length > 1) {
      const url = `${this.baseURL}/${ids.join(',')}`;
      return this.http.get<Episode[]>(url).pipe(catchError(this.handleError));
    } else {
      return of([]);
    }
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Código: ${error.status}\nMensaje: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(errorMessage);
  }
}
