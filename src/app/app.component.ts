import { Component, OnInit, ViewChild } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  @ViewChild('virtualScroller') virtualScroller;
  title = 'app';
  enableFetch = false;
  noScrollBar = false;
  itemsToGenerate = 100;
  virtualScrollItems = [];

  ngOnInit() {
    this.showItems(this.itemsToGenerate);
    console.log('VirtualScrollerRef:', this.virtualScroller);
  }

  showItems(length: number) {
    this.virtualScrollItems = this.generateItems(this.itemsToGenerate);
  }

  generateItems(length: number, startIndex: number = 0) {
    // tslint:disable-next-line:max-line-length
    const names = ['Alfred', 'Martha', 'David', 'Donald', 'Hawkeye', 'Bruce', 'Peter', 'Christian', 'Nick', 'Stan', 'Tim', 'Paul', 'Faran', 'Leslie'];

    // tslint:disable-next-line:max-line-length
    const lastNames = ['Stark', 'Howard', 'Bridges', 'Stane', 'Paltrow', 'Potts', 'Everhart', 'Gregg', 'Guinee', 'Allen', 'Noel', 'Parker', 'Banner'];

    const lst = [];

    for (let i = 0; i < length; i++) {
      lst.push(`${i + startIndex}: ${this.getRandom(lastNames)}, ${this.getRandom(names)}`);
    }

    console.log('Generated: ', lst.length + ' Items');
    return lst;
  }



  fetch(callBack: Subject<Array<any>>) {

    console.log('Fetch Event recieved: ');

    setTimeout(() => {
      this.virtualScrollItems = this.virtualScrollItems.concat(this.generateItems(10, this.virtualScrollItems.length));
      console.log('Generate: ', this.virtualScrollItems.length);
      callBack.next([]);
    }, 1000);

  }

  getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}
