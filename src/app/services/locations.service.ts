import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { LocationResponse } from '../models/location.model';

@Injectable({
  providedIn: 'root',
})
export class LocationsService {
  private baseURL = 'https://rickandmortyapi.com/api/location';

  constructor(private http: HttpClient) {}

  /**
   * Método para obtener todas las localizaciones desde la API con paginación opcional.
   *
   * @param page (Opcional) El número de página que se desea recuperar. Por defecto, es la página 1.
   * @returns Un Observable que emite una respuesta de tipo "LocationResponse".
   */
  getAllLocations(page: number = 1): Observable<LocationResponse> {
    const url = `${this.baseURL}?page=${page}`;
    return this.http.get<LocationResponse>(url);
  }
}
