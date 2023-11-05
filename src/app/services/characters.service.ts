import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable, forkJoin, of, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

import { Character, CharactersResponse } from 'src/app/models/character.model';

@Injectable({
  providedIn: 'root',
})
export class CharactersService {
  // URL base de la API de personajes de "Rick and Morty".
  private baseUrl = 'https://rickandmortyapi.com/api/character';

  constructor(private http: HttpClient) {}

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

  /**
   * Maneja y procesa errores de tipo HTTP.
   *
   * @param error - El error HTTP que se debe manejar.
   * @returns - Lanza un observable con el mensaje de error.
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Error desconocido!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Código: ${error.status}\nMensaje: ${error.message}`;
    }
    console.error(errorMessage);

    return throwError(errorMessage);
  }

  /**
   * Obtiene 5 personajes aleatorios de la API.
   *
   * @returns Observable<Character[]> - Datos de los 5 personajes aleatorios.
   */
  getRandomFiveCharacters(): Observable<Character[]> {
    return this.getAllCharacters(1).pipe(
      switchMap((response) => {
        const totalCharacters = response.info.count;
        const randomIds = this.generateUniqueRandomNumbers(5, totalCharacters);

        // Usar forkJoin para obtener todos los personajes al mismo tiempo.
        return forkJoin(randomIds.map((id) => this.getCharacterById(id)));
      })
    );
  }

  /**
   * Genera un conjunto de números aleatorios únicos.
   *
   * @param count - Cuántos números aleatorios generar.
   * @param max - Límite superior para números aleatorios.
   * @returns number[] - Conjunto de números aleatorios.
   */
  generateUniqueRandomNumbers(count: number, max: number): number[] {
    const randomNumbers = new Set<number>();

    while (randomNumbers.size < count) {
      const randomNumber = Math.floor(Math.random() * max) + 1;
      randomNumbers.add(randomNumber);
    }

    return [...randomNumbers];
  }

  /**
   * Obtiene un personaje por ID.
   *
   * @param id - ID del personaje.
   * @returns Observable<Character> - Datos del personaje.
   */
  getCharacterById(id: number): Observable<Character> {
    return this.http
      .get<Character>(`${this.baseUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }
}
