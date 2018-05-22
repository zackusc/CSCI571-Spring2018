import {Component, OnInit, ViewChild, ElementRef, ViewContainerRef} from '@angular/core';

import { NgForm } from '@angular/forms';

import { HttpClient } from '@angular/common/http';

import { SearchService } from './search.service';
import { DetailsService } from './details.service';
import { NgbTabset } from '@ng-bootstrap/ng-bootstrap';
import {PlaceDetailsComponent} from './place-details/place-details.component';
import { trigger, state, style, animate, transition} from '@angular/animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('resultsDisplay', [
      state('hidden', style({transform: 'translateX(0)'})),
      state('shown', style({transform: 'translateX(0)'})),
      transition('hidden => shown', [
        style({transform: 'translateX(100%)'}),
        animate('300ms')
      ])
    ]),
    trigger('favoritesDisplay', [
      state('hidden', style({transform: 'translateX(0)'})),
      state('shown', style({transform: 'translateX(0)'})),
      transition('hidden => shown', [
        style({transform: 'translateX(100%)'}),
        animate('300ms')
      ])
    ]),
    trigger('detailsDisplay', [
      state('false', style({transform: 'translateX(0)'})),
      state('true', style({transform: 'translateX(0)'})),
      transition('false => true', [
        style({transform: 'translateX(-100%)'}),
        animate('300ms')
      ])
    ])
  ]
})
export class AppComponent implements OnInit {
  currentLocation: any;
  addrBoxDisabled = true;
  addrBoxRequired = false;
  submitted = false;
  autocomplete: any;
  address: string;
  showDetails = false;
  isRadio1Checked = true;
  listDisplay = 'shown';

  categories = ['Default', 'Airport', 'Amusement Park', 'Aquarium',
    'Art Gallery', 'Bakery', 'Bar', 'Beauty Salon', 'Bowling Alley',
    'Bus Station', 'Cafe', 'Campground', 'Car Rental', 'Casino', 'Lodging',
    'Movie Theater', 'Museum', 'Night Club', 'Park', 'Parking',
    'Restaurant', 'Shopping Mall', 'Stadium', 'Subway Station',
    'Taxi Stand', 'Train Station', 'Transit Station', 'Travel Agency',
    'Zoo'
  ];

  placeSearch = {
    keyword: '',
    lat: '',
    lng: '',
    category: this.categories[0],
    distance: '',
    address: ''
  };

  @ViewChild(PlaceDetailsComponent) detailsComponent: PlaceDetailsComponent;

  @ViewChild('addrBox') addrBox: ElementRef;

  @ViewChild('radio1') radio1: ElementRef;
  @ViewChild('radio2') radio2: ElementRef;
  @ViewChild('fooMap') fooMap: ElementRef;
  @ViewChild('searchForm') search_form: any;
  @ViewChild(NgbTabset) twoTabs: NgbTabset;


  constructor(private http: HttpClient,
              public searchService: SearchService,
              public detailsService: DetailsService) { }

  ngOnInit(): void {
    this.addrBoxDisabled = true;
    this.http.get<Object>('http://ip-api.com/json').subscribe(
      data => {
        // console.log(data);
        this.currentLocation = data;
        this.searchService.currentLocation = this.currentLocation;
      }
    );
    this.initAutocomplete();
  }

  initAutocomplete() {
    this.autocomplete = new google.maps.places.Autocomplete(this.addrBox.nativeElement);
    this.autocomplete.addListener('place_changed', () => {
      console.log(this.autocomplete.getPlace());
      if (this.autocomplete.getPlace().geometry) {
        const chosenLocation = this.autocomplete.getPlace().geometry.location;
        this.searchService.addressSpecified = this.addrBox.nativeElement.value;
        console.log(this.addrBox.nativeElement.value);
        // console.log(chosenLocation);
        this.placeSearch.lat = chosenLocation.lat();
        this.placeSearch.lng = chosenLocation.lng();
      }
    });
  }

  checkRadios() {
    if (this.radio1.nativeElement.checked) {
      this.addrBoxDisabled = true;
      this.isRadio1Checked = true;
    }
    if (this.radio2.nativeElement.checked) {
      this.addrBoxDisabled = false;
      this.addrBoxRequired = true;
      this.isRadio1Checked = false;
    }
  }

  onSubmit() {
    console.log(this.placeSearch);

    this.submitted = true;

    let distance = this.placeSearch.distance;
    distance = !distance ? '10' : distance;
    let url = 'http://place-search-lizi0829.us-east-2.elasticbeanstalk.com/results?';
    url += `keyword=${this.placeSearch.keyword}&category=${this.placeSearch.category}&distance=${distance}&`;

    if (this.radio1.nativeElement.checked) {
      url += `lat=${this.currentLocation.lat}&lng=${this.currentLocation.lon}`;
    } else {
      if (this.placeSearch.lat) {
        url += `lat=${this.placeSearch.lat}&lng=${this.placeSearch.lng}`;
      } else {
        this.searchService.addressSpecified = this.placeSearch.address;
        url += `address=${this.placeSearch.address}`;
      }
    }

    console.log(url);
    this.searchService.getSearchResults(url);
  }

  getDetailsAndSwitchView(query) {
    console.log(query);
    let placeId = '';
    let address = '';
    if (typeof query === 'string') {
      placeId = query;
      address = this.searchService.addressSpecified;
    } else {
      placeId = query.place_id;
      address = query.address;
    }
    const request = {
      placeId: placeId
    };
    const map = new google.maps.Map(this.fooMap.nativeElement);
    const service = new google.maps.places.PlacesService(map);

    service.getDetails(request, (place, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        console.log(place);
        this.detailsService.details = place;
        this.detailsService.getYelpReviews();
        place['addressSpecified'] = address;
        this.detailsService.details$.next(place);
      }
    });
    this.showDetails = true;
    this.listDisplay = 'hidden';
    this.detailsComponent.selectTab('infoTab');
    this.detailsService.searchTriggered = true;
    this.detailsService.selectedPlaceId = placeId;
  }

  hideDetails() {
    this.showDetails = false;
    this.listDisplay = 'shown';
  }

  goBackToDetails() {
    this.showDetails = true;
    this.listDisplay = 'hidden';
  }

  isOnlySpaces(): boolean {
    if (!this.placeSearch.keyword.trim()) {
      return true;
    } else {
      if (!this.isRadio1Checked && !this.placeSearch.address.trim()) {
        return true;
      } else {
        return false;
      }
    }
  }

  clearAll() {
    console.log(this.search_form);
    this.search_form.resetForm();
    this.search_form.form.patchValue({
      keyword: '',
      category: 'Default',
      distance: '',
      address: ''
    });
    // check radio1
    this.radio1.nativeElement.checked = true;
    this.isRadio1Checked = true;
    // clear search result
    this.searchService.searchResults = null;
    this.searchService.firstPage = null;
    this.searchService.secondPage = null;
    this.searchService.thirdPage = null;
    this.submitted = false;
    // clear details info
    this.detailsService.searchTriggered = false;
    this.detailsService.selectedPlaceId = '';
    this.showDetails = false;
    // switch to result tab
    this.twoTabs.select('resultsTab');
  }


}
