import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http'; // Necesario para realizar solicitudes HTTP
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { DatePipe } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CharactersComponent } from './pages/characters-list/characters-list.component';
import { EpisodesComponent } from './pages/episodes-list/episodes-list.component';
import { CharactersService } from './services/characters.service';
import { HeaderComponent } from './components/header/header.component';
import { LocationsComponent } from './pages/locations-list/locations-list.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AdminPanelComponent } from './pages/admin-panel/admin-panel.component';
import { HomeComponent } from './pages/home/home.component';
import { EditProfileComponent } from './pages/edit-profile/edit-profile.component';
import { StarComponent } from './components/star/star.component';
import { RatingComponent } from './components/rating/rating.component';
import { MinigamesComponent } from './pages/minigames/minigames.component';
import { FooterComponent } from './components/footer/footer.component';
import { AboutUsComponent } from './pages/about-us/about-us.component';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { LegalWarningComponent } from './pages/legal-warning/legal-warning.component';
import { LogoutComponent } from './components/logout/logout.component';

@NgModule({
  declarations: [
    AppComponent,
    CharactersComponent,
    HeaderComponent,
    EpisodesComponent,
    LocationsComponent,
    LoginComponent,
    RegisterComponent,
    AdminPanelComponent,
    HomeComponent,
    EditProfileComponent,
    StarComponent,
    RatingComponent,
    MinigamesComponent,
    FooterComponent,
    AboutUsComponent,
    PrivacyPolicyComponent,
    LegalWarningComponent,
    LogoutComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule, // Importa el módulo HttpClientModule
    NgbModule,
    NgbDropdownModule,
    FormsModule,
    ReactiveFormsModule,
    SweetAlert2Module,
  ],
  providers: [CharactersService, DatePipe], // Proporciona el servicio CharactersService
  bootstrap: [AppComponent],
})
export class AppModule {}
