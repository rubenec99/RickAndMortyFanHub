import { Component } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { LoginComponent } from '../login/login.component';
import { RegisterComponent } from '../register/register.component';
import { LogoutComponent } from '../logout/logout.component';
import { ViewChild } from '@angular/core';

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
