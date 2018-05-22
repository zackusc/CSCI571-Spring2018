import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { HttpClientModule } from '@angular/common/http';


import { AppComponent } from './app.component';
import { ResultsComponent } from './results/results.component';
import { SearchService } from './search.service';
import { AppRoutingModule } from './/app-routing.module';
import { PlaceDetailsComponent } from './place-details/place-details.component';
import { InfoComponent } from './info/info.component';
import { PhotosComponent } from './photos/photos.component';
import { MapComponent } from './map/map.component';
import { ReviewsComponent } from './reviews/reviews.component';
import { DetailsService } from './details.service';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FavoritesComponent } from './favorites/favorites.component';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { OpenHoursComponent } from './open-hours/open-hours.component';


@NgModule({
  declarations: [
    AppComponent,
    ResultsComponent,
    PlaceDetailsComponent,
    InfoComponent,
    PhotosComponent,
    MapComponent,
    ReviewsComponent,
    FavoritesComponent,
    OpenHoursComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    // AppRoutingModule,
    NgbModule.forRoot(),
    BrowserAnimationsModule
  ],
  providers: [SearchService, DetailsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
