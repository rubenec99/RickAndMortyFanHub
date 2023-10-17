import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs';

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

  /**
   * Obtiene múltiples episodios basado en una lista de IDs.
   *
   * @param ids - Un array de números que representa los IDs de los episodios que se desean obtener.
   * @returns Un observable que emite un array de episodios.
   */
  getMultipleEpisodes(ids: number[]): Observable<Episode[]> {
    // Verifica si sólo hay un ID en el array.
    if (ids.length === 1) {
      // Si sólo hay un ID, construye la URL específica para ese episodio.
      const url = `${this.baseURL}/${ids[0]}`;
      // Realiza la petición HTTP para obtener un único episodio.
      // Luego, usa el operador "map" para convertir ese episodio individual en un array.
      return this.http.get<Episode>(url).pipe(map((episode) => [episode]));
    } else {
      // Si hay más de un ID, construye la URL con todos los IDs separados por comas.
      const url = `${this.baseURL}/${ids.join(',')}`;
      // Realiza la petición HTTP para obtener un array de episodios.
      return this.http.get<Episode[]>(url);
    }
  }
}
