import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';

import { LocationResponse } from '../models/location.model';

@Injectable({
  providedIn: 'root',
})
export class LocationsService {
  private readonly API_URL = 'https://rickandmortyapi.com/api';
  private readonly LOCATION_ENDPOINT = '/location';

  constructor(private http: HttpClient) {}

  getAllLocations(
    page: number = 1,
    type?: string,
    dimension?: string
  ): Observable<LocationResponse> {
    let params = new HttpParams().set('page', page.toString());
    if (type) {
      params = params.set('type', type);
    }
    if (dimension) {
      params = params.set('dimension', dimension);
    }

    return this.http.get<LocationResponse>(
      `${this.API_URL}${this.LOCATION_ENDPOINT}`,
      { params }
    );
  }
}
