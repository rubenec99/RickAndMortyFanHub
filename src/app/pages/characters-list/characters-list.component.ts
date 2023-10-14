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
  selectedGender: string = ''; // Almacena el género seleccionado

  /**
   * Arreglos utilizados para almacenar los géneros, estados (status) y especies únicos disponibles en la lista de personajes.
   * Estas propiedades se utilizan para mostrar opciones de filtro y realizar búsquedas avanzadas.
   */
  allGenders: string[] = [];
  allStatuses: string[] = [];
  selectedStatus: string = '';
  allSpecies: string[] = [];
  selectedSpecies: string = '';

  constructor(
    private charactersService: CharactersService, // Inyecta el servicio de personajes
    public modalService: NgbModal // Inyecta el servicio de modales de Bootstrap
  ) {}

  ngOnInit(): void {
    this.loadCharacters(); // Carga los personajes al inicializar el componente
    this.loadAllFilterValues();
  }

  /**
   * Método para cargar los valores únicos de género, estado y especie de todos los personajes.
   * Se utiliza para obtener las opciones disponibles para los filtros.
   *
   * @returns void
   */
  loadAllFilterValues(): void {
    this.charactersService.getAllCharactersFull().subscribe((characters) => {
      // Obtiene los valores únicos de género, estado y especie de todos los personajes
      this.allGenders = Array.from(
        new Set(characters.map((char) => char.gender))
      );
      this.allStatuses = Array.from(
        new Set(characters.map((char) => char.status))
      );
      this.allSpecies = Array.from(
        new Set(characters.map((char) => char.species))
      );
    });
  }

  /**
   * Método para cargar los personajes de la API.
   *
   * Obtiene los personajes de la página actual, aplicando los filtros seleccionados
   * por género, estado y especie si se han especificado.
   *
   * @returns void
   */
  loadCharacters(): void {
    this.charactersService
      .getAllCharacters(
        this.currentPage,
        this.selectedGender,
        this.selectedStatus,
        this.selectedSpecies
      )
      .subscribe((response) => {
        // Actualiza la lista de personajes con la respuesta de la API
        this.characters = response.results;

        // Actualiza el número total de páginas disponibles
        this.totalPages = response.info.pages;
      });
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

  /**
   * Método para manejar el cambio en el filtro de género.
   *
   * @param gender El nuevo género seleccionado.
   */
  onGenderChange(gender: string): void {
    this.selectedGender = gender; // Actualiza el género seleccionado
    this.loadCharacters(); // Vuelve a cargar los personajes con el nuevo filtro aplicado
  }

  /**
   * Método para manejar el cambio en el filtro de estado (status).
   *
   * @param selectedStatus El nuevo estado (status) seleccionado.
   */
  onStatusChange(selectedStatus: string): void {
    this.currentPage = 1; // Resetea la página al cambiar el filtro de estado
    this.loadCharacters(); // Vuelve a cargar los personajes con el nuevo filtro de estado aplicado
  }

  /**
   * Método para manejar el cambio en el filtro de especie (species).
   *
   * @param selectedSpecies La nueva especie (species) seleccionada.
   */
  onSpeciesChange(selectedSpecies: string): void {
    this.currentPage = 1; // Resetea la página al cambiar el filtro de especie
    this.loadCharacters(); // Vuelve a cargar los personajes con el nuevo filtro de especie aplicado
  }

  /**
   * Método para restablecer todos los filtros y valores de búsqueda a sus valores predeterminados.
   * Esto incluye restablecer el término de búsqueda, género, estado (status) y especie (species).
   * También se restablece la página a la primera página y se recargan los personajes.
   */
  resetFilters(): void {
    this.searchTerm = ''; // Restablece el término de búsqueda
    this.selectedGender = ''; // Restablece el género
    this.selectedStatus = ''; // Restablece el estado (status)
    this.selectedSpecies = ''; // Restablece la especie (species)
    this.currentPage = 1; // Resetea la página al valor predeterminado (primera página)
    this.loadCharacters(); // Vuelve a cargar la lista de personajes con los valores de filtro restablecidos
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
}
