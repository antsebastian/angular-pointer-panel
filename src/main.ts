import {importProvidersFrom} from '@angular/core';
import {AppComponent} from './app/app.component';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatBadgeModule} from '@angular/material/badge';
import {MatChipsModule} from '@angular/material/chips';
import {MatMenuModule} from '@angular/material/menu';
import {MatCardModule} from '@angular/material/card';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatListModule} from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import {provideAnimations} from '@angular/platform-browser/animations';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {bootstrapApplication, BrowserModule} from '@angular/platform-browser';


bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(BrowserModule, MatToolbarModule, MatButtonModule, MatIconModule, MatListModule, MatGridListModule, MatCardModule, MatMenuModule, MatChipsModule, MatBadgeModule, MatSlideToggleModule, MatTooltipModule, MatSnackBarModule),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations()
  ]
})
  .catch(err => console.error(err));
