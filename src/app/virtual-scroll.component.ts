// tslint:disable-next-line:max-line-length
import { Component, OnInit, OnChanges, SimpleChanges, Input, EventEmitter, Output, Renderer2, ElementRef, NgZone, ViewChild, enableProdMode } from '@angular/core';
import { ViewCollection } from './view-collection';

@Component({
  // tslint:disable-next-line:component-selector
  selector: '[virtualScrollFor]',
  template: `
    <div #vcPadding class="virtual-scroll-padding"></div>
    <div #vcContent class="virtual-scroll-content"><ng-content></ng-content></div>
  `,
  styleUrls: ['./virtual-scroll.component.scss']
})
export class VirtualScrollComponent implements OnChanges {

  @Input() virtualScrollFor: Array<any> = [];
  @Input() itemHeight: number;
  @Output() viewChanged = new EventEmitter<ViewCollection>();
  @ViewChild('vcContent', { read: ElementRef }) private _contentRef: ElementRef;
  @ViewChild('vcPadding', { read: ElementRef }) private _paddingRef: ElementRef;

  private _isScrollEventRegistered = false;
  private _containerHeight: number;
  private _paddingHeight: number;
  private _startIndex = 0;
  private _countVisibleItemsPerPage = 0;
  private _scrollTop = 0;

  constructor(
    private _containerRef: ElementRef,
    private _renderer: Renderer2,
    private _ngZone: NgZone
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('OnChange');
    this.registerEvents();

    // Measurements --------------------------------------------------------------
    this.calculateDimensions();

    if (changes['virtualScrollFor'] !== undefined) {

      const elem = (this._containerRef.nativeElement as HTMLElement);

      this._startIndex = 0;

      if (elem['scrollTo']) {
        elem.scrollTo({ top: 0 });
      }
    }

    this.refresh();
  }

  private registerEvents() {
    this._ngZone.runOutsideAngular(() => {

      if (!this._isScrollEventRegistered) {

        this._renderer.listen(this._containerRef.nativeElement, 'scroll', (event: Event) => {
          const st = (event.target as Element).scrollTop;

          this._scrollTop = (st < this._paddingHeight - this._containerHeight) ? st : this._paddingHeight - this._containerHeight;

          console.log('Evetn: ', this._scrollTop, this._paddingHeight);
          this.refresh();
        });

        this._isScrollEventRegistered = true;
      }
    });
  }

  private refresh() {
    this._ngZone.runOutsideAngular(() => {
      requestAnimationFrame(() => this.showItems());
    });
  }

  private showItems() {
    const [lst, start] = this.calculateItems();
    console.log(this._scrollTop, start, (lst as Array<any>).length);

    this._ngZone.run(() => this.viewChanged.emit({ collection: lst as Array<any>, fromIdx: start as number }));
  }

  private calculateItems() {
    // const dimensions = this.calculateDimensions();
    // OUTSIDE ANGULAR!!!
    const itemModulo = this._scrollTop % this.itemHeight;

    let translateY = this._scrollTop - itemModulo;
    translateY = (translateY > this._paddingHeight + this._containerHeight) ? translateY = this._containerHeight : translateY;
    this._renderer.setStyle(this._contentRef.nativeElement, 'transform', `translateY(${translateY}px)`);

    const start = Math.ceil(this._scrollTop / this.itemHeight);
    const lst = this.getSplicedList(start, this._countVisibleItemsPerPage);

    return [lst, start];
  }

  private calculateDimensions() {
    console.log('Calculate Dimensions', this._containerHeight);
    const container = this._containerRef.nativeElement;
    this._containerHeight = (container as Element).clientHeight;

    const paddingHeight = this.itemHeight * this.virtualScrollFor.length;
    this._paddingHeight = (paddingHeight > 2000000) ? 2000000 : paddingHeight;

    this._countVisibleItemsPerPage = Math.ceil(this._containerHeight / this.itemHeight) + 3;

    this._renderer.setStyle(this._paddingRef.nativeElement, 'height', `${this._paddingHeight}px`);
  }

  private getSplicedList(start: number, length: number) {
    const lst = this.virtualScrollFor || [];
    const end = (start + length < lst.length) ? start + length : lst.length;
    return lst.slice(start, end);
  }
}
