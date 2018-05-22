import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import {tap, map} from 'rxjs/operators';
import {Subject} from 'rxjs/Subject';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';

@Injectable()
export class DetailsService {
  details: object;
  searchTriggered = false;
  details$: Subject<object> = new Subject<object>();
  yelpReviews: any;
  selectedPlaceId: string;
  // yelpReviews$: Observable<any>;

  constructor(private http: HttpClient) { }

  getYelpReviews() {
    const addressComponents = this.details['address_components'];
    const addressObj = new Object();
    for (let i = 0; i < addressComponents.length; i++) {
      const component = addressComponents[i];
      const type = component.types[0];
      addressObj[type] = component.short_name;
    }
    // console.log(addressObj);
    const name = encodeURIComponent(this.details['name']);
    // console.log(decodeURIComponent(name));
    const city = addressObj['locality'];
    const state = addressObj['administrative_area_level_1'];
    let address1 = '';
    if (addressObj['street_number'] && addressObj['route']) {
      address1 = addressObj['street_number'] + ' ' + addressObj['route'];
    }
    const address2 = `${city}, ${state} ${addressObj['postal_code']}`;
    let url = 'http://place-search-lizi0829.us-east-2.elasticbeanstalk.com/yelp?';
    url += `name=${name}&address1=${address1}&address2=${address2}`;
    url += `&city=${city}&state=${state}&country=${addressObj['country']}`;
    url = encodeURI(url);
    console.log(url);

    this.http.get<any>(url).subscribe(data => {
      this.yelpReviews = data.reviews;
      console.log(this.yelpReviews);
      this.parseYelpReviews();
    });

  }

  parseYelpReviews() {
    this.yelpReviews = this.yelpReviews.map(review => {
      return {
        author_url: review.url,
        profile_photo_url: review.user.image_url,
        author_name: review.user.name,
        time_formatted: review.time_created,
        rating: review.rating,
        text: review.text,
        moment: moment(review.time_created, 'YYYY-MM-DD HH:mm:ss')
      };
    });
    console.log(this.yelpReviews);
  }

}
