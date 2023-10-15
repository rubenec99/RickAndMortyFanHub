import { Component, OnInit } from '@angular/core';
import { EpisodesService } from 'src/app/services/episodes.service';
import { Episode } from 'src/app/models/episode.model';
import { Character } from 'src/app/models/character.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-episodes-list',
  templateUrl: './episodes-list.component.html',
  styleUrls: ['./episodes-list.component.css'],
})
export class EpisodesComponent implements OnInit {
  episodes: Episode[] = []; // Lista de episodios que se mostrarán en la vista actual
  currentPage: number = 1; // Página actual en la que se encuentra el usuario
  totalPages: number = 0; // Número total de páginas disponibles con base en el número de episodios
  seasonFilter: string = ''; // Filtro seleccionado por el usuario para ver una temporada específica
  allEpisodes: Episode[] = []; // Episodios recuperados de la API, se utilizan para filtrar
  selectedEpisode: Episode | null = null; // Episodio seleccionado para mostrar en la modal
  charactersOfEpisode: Character[] = []; // Personajes del episodio seleccionado

  constructor(private episodesService: EpisodesService) {}

  ngOnInit(): void {
    this.loadAllEpisodes();
  }

  /**
   * Método para cargar todos los episodios de la API con paginación opcional.
   *
   * @param page (Opcional) El número de página que se desea recuperar. Por defecto, es la página 1.
   * @returns void
   */
  loadAllEpisodes(page: number = 1): void {
    this.episodesService.getAllEpisodes(page).subscribe((response) => {
      this.allEpisodes = [...this.allEpisodes, ...response.results];
      this.totalPages = response.info.pages;

      if (response.info.next) {
        const nextPage = page + 1;
        this.loadAllEpisodes(nextPage); // Carga los episodios de la siguiente página de forma recursiva
      } else {
        this.episodes = [...this.allEpisodes];
      }
    });
  }

  /**
   * Método para filtrar los episodios por temporada.
   *
   * Si se proporciona un filtro de temporada, se muestran solo los episodios que comienzan con ese número de temporada.
   * Si no se proporciona ningún filtro, se muestran todos los episodios disponibles.
   *
   * @returns void
   */
  filterBySeason(): void {
    if (this.seasonFilter) {
      // Filtra los episodios que comienzan con el número de temporada especificado
      this.episodes = this.allEpisodes.filter((episode) =>
        episode.episode.startsWith(this.seasonFilter)
      );
    } else {
      // Si no se proporciona un filtro, muestra todos los episodios
      this.episodes = [...this.allEpisodes];
    }
  }

  /**
   * Abre la ventana modal y carga los detalles del personaje para el episodio seleccionado.
   *
   * @param episode - El episodio seleccionado.
   */
  openModal(episode: Episode): void {
    this.selectedEpisode = episode;

    // Obtener detalles de cada personaje del episodio
    const characterRequests = episode.characters.map((url) =>
      this.episodesService.getCharacter(url)
    );

    forkJoin(characterRequests).subscribe((characters) => {
      this.charactersOfEpisode = characters;
      // Abre la ventana modal aquí (Bootstrap se encargará de esto en el HTML)
    });
  }
}
