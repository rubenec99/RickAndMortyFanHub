import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CharactersResponse } from 'src/models/character.model';

@Injectable({
  providedIn: 'root',
})
export class CharactersService {
  private baseUrl = 'https://rickandmortyapi.com/api/character'; // URL específica para personajes

  constructor(private http: HttpClient) {}

  // Método para obtener todos los personajes con paginación opcional
  getAllCharacters(page: number = 1): Observable<CharactersResponse> {
    // Hacemos una solicitud HTTP GET a la URL de la API de personajes
    // Se incluye el número de página si se proporciona
    return this.http.get<CharactersResponse>(`${this.baseUrl}?page=${page}`);
  }

  // Método para obtener un personaje por su ID
  getCharacterById(id: number): Observable<any> {
    // Realiza una solicitud HTTP GET a la URL base seguida del ID para obtener un personaje específico
    return this.http.get(`${this.baseUrl}/${id}`);
  }
}
