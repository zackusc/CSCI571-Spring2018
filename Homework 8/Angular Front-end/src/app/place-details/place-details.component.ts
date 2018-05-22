import {
  Component, OnInit, Input, OnChanges, ViewChild, ElementRef, SimpleChanges, SimpleChange, Output,
  AfterViewInit, EventEmitter
} from '@angular/core';

import { NgbTabset } from '@ng-bootstrap/ng-bootstrap';

import { SearchService } from '../search.service';
import { DetailsService } from '../details.service';
import 'rxjs/add/operator/take';
import { NgZone } from '@angular/core';

@Component({
  selector: 'app-place-details',
  templateUrl: './place-details.component.html',
  styleUrls: ['./place-details.component.css']
})
export class PlaceDetailsComponent implements OnInit {
  activeTabId = 'infoTab';
  details: any;
  twitterUrl: string;
  addressEntered: string;

  @ViewChild(NgbTabset) tabset: NgbTabset;

  @Output() onReturnToList = new EventEmitter();

  constructor(
    // private searchService: SearchService,
    public detailsService: DetailsService,
    private ngZone: NgZone
  ) { }


  // ngOnChanges(changes: SimpleChanges) {
  //   const details: SimpleChange = changes.details;
  //   this._details = details.currentValue;
  //   console.log(this._details);
  // }

  ngOnInit() {

    this.detailsService.details$
      .subscribe((details) => {
        this.ngZone.run(() => {
          this.details = details;
          console.log('Place-details component got details:');
          console.log(this.details);
          this.generateTwitterContent();
          this.addressEntered = details['addressSpecified'];
        });
      }
    );
  }

  generateTwitterContent() {
    this.twitterUrl = 'https://twitter.com/intent/tweet?';
    let text = `Check out ${this.details.name} located at ${this.details.formatted_address}.  Website: `;
    text = encodeURIComponent(text);
    let url = this.details.website ? this.details.website : this.details.url;
    url = encodeURIComponent(url);
    this.twitterUrl += `text=${text}&url=${url}&hashtags=TravelAndEntertainmentSearch`;
    console.log(this.twitterUrl);
  }

  selectTab(tabId: string) {
    if (this.tabset) {
      this.tabset.select(tabId);
    }
  }

  goBackToList() {
    this.onReturnToList.emit(null);
  }

  isFavorited() {
    return localStorage.getItem(this.details.place_id) ? true : false;
  }

  changeFavoStatus() {
    const placeId = this.details.place_id;
    if (localStorage.getItem(placeId)) {
      localStorage.removeItem(placeId);
    } else {
      const now = new Date();
      const place = this.details;
      place.timestamp = now.getTime();
      place.addressSpecified = this.addressEntered;
      console.log('Place stored:');
      console.log(place);
      localStorage.setItem(placeId, JSON.stringify(place));
    }
  }


}
