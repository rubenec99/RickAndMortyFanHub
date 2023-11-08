import { Component, OnInit } from '@angular/core';
import { CharactersService } from 'src/app/services/characters.service';
import { Character } from 'src/app/models/character.model';
import { TriviaQuestion } from 'src/app/models/trivia-question.model';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  triviaQuestions: TriviaQuestion[] = [
    {
      question: '¿Cuál es el nombre completo de Morty?',
      options: [
        'Mortimer Smith',
        'Morty Sanchez',
        'Morty Smith',
        'Morty Johnson',
      ],
      answer: 2,
    },
    {
      question: '¿Qué le gusta beber constantemente a Rick?',
      options: ['Agua', 'Vino', 'Cerveza', 'Whisky de cristales'],
      answer: 3,
    },
    {
      question:
        '¿Cómo se llama la "nieta" robot que Rick crea para Morty en el episodio "El cuadro de los recuerdos"?',
      options: ['Jessica', 'Lucy', 'Stacy', 'Gwendolyn'],
      answer: 3,
    },
    {
      question:
        '¿Qué animal se enfrenta a Rick y Morty en el episodio "Meeseeks y Destroy"?',
      options: ['Un dragón', 'Un gigante', 'Un unicornio', 'Un grifo'],
      answer: 1,
    },
    {
      question: '¿En qué episodio Morty se convierte en un coche?',
      options: [
        'Intercambio de cuerpos',
        'Pickle Rick',
        'El cuadro de los recuerdos',
        'Ajuste de cuentas por cable 2: Tentación del sofá',
      ],
      answer: 3,
    },
    {
      question: '¿Cómo se llama el amigo del instituto de Morty?',
      options: ['Brad', 'Chad', 'Tad', 'Jerry'],
      answer: 0,
    },
    {
      question: '¿Cuál es el nombre de la esposa de Jerry?',
      options: ['Beth', 'Summer', 'Jessica', 'Diane'],
      answer: 0,
    },
    {
      question: '¿Qué animal representa al personaje "Birdperson"?',
      options: ['Loro', 'Aguila', 'Cuervo', 'Pingüino'],
      answer: 1,
    },
    {
      question: '¿Qué objeto usa Rick para viajar entre dimensiones?',
      options: [
        'Anillo Dimensional',
        'Pistola Portal',
        'Máquina del Tiempo',
        'Teletransportador',
      ],
      answer: 1,
    },
    {
      question: '¿Cuál es el trabajo de Beth en su realidad principal?',
      options: [
        'Profesora',
        'Veterinaria de caballos',
        'Doctora',
        'Científica',
      ],
      answer: 1,
    },
    {
      question:
        '¿Cómo se llama el parque de atracciones dentro de un cuerpo humano?',
      options: ['Microverse', 'Anatomy Park', 'Innerspace', 'Micro Park'],
      answer: 1,
    },
    {
      question: '¿Qué bebida alcohólica prefiere Rick?',
      options: ['Whisky', 'Ron', 'Vodka', 'Cerveza'],
      answer: 2,
    },
    {
      question:
        '¿Cuál es el nombre del planeta que posee el atardecer más largo de la galaxia?',
      options: ['Purgenol-5', 'Blitz and Chitz', 'Planetina', 'Squanch'],
      answer: 0,
    },
    {
      question: '¿Con quién se casó Birdperson?',
      options: ['Tammy', 'Beth', 'Summer', 'Jessica'],
      answer: 0,
    },
    {
      question:
        '¿Cuál es el nombre del episodio donde Morty se convierte en un auto?',
      options: [
        'The Rickturian Mortydate',
        'Mortynight Run',
        'MortyCar',
        'The Ricks Must Be Crazy',
      ],
      answer: 1,
    },
    {
      question: '¿Qué juego juegan Rick y Morty en "Blips & Chitz"?',
      options: [
        'Plumbus Adventure',
        'Flappy Birdperson',
        'Roy: A Life Well Lived',
        'Interdimensional Chess',
      ],
      answer: 2,
    },
  ];
  answerStatus: boolean[] = [];
  feedbackMessage: string = '';
  displayedQuestions: TriviaQuestion[] = [];
  correctAnswersCount = 0; // Número de respuestas correctas
  showProgressBar: boolean = false;

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

  ngOnInit(): void {
    this.charactersService.getRandomFiveCharacters().subscribe({
      next: (characters) => {
        if (Array.isArray(characters) && characters.length) {
          // Ensure we only assign the first five characters to the component's property
          this.characters = characters.slice(0, 5);
        }
      },
      error: (error) => console.error('Error fetching characters', error),
    });

    // Obtener un conjunto de preguntas al azar
    this.getRandomQuestions();
  }

  /**
   * Verifica todas las respuestas seleccionadas y muestra una barra de progreso con la cantidad de respuestas correctas.
   */
  checkAllAnswers(): void {
    this.correctAnswersCount = 0;
    this.answerStatus = []; // Reiniciar el estado de las respuestas

    this.displayedQuestions.forEach((question, index) => {
      const selectedOption = (
        document.querySelector(
          `input[name="trivia-${index}"]:checked`
        ) as HTMLInputElement
      )?.value;

      if (selectedOption && +selectedOption === question.answer) {
        this.correctAnswersCount++;
        this.answerStatus.push(true); // Respuesta correcta
      } else {
        this.answerStatus.push(false); // Respuesta incorrecta
      }
    });

    this.generateFeedbackMessage();
    this.showProgressBar = true;
  }

  /**
   * Genera un mensaje de retroalimentación basado en la cantidad de respuestas correctas.
   */
  private generateFeedbackMessage(): void {
    if (this.correctAnswersCount === 0) {
      this.feedbackMessage = `¡No has respondido correctamente ninguna pregunta!`;
    } else {
      this.feedbackMessage = `¡Has respondido correctamente a ${this.correctAnswersCount} de ${this.displayedQuestions.length} preguntas!`;
    }
  }

  /**
   * Obtiene un conjunto aleatorio de preguntas de la lista completa de preguntas de trivia.
   */
  getRandomQuestions(): void {
    const shuffledQuestions = this.triviaQuestions.sort(
      () => 0.5 - Math.random()
    );
    this.displayedQuestions = shuffledQuestions.slice(0, 5);
  }

  /**
   * @returns El porcentaje de respuestas correctas.
   */
  getProgressPercentage(): number {
    return (this.correctAnswersCount / this.displayedQuestions.length) * 100;
  }

  getUsername(): string {
    return localStorage.getItem('username') || 'Usuario';
  }
}
