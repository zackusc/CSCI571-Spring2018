import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class SearchService {
  currentLocation: any;
  // detail_id: number;
  addressSpecified: string;
  searchResults: object;
  firstPage: object;
  secondPage: object;
  thirdPage: object;

  constructor(private http: HttpClient) { }

  getSearchResults(url: string) {
    this.http.get<Object>(url).subscribe(
      data => {
        this.firstPage = data;
        this.searchResults = data;
        this.searchResults['page_num'] = 1;
        console.log('SearchService:\n');
        console.log(this.searchResults);
      }
    );
  }

  getNextPageResults() {
    const prevPage = this.searchResults;
    let url = 'http://place-search-lizi0829.us-east-2.elasticbeanstalk.com/results/nextpage?pagetoken=';
    url += this.searchResults['next_page_token'];
    console.log(url);
    this.http.get<Object>(url).subscribe(data => {
        this.searchResults = data;
        this.searchResults['page_num'] = prevPage['page_num'] + 1;
        if (this.searchResults['page_num'] === 2) {
          this.secondPage = this.searchResults;
        } else {
          this.thirdPage = this.searchResults;
        }
        console.log('SearchService: Next page:\n');
        console.log(this.searchResults);
      }
    );
  }

  getPrevPageResults() {
    if (this.searchResults['page_num'] === 2) {
      this.searchResults = this.firstPage;
    } else {
      this.searchResults = this.secondPage;
    }
  }
}
