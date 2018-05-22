import { Component, OnInit } from '@angular/core';
import { DetailsService } from '../details.service';

@Component({
  selector: 'app-photos',
  templateUrl: './photos.component.html',
  styleUrls: ['./photos.component.css']
})
export class PhotosComponent implements OnInit {
  photos: any;
  photoUrls = [ [], [], [], [] ];

  constructor(public detailsService: DetailsService) { }

  ngOnInit() {
    console.log('photos onInit:');
    // console.log(this.detailsService.details);
    if (this.detailsService.details['photos']) {
      this.photos = this.detailsService.details['photos'];
      for (let i = 0; i < this.photos.length; i++) {
        const photo = this.photos[i];
        const photo_url = photo.getUrl({
          'maxWidth': photo.width,
          'maxHeight': photo.height
        });
        this.photoUrls[i % 4].push(photo_url);
      }
      // console.log(this.photoUrls);
    }
  }

}
