import { Component, OnInit } from '@angular/core';
import { CharactersService } from 'src/app/services/characters.service'; // Importa el servicio para obtener datos de personajes
import { Character } from 'src/models/character.model'; // Importa el modelo de personaje

@Component({
  selector: 'app-characters-list',
  templateUrl: './characters-list.component.html',
  styleUrls: ['./characters-list.component.css'],
})
export class CharactersListComponent implements OnInit {
  characters: Character[] = []; // Array para almecenar los personajes
  currentPage: number = 1;
  totalPages: number = 0;

  constructor(private charactersService: CharactersService) {}

  ngOnInit(): void {
    this.loadCharacters();
  }

  // Método para cargar los personajes desde el servicio
  loadCharacters(): void {
    this.charactersService
      .getAllCharacters(this.currentPage) // Llama al servicio para obtener personajes de la página actual
      .subscribe((response) => {
        this.characters = response.results; // Asigna los personajes recibidos a la variable characters
        this.totalPages = response.info.pages; // Obtiene el número total de páginas
      });
  }

  // Método para avanzar a la siguiente página
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++; // Incrementa el número de página actual
      this.loadCharacters(); // Carga los personajes de la siguiente página
    }
  }

  // Método para retroceder a la página anterior
  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--; // Decrementa el número de página actual
      this.loadCharacters(); // Carga los personajes de la página anterior
    }
  }
}
