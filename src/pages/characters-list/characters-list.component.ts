import { Component, OnInit } from '@angular/core';
import { CharactersService } from 'src/app/services/characters.service';
import { Character } from 'src/models/character.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'; // Importa el módulo de Bootstrap para modales

@Component({
  selector: 'app-characters-list',
  templateUrl: './characters-list.component.html',
  styleUrls: ['./characters-list.component.css'],
})
export class CharactersListComponent implements OnInit {
  characters: Character[] = []; // Almacena los personajes obtenidos de la API
  episodes: string[] = []; // Almacena los nombres de los episodios de un personaje
  currentPage: number = 1; // Página actual de personajes
  totalPages: number = 0; // Total de páginas disponibles
  selectedCharacter: any; // Almacena el personaje seleccionado

  constructor(
    private charactersService: CharactersService, // Inyecta el servicio de personajes
    public modalService: NgbModal // Inyecta el servicio de modales de Bootstrap
  ) {}

  ngOnInit(): void {
    this.loadCharacters(); // Carga los personajes al inicializar el componente
  }

  loadCharacters(): void {
    // Método para cargar los personajes de la API
    this.charactersService
      .getAllCharacters(this.currentPage) // Obtiene personajes de la página actual
      .subscribe((response) => {
        // Suscribe para recibir la respuesta de la solicitud HTTP
        this.characters = response.results; // Almacena los personajes en la propiedad "characters"
        this.totalPages = response.info.pages; // Establece el total de páginas disponibles
      });
  }

  nextPage(): void {
    // Método para ir a la página siguiente de personajes
    if (this.currentPage < this.totalPages) {
      this.currentPage++; // Incrementa la página actual
      this.loadCharacters(); // Recarga los personajes de la siguiente página
    }
  }

  prevPage(): void {
    // Método para ir a la página anterior de personajes
    if (this.currentPage > 1) {
      this.currentPage--; // Decrementa la página actual
      this.loadCharacters(); // Recarga los personajes de la página anterior
    }
  }

  openModal(character: Character, content: any): void {
    // Método para abrir un modal con detalles de un personaje
    this.selectedCharacter = character; // Almacena el personaje seleccionado en "selectedCharacter"

    // Reinicia el arreglo de episodios
    this.episodes = [];

    // Obtiene los nombres de los episodios a través de sus URLs
    character.episode.forEach((episodeUrl) => {
      this.charactersService.getEpisode(episodeUrl).subscribe((episode) => {
        this.episodes.push(episode.name); // Agrega el nombre del episodio al arreglo "episodes"
      });
    });

    // Abre el modal con el contenido proporcionado
    this.modalService.open(content, { centered: true });
  }
}
