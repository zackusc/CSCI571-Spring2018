import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule, Routes } from '@angular/router';

import { ResultsComponent } from './results/results.component';
import { PlaceDetailsComponent } from './place-details/place-details.component';
import { InfoComponent } from './info/info.component';
import {PhotosComponent} from './photos/photos.component';
import {MapComponent} from './map/map.component';
import {ReviewsComponent} from './reviews/reviews.component';
import {DetailsResolverService} from './details-resolver.service';

const routes: Routes = [
  { path: '', redirectTo: '/results', pathMatch: 'full'},
  { path: 'results', component: ResultsComponent },
  { path: 'details/:id',
    component: PlaceDetailsComponent,
    resolve: { cdet: DetailsResolverService }

    // children: [
    //   { path: '', redirectTo: 'info', pathMatch: 'full'},
    //   {
    //     path: 'info',
    //     component: InfoComponent,
    //     resolve: { cdet: DetailsResolverService }
    //   },
    //   { path: 'photos', component: PhotosComponent },
    //   { path: 'map', component: MapComponent },
    //   { path: 'reviews', component: ReviewsComponent }
    // ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ],
  declarations: [],
  exports: [ RouterModule ],
  providers: [ DetailsResolverService ]
})
export class AppRoutingModule { }
