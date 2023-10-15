import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { Character } from 'src/app/models/character.model';
import { CharactersResponse } from 'src/app/models/character.model';

@Injectable({
  providedIn: 'root',
})
export class CharactersService {
  private baseUrl = 'https://rickandmortyapi.com/api/character'; // URL específica para personajes

  constructor(private http: HttpClient) {}

  /**
   * Método para obtener todos los personajes desde la API con paginación opcional y filtros.
   *
   * @param page (Opcional) El número de página que se desea recuperar. Por defecto, es la página 1.
   * @param gender (Opcional) El género por el cual se desea filtrar los personajes.
   * @param status (Opcional) El estado por el cual se desea filtrar los personajes.
   * @param species (Opcional) La especie por la cual se desea filtrar los personajes.
   * @returns Un Observable que emite una respuesta de tipo "CharactersResponse".
   */
  getAllCharacters(
    page: number = 1,
    gender?: string,
    status?: string,
    species?: string
  ): Observable<CharactersResponse> {
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

    return this.http.get<CharactersResponse>(url);
  }

  /**
   * Método para obtener todos los personajes de la API, incluyendo todas los páginas disponibles.
   *
   * @returns Un Observable que emite un arreglo de objetos de tipo "Character".
   */
  getAllCharactersFull(): Observable<Character[]> {
    return new Observable<Character[]>((observer) => {
      let allCharacters: Character[] = [];

      // Función recursiva para obtener personajes por página
      const getCharactersByPage = (page: number) => {
        // Realiza una solicitud HTTP para obtener personajes de una página específica
        this.getAllCharacters(page).subscribe((response) => {
          allCharacters = allCharacters.concat(response.results); // Agrega los personajes de la página actual al arreglo

          if (response.info.next) {
            // Si hay una página siguiente, continúa la recursión para obtener más personajes
            getCharactersByPage(page + 1);
          } else {
            // Cuando no hay más páginas disponibles, emite el array completo y completa el observable
            observer.next(allCharacters);
            observer.complete();
          }
        });
      };

      // Comienza la obtención de personajes desde la primera página
      getCharactersByPage(1);
    });
  }

  /**
   * Obtiene la información de un personaje específico utilizando su ID.
   *
   * @param id - El identificador único del personaje.
   * @returns Observable<Character> - Un observable que emite el detalle del personaje solicitado.
   */
  getCharacterById(id: number): Observable<Character> {
    // Construye la URL completa usando la URL base y el ID proporcionado, luego realiza una solicitud HTTP GET para obtener los detalles del personaje.
    return this.http.get<Character>(`${this.baseUrl}/character/${id}`);
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

  /**
   * Obtiene la información de un personaje específico utilizando su URL.
   *
   * @param characterUrl - La URL del personaje.
   * @returns Observable<Character> - Los detalles del personaje solicitado.
   */
  getCharacter(characterUrl: string): Observable<Character> {
    return this.http.get<Character>(characterUrl);
  }
}
