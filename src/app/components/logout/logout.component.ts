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
   * Muestra una ventana de confirmación para que el usuario pueda confirmar su intención de cerrar sesión.
   * En caso afirmativo, muestra una notificación de éxito y procede a ejecutar la función `onLogout`
   */
  confirmLogout() {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas cerrar sesión?',
      icon: 'warning',
      showCancelButton: true,
      iconColor: '#FFD83D',
      confirmButtonColor: '#8EDD3A',
      cancelButtonColor: '#FF4565',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Cerrando...',
          text: 'Has cerrado sesión correctamente.',
          icon: 'success',
          iconColor: '#A8FF44',
          confirmButtonColor: '#00BCD4',
        }).then(() => {
          this.onLogout();
        });
      }
    });
  }

  /**
   * Cierra la sesión del usuario actual y redirige a la página de personajes.
   */
  private onLogout() {
    this.userService.logoutUser();
    this.router.navigate(['/home']);
  }
}
