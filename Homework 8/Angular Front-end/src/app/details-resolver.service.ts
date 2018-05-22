import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import {ActivatedRoute, Resolve, Router, RouterStateSnapshot} from '@angular/router';
import {DetailsService} from './details.service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';


@Injectable()
export class DetailsResolverService implements Resolve<any> {

  constructor(private ds: DetailsService, private router: Router) { }

  resolve() {
      return this.ds.details$;
  }
}
