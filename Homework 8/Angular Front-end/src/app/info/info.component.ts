import {Component, Input, NgZone, OnInit} from '@angular/core';
import { DetailsService } from '../details.service';
import {ActivatedRoute, Router} from '@angular/router';
import 'rxjs/add/operator/map';
import * as moment from 'moment';


@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.css']
})
export class InfoComponent implements OnInit {
  details: object;
  // now: object;
  placeLocalTime: any;
  localDayOfWeek: number;
  dailyOpenHours: any;
  leftDays: any;

  constructor(
    private detailsService: DetailsService,
    private ngZone: NgZone
  ) { }

  @Input()
  set placeDetails(details: any) {
    this.details = details;
    console.log(this.details);
    this.parseOpenHours();
  }

  ngOnInit() {
    console.log('Info component onInit');

    // this.details = this.detailsService.details;
    // this.parseOpenHours();

    // this.detailsService.details$
    //   .subscribe(
    //     (details) => {
    //       // this.ngZone.run(() => {
    //         this.details = details;
    //         console.log('Details component got details:');
    //         console.log(this.details);
    //         this.parseOpenHours();
    //       // });
    //     }
    //   );

    // this.route.data.map(data => data.cdet).subscribe(
    //   details => {
    //   this.details = details;
    //   console.log(details);
    //   // console.log(this.detailsService.details);
    // });

  }

  parseOpenHours() {
    if (this.details['opening_hours']) {
      const now = moment();
      // console.log(this.now.format());
      this.placeLocalTime = now.utcOffset(this.details['utc_offset']);
      // console.log(this.placeLocalTime.format());
      this.localDayOfWeek = this.placeLocalTime.day();
      if (this.localDayOfWeek === 0) {
        this.localDayOfWeek = 7;
      }
      console.log('local day of week: ' + this.localDayOfWeek);
      this.dailyOpenHours = this.details['opening_hours']['weekday_text'];
      this.dailyOpenHours = this.dailyOpenHours.map(x => {
        return {
          day: x.split(': ')[0],
          hours: x.split(': ')[1]};
      });
      console.log('daily open hours:');
      console.log(this.dailyOpenHours);

      this.leftDays = this.dailyOpenHours.slice();
      this.leftDays.splice(this.localDayOfWeek - 1, 1);
      console.log(this.leftDays);
    }
  }

  getPriceLevelDollarNotation(): string {
    let dollarNotation = '';
    for (let i = 0; i < this.details['price_level']; i++) {
      dollarNotation += '$';
    }
    return dollarNotation;
  }

  getMaxStarNum(): number {
    return Math.ceil(this.details['rating']);
  }

}
