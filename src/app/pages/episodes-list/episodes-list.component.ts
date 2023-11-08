import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, throwError } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';

import { Episode } from 'src/app/models/episode.model';
import { Character } from 'src/app/models/character.model';

import { EpisodesService } from 'src/app/services/episodes.service';
import { CharactersService } from 'src/app/services/characters.service';
import { CommentService } from 'src/app/services/comments.service';
import { UserService } from 'src/app/services/user.service';
import { RatingService } from 'src/app/services/rating.service';

@Component({
  selector: 'app-episodes-list',
  templateUrl: './episodes-list.component.html',
  styleUrls: ['./episodes-list.component.css'],
})
export class EpisodesComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();

  episodes: Episode[] = [];
  allEpisodes: Episode[] = [];
  charactersOfEpisode: Character[] = [];
  uniqueSeasons: string[] = [];
  comments: any[] = [];

  errorMessage: string | null = null;
  commentText!: string;
  episodeId!: number;
  currentUserId: number | null = null;
  currentRating: number = 0;
  selectedRating: number = 0;
  selectedEpisode: Episode | null = null;

  currentPage: number = 1;
  totalPages: number = 0;
  seasonFilter: string = '';

  userRating: number | null = null;
  averageRating: number = 0;

  constructor(
    private episodesService: EpisodesService,
    private characterService: CharactersService,
    private commentService: CommentService,
    private userService: UserService,
    private ratingService: RatingService
  ) {}

  ngOnInit() {
    this.loadAllEpisodes();
    this.setCurrentUserId();
  }

  loadAllEpisodes(page: number = 1): void {
    this.episodesService
      .getAllEpisodes(page)
      .pipe(
        takeUntil(this.unsubscribe$),
        catchError((error) => {
          this.errorMessage =
            'Error al cargar los episodios. Intente nuevamente.';
          return throwError(() => error);
        })
      )
      .subscribe((response) => {
        this.allEpisodes = [...this.allEpisodes, ...response.results];
        this.totalPages = response.info.pages;

        if (response.info.next) {
          const nextPage = page + 1;
          this.loadAllEpisodes(nextPage);
        } else {
          this.episodes = [...this.allEpisodes];
          this.extractUniqueSeasons();
        }
      });
  }

  extractUniqueSeasons() {
    // Crea un conjunto (Set) para almacenar temporadas únicas
    const seasonsSet = new Set<string>();

    // Itera a través de todos los episodios en la lista
    this.allEpisodes.forEach((episode) => {
      // Extrae el código de temporada (por ejemplo, "Sxx" de "SxxExx")
      const seasonCode = episode.episode.slice(0, 3);

      // Agrega la temporada al conjunto (Set)
      seasonsSet.add(seasonCode);
    });

    // Convierte el conjunto (Set) en un arreglo y lo ordena en orden ascendente
    this.uniqueSeasons = Array.from(seasonsSet).sort();
  }

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

  openModal(episode: Episode): void {
    this.selectedEpisode = episode;
    this.episodeId = episode.id;
    this.initializeRating();

    const characterIds = episode.characters.map(
      (url) => +url.split('/').pop()!
    );

    this.characterService
      .getCharactersByIds(characterIds)
      .pipe(
        takeUntil(this.unsubscribe$),
        catchError((error) => {
          this.errorMessage =
            'Error al cargar los personajes. Intente nuevamente.';
          return throwError(() => error);
        })
      )
      .subscribe((characters) => {
        this.charactersOfEpisode = characters;
        // Abre la ventana modal aquí (Bootstrap se encargará de esto en el HTML)
      });

    // Ahora carga los comentarios para el episodio seleccionado.
    if (this.episodeId) {
      this.loadComments();
    }
  }

  trackByEpisodeId(index: number, episode: Episode): number {
    return episode.id;
  }

  submitComment(): void {
    if (!this.userService.isLoggedIn()) {
      alert('Debes iniciar sesión para comentar.');
      return;
    }

    const episodeId = this.selectedEpisode?.id;
    if (episodeId) {
      console.log(
        `Attempting to submit comment for episodeId: ${episodeId} with content: "${this.commentText}"`
      ); // Log the attempt
      this.commentService.addComment(episodeId, this.commentText).subscribe({
        next: (response: any) => {
          console.log('Comment submission response:', response); // Log the response
          this.commentText = '';
          this.loadComments();
        },
        error: (error: any) => {
          console.error('Comment submission error:', error); // Log any error
        },
      });
    } else {
      console.error('No episodeId found for comment submission.'); // Log if there's no episodeId
    }
    this.initializeRating();
  }

  loadComments(): void {
    if (!this.episodeId) {
      console.error('Episode ID is undefined, cannot load comments.');
      return;
    }
    this.commentService.getCommentsByEpisode(this.episodeId).subscribe({
      next: (response) => {
        this.comments = response.comments;
      },
      error: (err) => {
        console.error('Error fetching comments:', err);
      },
    });
  }

  deleteComment(commentId: number): void {
    // Confirmación para el usuario antes de eliminar el comentario
    if (
      !window.confirm('¿Estás seguro de que quieres eliminar este comentario?')
    ) {
      return;
    }

    this.commentService.deleteComment(commentId).subscribe({
      next: () => {
        console.log('Comentario eliminado con éxito');
        // Eliminar el comentario de la lista de comentarios en el frontend
        this.comments = this.comments.filter(
          (comment) => comment.id !== commentId
        );
      },
      error: (err) => {
        console.error('Error al eliminar el comentario:', err);
      },
    });
  }

  setCurrentUserId(): void {
    this.currentUserId = this.userService.getCurrentUserId(); // Suponiendo que este método te dé el ID del usuario logueado.
  }

  // Método para comprobar si el comentario pertenece al usuario logueado
  isUserComment(commentUserId: number): boolean {
    return this.currentUserId === commentUserId;
  }

  submitRating(): void {
    if (!this.userService.isLoggedIn()) {
      alert('Debes iniciar sesión para comentar.');
      return;
    }

    const episodeId = this.selectedEpisode?.id;
    if (episodeId) {
      console.log(`Submitting rating for episodeId: ${episodeId}`);
      this.ratingService.addRating(episodeId, this.currentRating).subscribe({
        next: (response: any) => {
          console.log('Rating submission response:', response);
          this.initializeRating();
        },
        error: (error: any) => {
          console.error('Rating submission error:', error);
        },
      });
    } else {
      console.error('No episodeId found for rating submission.');
    }
  }

  initializeRating(): void {
    if (this.selectedEpisode) {
      this.ratingService
        .getAverageRating(`${this.selectedEpisode.id}`)
        .subscribe({
          next: (response: any) => {
            this.averageRating = response.averageRating
              ? parseFloat(response.averageRating)
              : 0;
            console.log('Average rating:', this.averageRating);
          },
          error: (error: any) => {
            console.error('Error fetching average rating:', error);
            this.averageRating = 0;
          },
        });

      // Obtén la calificación del usuario si está logueado
      if (this.userService.isLoggedIn()) {
        this.ratingService.getRatingByUser(this.selectedEpisode.id).subscribe({
          next: (userRatingResponse: any) => {
            this.userRating = userRatingResponse.rating
              ? parseFloat(userRatingResponse.rating)
              : null;
            // Si el usuario ya calificó el episodio, usa esa calificación, de lo contrario muestra las estrellas vacías
            this.currentRating = this.userRating !== null ? this.userRating : 0;
          },
          error: (error: any) => {
            console.error('Error fetching user rating:', error);
            this.userRating = null;
            this.currentRating = 0;
          },
        });
      }
    } else {
      console.error('No episode selected to fetch ratings.');
      this.currentRating = 0;
      this.averageRating = 0;
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
