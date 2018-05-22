import {Component, Input, OnInit} from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-open-hours',
  templateUrl: './open-hours.component.html',
  styleUrls: ['./open-hours.component.css']
})
export class OpenHoursComponent implements OnInit {
  details: any;
  placeLocalTime: any;
  localDayOfWeek: number;
  dailyOpenHours: any;
  leftDays: any;

  @Input()
  set placeDetails(details: any) {
    this.details = details;
    // console.log(this.details);
    if (details) {
      this.parseOpenHours();
    }
  }

  constructor() { }

  ngOnInit() {
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

}
