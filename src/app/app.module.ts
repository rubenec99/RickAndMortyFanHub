import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http'; // Necesario para realizar solicitudes HTTP
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CharactersComponent } from './pages/characters-list/characters-list.component';
import { EpisodesComponent } from './pages/episodes-list/episodes-list.component';
import { CharactersService } from './services/characters.service';
import { HeaderComponent } from './components/header/header.component';
import { LocationsComponent } from './pages/locations-list/locations-list.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';

@NgModule({
  declarations: [
    AppComponent,
    CharactersComponent,
    HeaderComponent,
    EpisodesComponent,
    LocationsComponent,
    LoginComponent,
    RegisterComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule, // Importa el módulo HttpClientModule
    NgbModule,
    NgbDropdownModule,
    FormsModule,
    ReactiveFormsModule,
    NgbToastModule,
  ],
  providers: [CharactersService], // Proporciona el servicio CharactersService
  bootstrap: [AppComponent],
})
export class AppModule {}
