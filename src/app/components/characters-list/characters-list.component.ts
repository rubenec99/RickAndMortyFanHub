import { Component, OnInit } from '@angular/core';
import { CharactersService } from 'src/app/services/characters.service'; // Importa el servicio para obtener datos de personajes
import { Character } from 'src/models/character.model'; // Importa el modelo de personaje

@Component({
  selector: 'app-characters-list',
  templateUrl: './characters-list.component.html',
  styleUrls: ['./characters-list.component.css'],
})
export class CharactersListComponent implements OnInit {
  characters: Character[] = []; // Array para almacenar los personajes

  constructor(private charactersService: CharactersService) {}

  ngOnInit(): void {
    // En el evento OnInit, se llama al servicio para obtener todos los personajes
    this.charactersService.getAllCharacters().subscribe((data) => {
      // Cuando se completa la solicitud, se asignan los resultados al array 'characters'
      this.characters = data.results;
    });
  }
}
