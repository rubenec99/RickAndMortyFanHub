import { Component, OnInit } from '@angular/core';
import { CharactersService } from 'src/app/services/characters.service';
import { Character } from 'src/app/models/character.model';
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
  searchTerm: string = ''; // Término de búsqueda para filtrar todos los personajes

  constructor(
    private charactersService: CharactersService, // Inyecta el servicio de personajes
    public modalService: NgbModal // Inyecta el servicio de modales de Bootstrap
  ) {}

  ngOnInit(): void {
    this.loadCharacters(); // Carga los personajes al inicializar el componente
  }

  /**
   * Método para cargar los personajes y actualizar la lista de personajes.
   *
   * @returns void
   */
  loadCharacters(): void {
    // Llama al servicio "getAllCharacters" del servicio de personajes para obtener la lista de personajes de la página actual.
    this.charactersService
      .getAllCharacters(this.currentPage) // Obtiene personajes de la página actual
      .subscribe((response) => {
        // Suscribe para recibir la respuesta de la solicitud HTTP
        this.characters = response.results; // Almacena los personajes en la propiedad "characters"
        this.totalPages = response.info.pages; // Establece el total de páginas disponibles
      });
  }

  /**
   * Método para ir a la página siguiente de personajes.
   *
   * Si la página actual es menor que el total de páginas disponibles,
   * incrementa la página actual y recarga los personajes de la siguiente página.
   *
   * @returns void
   */
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++; // Incrementa la página actual
      this.loadCharacters(); // Recarga los personajes de la siguiente página
    }
  }

  /**
   * Método para ir a la página anterior de personajes.
   *
   * Si la página actual es mayor que 1, decrementa la página actual
   * y recarga los personajes de la página anterior.
   *
   * @returns void
   */
  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--; // Decrementa la página actual
      this.loadCharacters(); // Recarga los personajes de la página anterior
    }
  }

  /**
   * Método para abrir un modal con detalles de un personaje.
   *
   * @param character El personaje del que se mostrarán los detalles.
   * @param content El contenido del modal que se abrirá.
   * @returns void
   */
  openModal(character: Character, content: any): void {
    // Almacena el personaje seleccionado en "selectedCharacter"
    this.selectedCharacter = character;

    // Reinicia el arreglo de episodios
    this.episodes = [];

    // Obtiene los nombres de los episodios a través de sus URLs
    character.episode.forEach((episodeUrl) => {
      this.charactersService.getEpisode(episodeUrl).subscribe((episode) => {
        // Agrega el nombre del episodio al arreglo "episodes"
        this.episodes.push(episode.name);
      });
    });

    // Abre el modal con el contenido proporcionado y lo centra en la pantalla
    this.modalService.open(content, { centered: true });
  }

  /**
   * Método para realizar una búsqueda de personajes por nombre.
   *
   * @returns void
   */
  searchCharacters(): void {
    if (!this.searchTerm.trim()) {
      // Si el término de búsqueda está vacío, recargamos todos los personajes
      this.loadCharacters();
      return;
    }

    // Realiza una búsqueda de personajes por nombre utilizando el término de búsqueda
    this.charactersService
      .searchCharactersByName(this.searchTerm)
      .subscribe((response) => {
        // Actualiza la lista de personajes con los resultados de la búsqueda
        this.characters = response.results;
        // Actualiza el total de páginas disponibles
        this.totalPages = response.info.pages;
      });
  }
}
