import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Character, CharactersResponse } from 'src/app/models/character.model';

import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CharactersService {
  private baseUrl = 'https://rickandmortyapi.com/api/character';
  private serverUrl = 'https://rick-and-morty-fan-hub-api.vercel.app/user';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los personajes de la API con posibilidad de aplicar filtros por género, estado y especie.
   *
   * @param {number} page El número de página de la paginación de resultados (por defecto es 1).
   * @param {string} [gender] El género del personaje para filtrar los resultados (opcional).
   * @param {string} [status] El estado del personaje (por ejemplo, 'vivo' o 'muerto') para filtrar los resultados (opcional).
   * @param {string} [species] La especie del personaje para filtrar los resultados (opcional).
   * @param {string} [searchTerm] El termino de búsqueda para filtrar por nombre
   *
   * @returns {Observable<CharactersResponse>} Un observable que emite la respuesta de la API con los personajes filtrados y la información de paginación.
   */
  getAllCharacters(
    page: number = 1,
    gender?: string,
    status?: string,
    species?: string,
    searchTerm?: string
  ): Observable<CharactersResponse> {
    let url = `${this.baseUrl}?page=${page}`;
    if (gender) url += `&gender=${gender}`;
    if (status) url += `&status=${status}`;
    if (species) url += `&species=${species}`;
    if (searchTerm) url += `&name=${encodeURIComponent(searchTerm)}`;
    return this.http.get<CharactersResponse>(url);
  }

  /**
   * Filtra los personajes favoritos según los criterios de búsqueda y filtros adicionales.
   *
   * @param favoriteCharacterIds IDs de personajes favoritos.
   * @param gender Género para filtrar.
   * @param status Estado para filtrar.
   * @param species Especie para filtrar.
   * @param searchTerm Término de búsqueda.
   * @returns Observable de un arreglo de personajes filtrados.
   */
  filterFavoriteCharacters(
    favoriteCharacterIds: number[],
    gender?: string,
    status?: string,
    species?: string,
    searchTerm?: string
  ): Observable<Character[]> {
    return this.getCharactersByIds(favoriteCharacterIds).pipe(
      map((characters) =>
        characters.filter(
          (character) =>
            (!gender || character.gender === gender) &&
            (!status || character.status === status) &&
            (!species || character.species === species) &&
            (!searchTerm ||
              character.name.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      )
    );
  }

  /**
   * Realiza una búsqueda de personajes por su nombre.
   *
   * @param {string} name El nombre o parte del nombre del personaje que se desea buscar.
   *
   * @returns {Observable<CharactersResponse>} Un observable que emite la respuesta de la API con los personajes que coinciden con la búsqueda.
   */
  searchCharactersByName(name: string): Observable<CharactersResponse> {
    return this.http.get<CharactersResponse>(`${this.baseUrl}?name=${name}`);
  }

  /**
   * Obtiene información sobre personajes basada en una lista de identificadores.
   *
   * @param {number[]} ids Una lista de identificadores de personajes para buscar.
   *
   * @returns {Observable<Character[]>} Un observable que emite un arreglo de objetos de personajes que coinciden con los identificadores proporcionados.
   */
  getCharactersByIds(ids: number[]): Observable<Character[]> {
    if (ids.length === 0) {
      return of([]);
    }
    const url =
      ids.length === 1
        ? `${this.baseUrl}/${ids[0]}`
        : `${this.baseUrl}/${ids.join(',')}`;
    return this.http.get<Character[]>(url);
  }

  /**
   * Obtiene información sobre cinco personajes aleatorios.
   *
   * @returns {Observable<Character[]>} Un observable que emite un arreglo de objetos de personajes aleatorios.
   */
  getRandomFiveCharacters(): Observable<Character[]> {
    return this.http.get<{ info: { count: number } }>(this.baseUrl).pipe(
      switchMap((infoResponse) => {
        const totalCharacters = infoResponse.info.count;
        return this.getCharactersByIds(
          this.generateUniqueRandomNumbers(5, totalCharacters)
        );
      })
    );
  }

  /**
   * Obtiene información de un personaje específico según su ID.
   *
   * @param {number} id El ID del personaje que se desea obtener.
   * @returns {Observable<Character>} Un observable que emite un objeto de personaje con la información del personaje solicitado.
   */
  getCharacterById(id: number): Observable<Character> {
    return this.http.get<Character>(`${this.baseUrl}/${id}`);
  }

  /**
   * Obtiene una cantidad especificada de personajes aleatorios.
   *
   * @param {number} count La cantidad de personajes aleatorios que se desean obtener.
   *
   * @returns {Observable<Character[]>} Un observable que emite un arreglo de objetos de personajes aleatorios.
   */
  getRandomCharacters(count: number): Observable<Character[]> {
    return this.http.get<{ info: { count: number } }>(this.baseUrl).pipe(
      switchMap((infoResponse) => {
        const totalCharacters = infoResponse.info.count;
        const randomIds = this.generateUniqueRandomNumbers(
          count,
          totalCharacters
        );
        return this.getCharactersByIds(randomIds);
      })
    );
  }

  /**
   * Genera un conjunto de números aleatorios únicos dentro de un rango especificado.
   *
   * @param {number} count La cantidad de números aleatorios únicos que se desean generar.
   * @param {number} max El valor máximo posible para los números aleatorios.
   * @returns {number[]} Un arreglo que contiene los números aleatorios únicos generados.
   */
  private generateUniqueRandomNumbers(count: number, max: number): number[] {
    const randomNumbers = new Set<number>();
    while (randomNumbers.size < count) {
      const randomNumber = Math.floor(Math.random() * max) + 1;
      randomNumbers.add(randomNumber);
    }
    return [...randomNumbers];
  }

  /**
   * Añade un personaje favorito.
   *
   * @param characterId El ID del personaje a añadir como favorito.
   * @returns Un Observable que representa la respuesta del servidor.
   */
  addFavoriteCharacter(characterId: number): Observable<any> {
    const retrievedToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${retrievedToken}`
    );
    return this.http.post(
      `${this.serverUrl}/characters/${characterId}/favorite`,
      {},
      { headers }
    );
  }

  /**
   * Elimina un personaje de favoritos.
   *
   * @param characterId El ID del personaje a añadir como favorito.
   * @returns Un Observable que representa la respuesta del servidor.
   */
  removeFavoriteCharacter(characterId: number): Observable<any> {
    const retrievedToken = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${retrievedToken}`
    );
    return this.http.delete(
      `${this.serverUrl}/characters/${characterId}/favorite`,
      { headers }
    );
  }

  /**
   * Obtiene una lista de los IDs de los personajes que el usuario ha marcado como favoritos si este tiene iniciada la sesión.
   *
   * Este método realiza una solicitud GET al servidor para obtener los personajes favoritos.
   * Utiliza el token de autenticación almacenado en localStorage para autorizar la solicitud.
   * El token se incluye en las cabeceras de la solicitud HTTP.
   *
   * @returns {Observable<number[]>} Un Observable que, al suscribirse, devuelve un array de números (IDs de los personajes favoritos).
   */
  getFavoriteCharacters(): Observable<number[]> {
    const retrievedToken = localStorage.getItem('authToken');

    // Verificar si existe un token de autenticación
    if (!retrievedToken) {
      return of([]);
    }

    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${retrievedToken}`
    );

    return this.http.get<number[]>(`${this.serverUrl}/favoriteCharacters`, {
      headers,
    });
  }
}
