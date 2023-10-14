import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CharactersResponse } from 'src/app/models/character.model';

@Injectable({
  providedIn: 'root',
})
export class CharactersService {
  private baseUrl = 'https://rickandmortyapi.com/api/character'; // URL específica para personajes

  constructor(private http: HttpClient) {}

  /**
   * Método para obtener todos los personajes (con paginación opcional).
   *
   * @param page (Opcional) El número de página que se desea recuperar. Por defecto, es la página 1.
   * @returns Un Observable que emite una respuesta de tipo "CharactersResponse".
   */
  getAllCharacters(page: number = 1): Observable<CharactersResponse> {
    // Realiza una solicitud HTTP GET a la URL de la API de personajes, incluyendo el número de página si se proporciona.
    return this.http.get<CharactersResponse>(`${this.baseUrl}?page=${page}`);
  }

  /**
   * Método para obtener un personaje por su ID.
   *
   * @param id El ID del personaje que se desea obtener.
   * @returns Un Observable que emite una respuesta de tipo "any".
   */
  getCharacterById(id: number): Observable<any> {
    // Realiza una solicitud HTTP GET a la URL base de la API seguida del ID para obtener un personaje específico.
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  /**
   * Método para obtener un episodio específico por su URL.
   *
   * @param episodeUrl La URL del episodio que se desea obtener.
   * @returns Un Observable que emite una respuesta de tipo "any".
   */
  getEpisode(episodeUrl: string): Observable<any> {
    // Realiza una solicitud HTTP GET a la URL proporcionada para obtener el episodio.
    return this.http.get<any>(episodeUrl);
  }

  /**
   * Método para buscar personajes por nombre.
   *
   * @param name El nombre del personaje a buscar.
   * @returns Un Observable que emite una respuesta de tipo CharactersResponse.
   */
  searchCharactersByName(name: string): Observable<CharactersResponse> {
    // Realiza una solicitud HTTP GET a la URL de la API con el parámetro "name" para buscar personajes por nombre.
    return this.http.get<CharactersResponse>(`${this.baseUrl}?name=${name}`);
  }
}
