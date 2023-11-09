import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EpisodeResponse, Episode } from '../models/episode.model';

import { Observable, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EpisodesService {
  private apiUrl = 'https://rickandmortyapi.com/api/episode';

  constructor(private http: HttpClient) {}
  /**
   * Obtiene una lista de episodios.
   *
   * @param página Número de página a recuperar. El valor predeterminado es 1.
   * @returns Observable del objeto EpisodeResponse.
   */
  getAllEpisodes(page: number = 1): Observable<EpisodeResponse> {
    const url = `${this.apiUrl}?page=${page}`;
    return this.http.get<EpisodeResponse>(url);
  }

  /**
   * Obtiene una lista de episodios por sus IDs.
   *
   * @param ids IDs de los episodios a recuperar.
   * @returns Observable de un array de objetos Episode.
   */
  getMultipleEpisodes(ids: number[]): Observable<Episode[] | Episode> {
    if (ids.length === 0) {
      return of([]);
    }

    const url = `${this.apiUrl}/${ids.length === 1 ? ids[0] : ids.join(',')}`;
    return this.http
      .get<Episode[] | Episode>(url)
      .pipe(
        map((response) => (Array.isArray(response) ? response : [response]))
      );
  }
}
