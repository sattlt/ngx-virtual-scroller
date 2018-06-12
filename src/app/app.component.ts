import { ChangeDetectionStrategy, Component, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { VirtualScrollComponent } from './lib/virtual-scroll.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit, OnChanges {

  @ViewChild('virtualScroller') virtualScroller: VirtualScrollComponent;
  public title = 'app';
  public enableFetch = false;
  public noScrollBar = false;
  public itemsToGenerate = 100;
  public virtualScrollItems = [];

  constructor() {
  }

  ngOnInit() {
    this.showItems();
    console.log('VirtualScrollerRef:', this.virtualScroller);
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes, changes['noScrollBar'], changes['enableFetch']);

    if (changes['noScrollBar'] !== undefined) {
      console.log('Scrollbar change', this.noScrollBar);
    }

    if (changes['enableFetch'] !== undefined) {
      console.log('Fetch enable changed: ', this.enableFetch);
    }
  }

  showItems() {
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

    console.log('Fetch Event recieved: ', this.enableFetch);

    if (this.enableFetch) {
      setTimeout(() => {
        this.virtualScrollItems = this.virtualScrollItems.concat(this.generateItems(10, this.virtualScrollItems.length));
        console.log('Generate: ', this.virtualScrollItems.length);
        callBack.next([]);
      }, 10);
    }

  }

  getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}
