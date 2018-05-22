import { Component, ElementRef, OnInit, ViewChild, Input} from '@angular/core';

import { SearchService } from '../search.service';
import { DetailsService } from '../details.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  @Input() addressSpecified: string;

  details: any;
  map: any;
  fromLocation: any;
  fromAddress = 'Your location';
  toLocation: any;
  travelMode = 'DRIVING';
  directionService: any;
  directionsDisplay: any;
  marker: any;
  panorama: any;
  btnImgSrc = 'http://cs-server.usc.edu:45678/hw/hw8/images/Pegman.png';
  autocomplete: any;

  @ViewChild('map') mapElement: ElementRef;
  @ViewChild('directionsPanel') directionsPanel: ElementRef;
  @ViewChild('fromAddrBox') addrBox: ElementRef;

  constructor(
    private searchService: SearchService,
    private detailsService: DetailsService
  ) { }

  ngOnInit() {
    this.fromLocation = {
      lat: this.searchService.currentLocation.lat,
      lng: this.searchService.currentLocation.lon
    };

    if (this.addressSpecified) {
      this.fromAddress = this.addressSpecified;
    }
    // console.log(this.fromLocation);
    this.details = this.detailsService.details;
    this.toLocation = this.details['geometry']['location'];
    // console.log(this.toLocation);
    this.initMap();
    this.initAuotocomplete();
  }

  initMap() {
    this.directionService = new google.maps.DirectionsService;
    this.directionsDisplay = new google.maps.DirectionsRenderer;
    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      center: this.toLocation,
      zoom: 13
    });

    this.marker = new google.maps.Marker({
      position: this.toLocation,
      map: this.map
    });
    this.directionsDisplay.setMap(this.map);
    this.directionsDisplay.setPanel(this.directionsPanel.nativeElement);

    this.panorama = this.map.getStreetView();
    this.panorama.setPosition(this.toLocation);
    this.panorama.setPov({
      heading: 265,
      pitch: 0
    });
  }

  initAuotocomplete() {
    this.autocomplete = new google.maps.places.Autocomplete(this.addrBox.nativeElement);
    this.autocomplete.addListener('place_changed', () => {
      this.fromAddress = this.addrBox.nativeElement.value;
    });
  }

  showDirections() {
    if (this.fromAddress === 'My location') {
      this.fromLocation = {
        lat: this.searchService.currentLocation.lat,
        lng: this.searchService.currentLocation.lon
      };
    }
    const request = {
      origin: this.fromLocation,
      destination: this.toLocation,
      travelMode: this.travelMode,
      provideRouteAlternatives: true
    };

    // console.log(this.fromAddress);

    if (this.fromAddress !== 'Your location' &&
        this.fromAddress !== 'My location') {
      request.origin = this.fromAddress;
    }

    console.log(request);
    this.directionService.route(request, (response, status) => {
      if (status === 'OK') {
        // console.log(response);
        this.marker.setVisible(false);
        this.directionsDisplay.setDirections(response);
      }
    });
  }

  toggleStreetView() {
    const toggle = this.panorama.getVisible();
    if (toggle === false) {
      this.panorama.setVisible(true);
      this.btnImgSrc = 'http://cs-server.usc.edu:45678/hw/hw8/images/Map.png';
    } else {
      this.panorama.setVisible(false);
      this.btnImgSrc = 'http://cs-server.usc.edu:45678/hw/hw8/images/Pegman.png';
    }
  }

}

