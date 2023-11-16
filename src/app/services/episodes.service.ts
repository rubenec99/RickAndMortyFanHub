import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { EpisodeResponse, Episode } from '../models/episode.model';

import { Observable, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EpisodesService {
  private apiUrl = 'https://rickandmortyapi.com/api/episode';
  private serverUrl = 'http://localhost:3000/user';

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

  /**
   * Marca un episodio como visto, incluyendo el token de autenticación en la cabecera.
   *
   * @param episodeId ID del episodio a marcar como visto.
   * @returns Observable de la respuesta de la API.
   */
  markEpisodeAsViewed(episodeId: number): Observable<any> {
    const retrievedToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${retrievedToken}`
    );
    return this.http.post(
      `${this.serverUrl}/episodes/${episodeId}/view`,
      {},
      { headers }
    );
  }

  /**
   * Marca un episodio como no visto, incluyendo el token de autenticación en la cabecera.
   *
   * @param episodeId ID del episodio a marcar como no visto.
   * @returns Observable de la respuesta de la API.
   */
  unmarkEpisodeAsViewed(episodeId: number): Observable<any> {
    const retrievedToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${retrievedToken}`
    );
    return this.http.delete(`${this.serverUrl}/episodes/${episodeId}/view`, {
      headers,
    });
  }

  /**
   * Obtiene una lista de los IDs de los episodios que el usuario ha marcado como vistos.
   *
   * Este método realiza una solicitud GET al servidor para obtener los episodios vistos.
   * Utiliza el token de autenticación almacenado en localStorage para autorizar la solicitud.
   * El token se incluye en las cabeceras de la solicitud HTTP.
   *
   * @returns {Observable<number[]>} Un Observable que, al suscribirse, devuelve un array de números (IDs de los episodios vistos).
   */
  getWatchedEpisodes(): Observable<number[]> {
    const retrievedToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${retrievedToken}`
    );
    return this.http.get<number[]>(`${this.serverUrl}/watchedEpisodes`, {
      headers,
    });
  }
}
