import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CharactersService {
  private baseUrl = 'https://rickandmortyapi.com/api/character'; // URL específica para personajes

  constructor(private http: HttpClient) {}

  // Método para obtener todos los personajes
  getAllCharacters(): Observable<any> {
    // Realiza una solicitud HTTP GET a la URL base para obtener todos los personajes
    return this.http.get(this.baseUrl);
  }

  // Método para obtener un personaje por su ID
  getCharacterById(id: number): Observable<any> {
    // Realiza una solicitud HTTP GET a la URL base seguida del ID para obtener un personaje específico
    return this.http.get(`${this.baseUrl}/${id}`);
  }
}
