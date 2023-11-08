import { Component, OnInit } from '@angular/core';

import { Character } from 'src/app/models/character.model';

import { CharactersService } from 'src/app/services/characters.service';
import { UserService } from 'src/app/services/user.service';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  characters: Character[] = [];

  isUserLoggedIn = false; // Por defecto

  constructor(
    private charactersService: CharactersService,
    public userService: UserService
  ) {
    if (this.userService.isLoggedIn()) {
      this.isUserLoggedIn = true;
    } else {
      this.isUserLoggedIn = false;
    }
  }

  /**
   * Se ejecuta al inicializar el componente.
   * Realiza una llamada al servicio para obtener cinco personajes aleatorios.
   * Muestra un mensaje de error en caso de que la llamada al servicio falle.
   */
  ngOnInit(): void {
    // Llama al servicio de personajes para obtener cinco personajes aleatorios.
    this.charactersService.getRandomFiveCharacters().subscribe({
      next: (characters) => {
        // Verifica si la respuesta es un array y tiene elementos.
        if (Array.isArray(characters) && characters.length) {
          // Si es así, toma solo los primeros cinco personajes y los asigna a la propiedad 'characters' del componente.
          this.characters = characters.slice(0, 5);
        }
      },
      error: () => {
        // Si ocurre un error durante la llamada al servicio, muestra un mensaje de error con SweetAlert.
        Swal.fire({
          title: '¡Error!',
          text: 'Ha ocurrido un error al intentar obtener los personajes. Por favor, inténtelo de nuevo más tarde.',
          icon: 'error',
          iconColor: '#FF4565',
          confirmButtonColor: '#00BCD4',
        });
      },
    });
  }

  /**
   * Obtiene el nombre de usuario almacenado en el almacenamiento local del navegador.
   * Si no se encuentra un nombre de usuario, devuelve el string 'Usuario' como valor predeterminado.
   *
   * @returns {string} El nombre de usuario recuperado o 'Usuario' si no se encuentra en el almacenamiento local.
   */
  getUsername(): string {
    return localStorage.getItem('username') || 'Usuario';
  }
}
