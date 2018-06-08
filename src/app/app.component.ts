import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  @ViewChild('virtualScroller') virtualScroller;
  title = 'app';
  enableFetch = false;
  itemsToGenerate = 100;
  virtualScrollItems = [];

  ngOnInit() {
    this.showItems(this.itemsToGenerate);
    console.log(this.virtualScroller);
  }

  showItems(length: number) {
    this.virtualScrollItems = this.generateItems(this.itemsToGenerate);
  }

  generateItems(length: number) {
    // tslint:disable-next-line:max-line-length
    const names = ['Alfred', 'Martha', 'David', 'Donald', 'Hawkeye', 'Bruce', 'Peter', 'Christian', 'Nick', 'Stan', 'Tim', 'Paul', 'Faran', 'Leslie'];

    // tslint:disable-next-line:max-line-length
    const lastNames = ['Stark', 'Howard', 'Bridges', 'Stane', 'Paltrow', 'Potts', 'Everhart', 'Gregg', 'Guinee', 'Allen', 'Noel', 'Parker', 'Banner'];

    const lst = [];

    for (let i = 0; i < length; i++) {
      lst.push(`${i}: ${this.getRandom(lastNames)}, ${this.getRandom(names)}`);
    }

    console.log('Generated: ', lst.length + ' Items');
    return lst;
  }



  fetch() {




  }

  getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}
