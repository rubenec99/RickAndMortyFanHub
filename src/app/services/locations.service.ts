import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { LocationResponse } from '../models/location.model';

@Injectable({
  providedIn: 'root',
})
export class LocationsService {
  private readonly API_URL = 'https://rickandmortyapi.com/api';
  private readonly LOCATION_ENDPOINT = '/location';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene una lista de ubicaciones desde un punto específico en la paginación.
   *
   * @param {number} page El número de página actual que se va a recuperar (por defecto 1).
   * @returns {Observable<LocationResponse>} Observable que representa la respuesta de la solicitud para obtener ubicaciones.
   */
  getAllLocations(page: number = 1): Observable<LocationResponse> {
    const endpoint = `${this.API_URL}${this.LOCATION_ENDPOINT}`;
    const params = { page: page.toString() };

    return this.http.get<LocationResponse>(endpoint, { params });
  }
}
