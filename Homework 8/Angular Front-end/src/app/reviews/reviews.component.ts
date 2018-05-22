import { Component, OnInit } from '@angular/core';
import { DetailsService } from '../details.service';
import * as moment from 'moment';
import { trigger, state, style, animate, transition} from '@angular/animations';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css'],
  animations: [
    trigger('reviewType', [
      state('google', style({
        opacity: 1
      })),
      state('yelp', style({
        opacity: 1
      })),
      transition('google <=> yelp', [
        style({ opacity: 0 }),
        animate('300ms ease')
      ])
    ])
  ]
})
export class ReviewsComponent implements OnInit {
  details: any;
  googleReviews: any;
  reviews: any;
  yelpReviews: any;
  reviewTypeNum = 0;
  reviewType = 'google';
  orderTypeNum = 0;

  reviewTypes = ['Google Reviews', 'Yelp Reviews'];
  orderTypes = [
    'Default Order',
    'Highest Rating',
    'Lowest Rating',
    'Most Recent',
    'Least Recent'
  ];

  constructor(private detailsService: DetailsService) { }

  ngOnInit() {
    console.log('reviews onInit:');
    this.details = this.detailsService.details;
    if (this.details.reviews) {
      this.googleReviews = this.details['reviews'];
      console.log('google reviews');
      // console.log(this.googleReviews);
      this.parseGoogleReviewTime();
      // console.log('After parse:');
      console.log(this.googleReviews);
    } else {
      this.googleReviews = [];
    }
    this.yelpReviews = this.detailsService.yelpReviews;
    console.log('yelp reviews');
    console.log(this.yelpReviews);
    this.reviews = this.googleReviews;
  }

  parseGoogleReviewTime() {
    for (let i = 0; i < this.googleReviews.length; i++) {
      const review = this.googleReviews[i];
      review.moment = moment.unix(review.time);
      review.time_formatted = review.moment.format('YYYY-MM-DD HH:mm:ss');
    }
  }

  setReviewsType(n: number) {
    this.reviewTypeNum = n;
    this.reviewType = n === 0 ? 'google' : 'yelp';
    this.changeReviewsDisplay();
  }

  setOrderType(n: number) {
    this.orderTypeNum = n;
    this.changeReviewsDisplay();
  }

  getMaxStarNum(rating): number {
    return Math.ceil(rating);
  }

  changeReviewsDisplay() {
    this.reviews = this.reviewTypeNum === 0 ? this.googleReviews : this.yelpReviews;
    switch (this.orderTypeNum) {
      case 0:
        break;
      case 1:
        this.reviews = this.reviews.sort( (r1, r2) => {
          return r2.rating - r1.rating;
        });
        break;
      case 2:
        this.reviews = this.reviews.sort( (r1, r2) => {
          return r1.rating - r2.rating;
        });
        break;
      case 3:
        this.reviews = this.reviews.sort( (r1, r2) => {
          return r2.moment.diff(r1.moment);
        });
        break;
      case 4:
        this.reviews = this.reviews.sort( (r1, r2) => {
          return r1.moment.diff(r2.moment);
        });
        break;
    }
  }

}
