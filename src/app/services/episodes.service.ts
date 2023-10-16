import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { EpisodeResponse } from '../models/episode.model';
import { Episode } from '../models/episode.model';

@Injectable({
  providedIn: 'root',
})
export class EpisodesService {
  private baseURL = 'https://rickandmortyapi.com/api/episode';

  constructor(private http: HttpClient) {}

  /**
   * Método para obtener todos los episodios desde la API. Paginación opcinal.
   *
   * @param page (Opcional) El número de página que se desea recuperar. Por defecto, es la página 1.
   * @returns Un Observable que emite una respuesta de tipo "EpisodeResponse".
   */
  getAllEpisodes(page: number = 1): Observable<EpisodeResponse> {
    const url = `${this.baseURL}?page=${page}`;
    return this.http.get<EpisodeResponse>(url);
  }

  getEpisodesByIds(ids: number[]): Observable<Episode[]> {
    const idsString = ids.join(',');
    const url = `https://rickandmortyapi.com/api/episode/${idsString}`;
    return this.http.get<Episode[]>(url);
  }
}
