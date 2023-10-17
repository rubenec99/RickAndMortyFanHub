import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

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
    return this.http.get<EpisodeResponse>(url);
  }

  /**
   * Recupera múltiples episodios basados en una lista de IDs.
   *
   * @param ids - Lista de IDs de episodios.
   * @returns Observable<Episode[]> - Datos de los episodios correspondientes a los IDs.
   */
  getMultipleEpisodes(ids: number[]): Observable<Episode[]> {
    // Si sólo hay un ID, recupera y devuelve ese episodio individual como un array.
    if (ids.length === 1) {
      const url = `${this.baseURL}/${ids[0]}`;
      return this.http.get<Episode>(url).pipe(map((episode) => [episode]));
    } else if (ids.length > 1) {
      // Si hay varios IDs, recupera todos los episodios correspondientes.
      const url = `${this.baseURL}/${ids.join(',')}`;
      return this.http.get<Episode[]>(url);
    } else {
      // Si no hay IDs, retorna un observable con un array vacío.
      return of([]);
    }
  }
}
