import { Component } from '@angular/core';

declare var bootstrap: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'RickAndMortyFanHub';
  modal: any;

  ngOnInit() {
    const modalElement = document.getElementById('loginModal');
    this.modal = new bootstrap.Modal(modalElement);
  }

  openLoginModal() {
    this.modal.show();
  }
}
