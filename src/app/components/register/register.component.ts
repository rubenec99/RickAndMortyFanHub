import { Component, ViewChild, ElementRef } from '@angular/core';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  @ViewChild('firstName') firstNameRef!: ElementRef;
  @ViewChild('lastName') lastNameRef!: ElementRef;
  @ViewChild('email') emailRef!: ElementRef;
  @ViewChild('username') usernameRef!: ElementRef;
  @ViewChild('password') passwordRef!: ElementRef;
  @ViewChild('birthDate') birthDateRef!: ElementRef;

  constructor(private userService: UserService) {}

  onSubmit() {
    const formData = {
      first_name: this.firstNameRef.nativeElement.value,
      last_name: this.lastNameRef.nativeElement.value,
      email: this.emailRef.nativeElement.value,
      username: this.usernameRef.nativeElement.value,
      password: this.passwordRef.nativeElement.value,
      birth_date: this.birthDateRef.nativeElement.value,
    };

    const isValid = Object.values(formData).every(
      (value) => !!value && value.trim().length > 0
    );

    if (isValid) {
      this.userService.registerUser(formData).subscribe(
        (response) => {
          if (response.success) {
            alert(response.success);
          } else {
            alert(response.error);
          }
        },
        (error) => {
          console.error('Error al registrar usuario:', error);
        }
      );
    } else {
      alert('Por favor, complete todos los campos correctamente.');
    }
  }
}
