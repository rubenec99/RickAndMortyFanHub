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
  constructor(public userService: UserService) {}

  @ViewChild('loginComponent') loginComponent!: LoginComponent;
  @ViewChild('registerComponent') registerComponent!: RegisterComponent;
  @ViewChild('logoutComponent') logoutComponent!: LogoutComponent;

  isLogged(): boolean {
    return this.userService.getToken() !== null;
  }
}
