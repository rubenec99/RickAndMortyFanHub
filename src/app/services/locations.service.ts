import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { LocationResponse } from '../models/location.model';

@Injectable({
  providedIn: 'root',
})
export class LocationsService {
  // Base URL para la API.
  private readonly API_URL = 'https://rickandmortyapi.com/api';
  private readonly LOCATION_ENDPOINT = '/location';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todas las localizaciones desde la API con paginación opcional.
   *
   * @param page (Opcional) Número de página que se desea recuperar. Por defecto, es la página 1.
   * @returns Observable que emite una respuesta de tipo "LocationResponse".
   */
  getAllLocations(page: number = 1): Observable<LocationResponse> {
    const endpoint = `${this.API_URL}${this.LOCATION_ENDPOINT}`;
    const params = { page: page.toString() };

    return this.http
      .get<LocationResponse>(endpoint, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Manejo de errores
   *
   * @param error Objeto de error devuelto por el servicio.
   * @returns Observable con un mensaje de error amigable.
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    if (error.error instanceof ErrorEvent) {
      // Errores del lado del cliente o error de red.
      console.error('Ocurrió un error:', error.error.message);
    } else {
      // El servidor retornó un código de respuesta no exitoso.
      console.error(
        `El servidor retornó el código ${error.status}, ` +
          `cuerpo del error: ${error.error}`
      );
    }

    // Retornar un mensaje de error observable para la interfaz del usuario.
    return throwError(
      'Ocurrió un problema al intentar recuperar los datos. Por favor, inténtelo más tarde.'
    );
  }
}
