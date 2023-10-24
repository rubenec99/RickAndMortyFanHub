import { Component } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { LoginData } from 'src/app/models/user.model';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginData: LoginData = {
    username: '',
    password: '',
  };

  constructor(private userService: UserService, private router: Router) {}

  onLogin(event: Event) {
    event.preventDefault();
    this.userService.loginUser(this.loginData).subscribe(
      (response) => {
        if (response.success) {
          this.userService.setToken(response.token!);
          this.router.navigate(['/characters']);
          // Informamos al usuario que ha iniciado sesión correctamente
          Swal.fire(
            '¡Bienvenido!',
            'Has iniciado sesión correctamente.',
            'success'
          );
        } else if (response.error) {
          // Informamos al usuario que las credenciales no son correctas
          Swal.fire('Error', 'Usuario o contraseña incorrectos.', 'error');
        }
      },
      (error) => {
        console.error('Error al iniciar sesión:', error);
        /// Informamos al usuario que las credenciales no son correctas
        Swal.fire('Error', 'Usuario o contraseña incorrectos.', 'error');
      }
    );
  }
}
