import {Component, ElementRef, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import { SearchService } from '../search.service';
import { DetailsService } from '../details.service';
import { of } from 'rxjs/observable/of';
import {} from '@types/googlemaps';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css'],
})
export class ResultsComponent implements OnInit {
  @Output() onDetailsSearch = new EventEmitter();
  @Output() goBackToDetailsEvent = new EventEmitter();

  // @ViewChild('fakeMap') fakeMap: ElementRef;

  constructor(
    public searchService: SearchService,
    public detailsService: DetailsService
  ) { }

  ngOnInit() { }

  getNextPage() {
    this.searchService.getNextPageResults();
  }

  getPrevPage() {
    this.searchService.getPrevPageResults();
  }

  triggerDetailsSearch(id: number) {
    const placeId = this.searchService.searchResults['results'][id]['place_id'];
    this.onDetailsSearch.emit(placeId);
  }

  changeFavoStatus(id: number) {
    const place = this.searchService.searchResults['results'][id];
    const placeId = place['place_id'];
    if (localStorage.getItem(placeId)) {
      localStorage.removeItem(placeId);
    } else {
      const now = new Date();
      place.timestamp = now.getTime();
      place.addressSpecified = this.searchService.addressSpecified;
      console.log('Place stored:');
      console.log(place);
      localStorage.setItem(placeId, JSON.stringify(place));
    }
  }

  isFavorited(id: number) {
    const placeId = this.searchService.searchResults['results'][id]['place_id'];
    return localStorage.getItem(placeId) ? true : false;
  }

  goBackToDetails() {
    this.goBackToDetailsEvent.emit(null);
  }

}
