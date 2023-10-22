import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { map, catchError } from 'rxjs/operators';
import { Observable, throwError, of } from 'rxjs';

import { Character, CharactersResponse } from 'src/app/models/character.model';

@Injectable({
  providedIn: 'root',
})
export class CharactersService {
  // URL base de la API de personajes de "Rick and Morty".
  private baseUrl = 'https://rickandmortyapi.com/api/character';

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Error desconocido!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Código: ${error.status}\nMensaje: ${error.message}`;
    }
    return throwError(errorMessage);
  }

  /**
   * Recupera una lista de personajes desde la API con opciones de paginación y filtros.
   *
   * @param page     (Opcional) Página de resultados. Por defecto es la página 1.
   * @param gender   (Opcional) Filtro por género.
   * @param status   (Opcional) Filtro por estado del personaje (vivo, muerto, etc.).
   * @param species  (Opcional) Filtro por especie del personaje.
   * @returns Observable<CharactersResponse> Lista paginada de personajes.
   */
  getAllCharacters(
    page: number = 1,
    gender?: string,
    status?: string,
    species?: string
  ): Observable<CharactersResponse> {
    // Construye la URL con los parámetros proporcionados.
    let url = `${this.baseUrl}?page=${page}`;

    if (gender) {
      url += `&gender=${gender}`;
    }
    if (status) {
      url += `&status=${status}`;
    }
    if (species) {
      url += `&species=${species}`;
    }

    return this.http
      .get<CharactersResponse>(url)
      .pipe(catchError(this.handleError));
  }

  /**
   * Busca personajes basándose en su nombre.
   *
   * @param name - Nombre del personaje a buscar.
   * @returns Observable<CharactersResponse> - Lista de personajes que coinciden con el nombre.
   */
  searchCharactersByName(name: string): Observable<CharactersResponse> {
    return this.http
      .get<CharactersResponse>(`${this.baseUrl}?name=${name}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtiene información de varios personajes basándose en una lista de IDs.
   *
   * @param ids - Lista de IDs de personajes.
   * @returns Observable<Character[]> - Datos de los personajes correspondientes a los IDs.
   */
  getCharactersByIds(ids: number[]): Observable<Character[]> {
    if (ids.length === 1) {
      const url = `${this.baseUrl}/${ids[0]}`;
      return this.http.get<Character>(url).pipe(
        map((character) => [character]),
        catchError(this.handleError)
      );
    } else if (ids.length > 1) {
      const idsString = ids.join(',');
      return this.http
        .get<Character[]>(`${this.baseUrl}/${idsString}`)
        .pipe(catchError(this.handleError));
    } else {
      return of([]);
    }
  }
}
