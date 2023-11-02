import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { UserService } from 'src/app/services/user.service';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css'],
})
export class LogoutComponent {
  constructor(private userService: UserService, private router: Router) {}

  /**
   * Muestra un mensaje de confirmación para verificar si el usuario realmente desea cerrar la sesión.
   */
  confirmLogout() {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas cerrar sesión?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.onLogout();
      }
    });
  }

  /**
   * Cierra la sesión del usuario actual y redirige a la página de personajes.
   */
  private onLogout() {
    this.userService.logoutUser();
    this.router.navigate(['/characters']);
  }
}
