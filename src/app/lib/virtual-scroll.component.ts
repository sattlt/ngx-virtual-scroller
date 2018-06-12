import { Component, ElementRef, EventEmitter, HostBinding, Input, NgZone, OnChanges, Output, Renderer2, SimpleChanges, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { ViewCollection } from './view-collection';

@Component({
  // tslint:disable-next-line:component-selector
  selector: '[virtualScrollFor]',
  template: `
    <div #vcWrapper class="virtual-scroll-wrapper">
      <div #vcPadding class="virtual-scroll-padding"></div>
      <div #vcContent class="virtual-scroll-content"><ng-content></ng-content></div>
    </div>
  `,
  styleUrls: ['./virtual-scroll.component.scss']
})
export class VirtualScrollComponent implements OnChanges {
  @HostBinding('class') cssClass = 'virtual-scroll';
  @HostBinding('class.no-scrollbar') @Input() noScrollBar = false;

  @Input() virtualScrollFor: Array<any> = [];
  @Input() itemHeight: number;

  @Output() viewChanged = new EventEmitter<ViewCollection>();
  @Output() fetchData = new EventEmitter<any>();

  @ViewChild('vcContent', { read: ElementRef }) private _contentRef: ElementRef;
  @ViewChild('vcPadding', { read: ElementRef }) private _paddingRef: ElementRef;
  @ViewChild('vcWrapper', { read: ElementRef }) private _wrapperRef: ElementRef;

  private _isScrollEventRegistered = false;
  private _containerHeight: number;
  private _containerWidth: number;
  private _paddingHeight: number;
  private _countVisibleItemsPerPage = 0;
  private _scrollTop = 0;
  private _onFetch = false;

  constructor(
    private _containerRef: ElementRef,
    private _renderer: Renderer2,
    private _ngZone: NgZone
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('OnChange', changes);
    this.registerEvents();

    // Measurements --------------------------------------------------------------
    this.calculateDimensions();

    if (changes['virtualScrollFor'] !== undefined) {
      const elem = (this._containerRef.nativeElement as HTMLElement);

      if (elem['scrollTo']) {
        elem.scrollTo({ top: 0 });
      }
    }

    this.refresh();
  }

  private registerEvents() {
    this._ngZone.runOutsideAngular(() => {

      if (!this._isScrollEventRegistered) {

        this._renderer.listen(this._wrapperRef.nativeElement, 'scroll', (event: Event) => {
          const st = (event.target as Element).scrollTop;
          this._scrollTop = (st < this._paddingHeight - this._containerHeight) ? st : this._paddingHeight - this._containerHeight;
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
    this.setTranslateY();

    const [lst, start] = this.calculateItems();

    if (this._scrollTop + this._containerHeight === this._paddingHeight) {

      if (!this._onFetch) {
        this._onFetch = true;

        console.log('Fire Fetch Event');

        const subject = new Subject<Array<any>>();
        subject.subscribe(() => this._onFetch = false);

        this._ngZone.run(() => { this.fetchData.emit(subject); });
      }
    }

    this._ngZone.run(() => this.viewChanged.emit({ collection: lst as Array<any>, start: start as number }));
  }

  private setTranslateY() {
    const itemModulo = this._scrollTop % this.itemHeight;
    let translateY = this._scrollTop - itemModulo;
    translateY = (translateY > this._paddingHeight + this._containerHeight) ? translateY = this._containerHeight : translateY;
    this._renderer.setStyle(this._contentRef.nativeElement, 'transform', `translateY(${translateY}px)`);
  }

  private calculateItems() {
    const itemModulo = this._scrollTop % this.itemHeight;

    let translateY = this._scrollTop - itemModulo;
    translateY = (translateY > this._paddingHeight + this._containerHeight) ? translateY = this._containerHeight : translateY;
    this._renderer.setStyle(this._contentRef.nativeElement, 'transform', `translateY(${translateY}px)`);

    const start = Math.ceil(this._scrollTop / this.itemHeight);
    const lst = this.getSplicedList(start, this._countVisibleItemsPerPage);
    return [lst, start, lst.length];
  }

  private calculateDimensions() {
    const container = this._containerRef.nativeElement;
    this._containerHeight = (container as Element).clientHeight;
    console.log('Container Height: ', this._containerHeight);

    if (this.noScrollBar) {
      this._containerWidth = (container as Element).clientWidth;
      this._renderer.setStyle(this._contentRef.nativeElement, 'width', `${this._containerWidth}px`);
    } else {
      this._renderer.removeStyle(this._contentRef.nativeElement, 'width');
    }

    const paddingHeight = this.itemHeight * this.virtualScrollFor.length;
    this._paddingHeight = (paddingHeight > 2000000) ? 2000000 : paddingHeight;
    console.log('Padding Height: ', this._paddingHeight);

    this._countVisibleItemsPerPage = Math.ceil(this._containerHeight / this.itemHeight) + 3;
    console.log('Items per Page: ', this._countVisibleItemsPerPage, this.itemHeight, this._containerHeight);

    this._renderer.setStyle(this._paddingRef.nativeElement, 'height', `${this._paddingHeight}px`);
    console.log('Calculate Dimensions', this._containerHeight, this._containerWidth);

  }

  /** Splice the list into view items */
  private getSplicedList(start: number, length: number) {
    const lst = this.virtualScrollFor || [];
    const end = (start + length < lst.length) ? start + length : lst.length;
    return lst.slice(start, end);
  }

}
