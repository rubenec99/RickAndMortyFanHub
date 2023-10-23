import { Component } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { LoginData } from 'src/app/models/user.model';
import { Router } from '@angular/router';

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
          // Almacenar el token
          this.userService.setToken(response.token!);
          // Navegar a la página de inicio
          this.router.navigate(['/characters']); // Asume que '/home' es tu ruta de inicio
        } else if (response.error) {
          // Muestra el error al usuario.
          console.log('Incorrecto');
        }
      },
      (error) => {
        console.error('Error al iniciar sesión:', error);
      }
    );
  }
}
