import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { ValidationErrors } from '@angular/forms';

import { User } from '../models/user.model';
import {
  RegistrationData,
  RegistrationResponse,
  LoginData,
  LoginResponse,
} from '../models/user.model';

import { BehaviorSubject, Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:3000/user';

  private isLoggedInSubject = new BehaviorSubject<boolean>(false);

  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Registra un nuevo usuario en el sistema utilizando los datos proporcionados.
   *
   * @param {RegistrationData} formData Los datos del usuario que se utilizarán para el registro.
   * @returns {Observable<RegistrationResponse>} Un observable que emite una respuesta de registro.
   */
  registerUser(formData: RegistrationData): Observable<RegistrationResponse> {
    return this.http.post<RegistrationResponse>(
      `${this.apiUrl}/register`,
      formData
    );
  }

  /**
   * Comprueba si un nombre de usuario está siendo usada o está disponible.
   *
   * @param {string} username El nombre de usuario que se va a comprobar.
   * @returns {Observable<ValidationErrors | null>} Un observable que emite un objeto de errores si el nombre de usuario está tomado, o nulo si está disponible.
   */
  checkUsernameTaken(username: string): Observable<ValidationErrors | null> {
    return this.http
      .post<any>(`${this.apiUrl}/check-username`, { username })
      .pipe(map((res) => (res.exists ? { usernameTaken: true } : null)));
  }

  /**
   * Comprueba si una dirección de correo electrónico está siendo usada o está disponible.
   *
   * @param {string} email La dirección de correo electrónico que se va a comprobar.
   * @returns {Observable<ValidationErrors | null>} Un observable que emite un objeto de errores si la dirección de correo electrónico está tomada, o nulo si está disponible.
   */
  checkEmailTaken(email: string): Observable<ValidationErrors | null> {
    return this.http
      .post<any>(`${this.apiUrl}/check-email`, { email })
      .pipe(map((res) => (res.exists ? { emailTaken: true } : null)));
  }

  /**
   * Realiza una solicitud de inicio de sesión al servidor utilizando las credenciales proporcionadas.
   *
   * @param {LoginData} credentials Las credenciales de inicio de sesión del usuario.
   * @returns {Observable<LoginResponse>} Un observable que emite la respuesta del servidor después del intento de inicio de sesión.
   */
  loginUser(credentials: LoginData): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        map((response) => {
          // Procesa la respuesta del servidor, verifica si el inicio de sesión fue exitoso
          const token = response.token;

          if (token) {
            localStorage.setItem('authToken', token);

            // Emitir true en el BehaviorSubject para indicar que el usuario ha iniciado sesión
            this.isLoggedInSubject.next(true);

            return response; // Devuelve la respuesta original del servidor
          } else {
            return response;
          }
        })
      );
  }

  /**
   * Establece el token de autenticación en el almacenamiento local del navegador.
   *
   * @param {string} token El token de autenticación que se va a almacenar.
   */
  setToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  /**
   * Obtiene el token de autenticación del almacenamiento local y verifica si ha expirado.
   * Si el token ha expirado, cierra la sesión del usuario y devuelve null.
   *
   * @returns {string | null} El token de autenticación si aún es válido, o null si ha expirado.
   */
  getToken(): string | null {
    const retrievedToken = localStorage.getItem('authToken');
    const expiry = localStorage.getItem('tokenExpiry');

    const currentTime = new Date().getTime();

    // Verificar si el token ha expirado comparando el tiempo actual con el tiempo de expiración del token.
    if (currentTime > Number(expiry)) {
      // Si el token ha expirado, cerrar la sesión del usuario y devolver null.
      this.logoutUser();
      return null;
    }

    // Si el token aún es válido, devolverlo.
    return retrievedToken;
  }

  /**
   * Cierra la sesión del usuario eliminando los datos de autenticación y la información de la sesión
   * del almacenamiento local del navegador y establece isLoggedInSubject en false para indicar que
   * el usuario ha cerrado la sesión.
   */
  logoutUser(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('userType');
    localStorage.removeItem('username');
    localStorage.removeItem('user_id');

    // Establece isLoggedInSubject en false para indicar que el usuario ha cerrado la sesión
    this.isLoggedInSubject.next(false);
  }

  /**
   * Obtiene la fecha/hora de expiración del token de autenticación desde el almacenamiento local y la
   * convierte a un número. Retorna la fecha/hora de expiración como número si existe, o null si no se encuentra.
   *
   * @returns {number | null} La fecha/hora de expiración del token como número, o null si no se encuentra.
   */
  getTokenExpiry(): number | null {
    const expiry = localStorage.getItem('tokenExpiry');

    // Convertir la fecha/hora de expiración a número y retornarla.
    // Si no se encuentra, retornar null.
    return expiry ? parseInt(expiry, 10) : null;
  }

  /**
   * Verifica si el token de autenticación ha expirado comparando la fecha/hora actual
   * con la fecha/hora de expiración del token almacenada en el almacenamiento local.
   *
   * @returns {boolean} true si el token ha expirado, false si aún es válido o no existe.
   */
  tokenHasExpired(): boolean {
    const expiryTime = this.getTokenExpiry();

    // Si no hay fecha/hora de expiración, se asume que el token ha expirado.
    if (!expiryTime) {
      return true;
    }

    const currentTime = new Date().getTime();

    // Si la fecha/hora actual es mayor que la fecha/hora de expiración del token,
    // significa que el token ha expirado.
    if (currentTime > expiryTime) {
      return true;
    }

    // Si ninguna de las condiciones anteriores se cumple, el token aún es válido.
    return false;
  }

  /**
   * Verifica si el usuario ha iniciado sesión al comprobar la existencia del token de autenticación y
   * si el token ha expirado o no.
   *
   * @returns {boolean} true si el usuario ha iniciado sesión y el token es válido, false si no ha iniciado sesión o el token ha expirado.
   */
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (token && !this.tokenHasExpired()) {
      return true;
    }
    return false;
  }

  /**
   * Cambia el tipo de usuario de un usuario específico mediante una solicitud PUT.
   *
   * @param {number} userId El ID del usuario cuyo tipo se va a cambiar.
   * @param {string} newUserType El nuevo tipo de usuario que se asignará.
   * @returns {Observable<any>} Observable que representa la respuesta de la solicitud.
   */
  changeUserType(userId: number, newUserType: string): Observable<any> {
    const url = 'http://localhost:3000/user/update-type';

    const body = {
      userId: userId,
      newUserType: newUserType,
    };

    return this.http.put(url, body);
  }

  /**
   * Elimina un usuario específico mediante una solicitud DELETE.
   *
   * @param {number} userId El ID del usuario que se va a eliminar.
   * @returns {Observable<any>} Observable que representa la respuesta de la solicitud.
   */
  deleteUser(userId: number): Observable<any> {
    const url = `${this.apiUrl}/delete-user/${userId}`;

    return this.http.delete(url);
  }

  /**
   * Elimina múltiples usuarios a la vez mediante una solicitud POST.
   *
   * @param {number[]} userIds Un array de IDs de usuarios que se van a eliminar.
   * @returns {Observable<any>} Observable que representa la respuesta de la solicitud.
   */
  deleteMultipleUsers(userIds: number[]): Observable<any> {
    const endpoint = `${this.apiUrl}/delete-multiple`;
    return this.http.post(endpoint, { userIds });
  }

  /**
   * Obtiene una lista paginada de todos los usuarios disponibles.
   *
   * @param {number} page El número de página que se desea recuperar (por defecto 0).
   * @param {number} limit El número máximo de usuarios por página (por defecto 10).
   * @param {string} sortBy El campo por el cual se debe ordenar la lista (por defecto 'id').
   * @param {string} direction La dirección de la ordenación ('ASC' para ascendente o 'DESC' para descendente, por defecto 'ASC').
   * @returns {Observable<{ data: User[]; total: number }>} Observable que representa la respuesta de la solicitud, que incluye los datos de usuarios y el total de usuarios.
   */
  getAllUsers(
    page: number = 0,
    limit: number = 10,
    sortBy: string = 'id',
    direction: string = 'ASC'
  ): Observable<{ data: User[]; total: number }> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sortBy', sortBy)
      .set('direction', direction);

    return this.http.get<{ data: User[]; total: number }>(
      `${this.apiUrl}/all-users`,
      { params }
    );
  }

  /**
   * Obtiene información detallada de un usuario por su ID.
   *
   * @param {number} userId El ID del usuario que se desea obtener.
   * @returns {Observable<User>} Observable que representa la respuesta de la solicitud, que incluye los datos del usuario.
   */
  getUserById(userId: number): Observable<User> {
    const url = `http://localhost:3000/user/${userId}`;

    return this.http.get<User>(url);
  }

  /**
   * Obtiene el tipo de usuario actual mediante el token de autenticación.
   *
   * @returns {Observable<{ user_type: string }>} Observable que representa la respuesta de la solicitud, que incluye el tipo de usuario actual.
   * @throws {Error} Si el token no se encuentra en el almacenamiento local.
   */
  getUserType(): Observable<{ user_type: string }> {
    const token = this.getToken();

    if (!token) {
      throw new Error('Token no encontrado');
    }

    const headers = new HttpHeaders().set('Authorization', token);

    return this.http.get<{ user_type: string }>(`${this.apiUrl}/user-type`, {
      headers,
    });
  }

  /**
   * Obtiene el ID del usuario actual almacenado en localStorage.
   *
   * Este método busca en localStorage el valor asociado a la clave 'user_id'.
   * Si encuentra un valor, lo convierte de string a number y lo devuelve.
   * Si no encuentra un valor (es decir, el resultado es null), devuelve null.
   *
   * @returns {number | null} El ID del usuario como número si existe, de lo contrario null.
   */
  getCurrentUserId(): number | null {
    // Obtener el ID del usuario como string de localStorage
    const userIdString = localStorage.getItem('user_id');

    // Si userIdString no es null, convertirlo a número y devolverlo
    if (userIdString) {
      return Number(userIdString);
    }

    // Si userIdString es null, devolver null
    return null;
  }

  /**
   * Obtiene el perfil del usuario autenticado.
   *
   * @returns {Observable<User>} Observable que representa la respuesta de la solicitud, que incluye los datos del perfil del usuario.
   * @throws {Error} Si el token de autenticación no se encuentra en el almacenamiento local.
   */
  getProfile(): Observable<User> {
    let headers = new HttpHeaders();
    const token = this.getToken();

    // Si el token existe, agregarlo al encabezado 'Authorization' de la solicitud.
    if (token) {
      headers = headers.append('Authorization', token);
    } else {
      throw new Error('Token de autenticación no encontrado.');
    }

    return this.http.get<User>(`${this.apiUrl}/profile`, { headers });
  }

  /**
   * Actualiza el perfil del usuario.
   *
   * @param {User} user Los datos del usuario que se desean actualizar.
   * @returns {Observable<any>} Observable que representa la respuesta de la solicitud de actualización del perfil.
   */
  updateProfile(user: User): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.getToken()!,
    });

    return this.http.put(`${this.apiUrl}/update-profile`, user, { headers });
  }
}
