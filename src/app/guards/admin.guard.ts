import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';

import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { UserService } from '../services/user.service';

import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.userService.getUserType().pipe(
      map((response) => {
        if (response.user_type === 'admin') {
          return true;
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'No tienes permiso para acceder a esta página!',
          });
          this.router.navigate(['/home']);
          return false;
        }
      }),
      catchError((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Ocurrió un error al verificar tus permisos. Por favor intenta de nuevo.',
        });
        this.router.navigate(['/home']);
        return of(false);
      })
    );
  }
}
