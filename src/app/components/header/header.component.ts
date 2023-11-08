import { Component, ViewChild } from '@angular/core';

import { LoginComponent } from '../login/login.component';
import { RegisterComponent } from '../register/register.component';
import { LogoutComponent } from '../logout/logout.component';

import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  @ViewChild('loginComponent') loginComponent!: LoginComponent;
  @ViewChild('registerComponent') registerComponent!: RegisterComponent;
  @ViewChild('logoutComponent') logoutComponent!: LogoutComponent;

  constructor(public userService: UserService) {}

  /**
   * La función "isLogged" comprueba si un usuario ha iniciado sesión verificando si existe un token.
   * @returns Se devuelve un valor booleano.
   */
  isLogged(): boolean {
    return this.userService.getToken() !== null;
  }

  /**
   * La función verifica si el usuario es administrador comparando el valor de 'userType' en localStorage
   * con 'admin'.
   * @returns Se devuelve un valor booleano.
   */
  isAdmin(): boolean {
    return localStorage.getItem('userType') === 'admin';
  }
}
