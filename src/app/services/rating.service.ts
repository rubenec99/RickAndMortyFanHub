import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RatingService {
  private apiUrl = 'http://localhost:3000/user'; // Asegúrate de que esta URL coincida con la de tu backend

  constructor(private http: HttpClient) {}

  addRating(episodeId: number, rating: number): Observable<any> {
    const retrievedToken = localStorage.getItem('authToken');
    const url = `${this.apiUrl}/episodes/${episodeId}/ratings`;
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${retrievedToken}`
    );
    const body = { rating }; // Solo la calificación es enviada
    return this.http.post(url, body, { headers });
  }

  getRatingByUser(episodeId: number): Observable<any> {
    const retrievedToken = localStorage.getItem('authToken');
    const url = `${this.apiUrl}/episodes/${episodeId}/user-rating`;
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${retrievedToken}`
    );
    return this.http.get(url, { headers });
  }

  getAverageRating(episodeId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/episodes/${episodeId}/details`);
  }
}
