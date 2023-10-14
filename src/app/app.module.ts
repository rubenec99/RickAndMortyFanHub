import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http'; // Necesario para realizar solicitudes HTTP
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CharactersListComponent } from './pages/characters-list/characters-list.component';
import { CharactersService } from './services/characters.service';
import { HeaderComponent } from './components/header/header.component';

@NgModule({
  declarations: [AppComponent, CharactersListComponent, HeaderComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule, // Importa el módulo HttpClientModule
    NgbModule,
    NgbDropdownModule,
    FormsModule,
  ],
  providers: [CharactersService], // Proporciona el servicio CharactersService
  bootstrap: [AppComponent],
})
export class AppModule {}
