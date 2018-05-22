import {Component, OnInit, Output, EventEmitter} from '@angular/core';
import {DetailsService} from '../details.service';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent implements OnInit {
  activePageNum = 1;
  pageMaxLength = 20;

  @Output() detailsRequest = new EventEmitter();
  @Output() goBackToDetailsEvent = new EventEmitter();

  constructor(
    public detailsService: DetailsService
  ) { }

  ngOnInit() {
  }

  getStorageLength() {
    return localStorage.length;
  }

  getSortedFavorites() {
    let results = Object.keys(localStorage).map(function(key) {
      return JSON.parse(localStorage.getItem(key));
    });
    results = results.sort( (a, b) => {
      return a['timestamp'] - b['timestamp'];
    });
    return results;
  }

  removeFromFavorites(placeId) {
    console.log(JSON.parse(localStorage.getItem(placeId)));
    localStorage.removeItem(placeId);
  }

  triggerDetailsSearch(result) {
    const placeId = result.place_id;
    const out = {
      place_id: placeId,
      address: result.addressSpecified
    };
    this.detailsRequest.emit(out);
  }

  onReturnToDetails() {
    this.goBackToDetailsEvent.emit(null);
  }

  getActivePage() {
    if (this.hadNextPage()) {
      return this.getSortedFavorites().slice((this.activePageNum - 1) * this.pageMaxLength, this.activePageNum * this.pageMaxLength);
    } else {
      return this.getSortedFavorites().slice((this.activePageNum - 1) * this.pageMaxLength, localStorage.length);
    }
  }

  hadNextPage(): boolean {
    return localStorage.length > this.activePageNum * this.pageMaxLength;
  }

}
