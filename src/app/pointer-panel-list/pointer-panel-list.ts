import {
  AfterContentChecked,
  AfterViewInit,
  Component,
  DoCheck,
  ElementRef,
  HostListener,
  Input,
  IterableChangeRecord,
  IterableDiffer,
  IterableDiffers,
  OnDestroy,
  OnInit,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {ViewportRuler} from '@angular/cdk/scrolling';
import {PointerPanelDetails} from './pointer-panel-details';
import {Observable, of, Subscriber, Subscription} from 'rxjs';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {PointerPanelItem} from './pointer-panel-item';
import {BreakpointObserver, BreakpointState} from "@angular/cdk/layout";

export function MoveRowAni(name, to) {
  return trigger(name, [
    state('closeNow', style({
      'transform': 'translateY(0px)'
    })),

    state('close', style({
      'transform': 'translateY(0px)'
    })),
    state('open', style({
      'transform': 'translateY({{to}}px)'
    }), {params: {to: '0'}}),
    state('openNow', style({
      'transform': 'translateY({{to}}px)'
    }), {params: {to: '0'}}),

    transition('* => open', animate('200ms ease-in')),
    transition('* => close', animate('200ms ease-out')),
    transition('* => openNow', animate('0ms')),
    transition('* => closeNow', animate('0ms')),
    transition('* => void', animate('100ms ease-out')),
  ]);
}


@Component({
  selector: 'pointer-panel-list',
  templateUrl: './pointer-panel-list.html',
  styleUrls: ['./pointer-panel-list.scss'],
  animations: [MoveRowAni('animate-row-move', 'detailsRowHeight')]
})

export class PointerPanelList<T> implements OnInit, OnDestroy, AfterViewInit, AfterContentChecked, DoCheck {
  @Input() detailsRowHeight = 385;
  @Input() itemTemplate: TemplateRef<T>;
  @Input() itemDetailsTemplate: TemplateRef<T>;
  @ViewChild(PointerPanelDetails) detailsPanel: PointerPanelDetails<T>;
  @ViewChild('gridcontainer') gridContainer: ElementRef;
  @ViewChildren(PointerPanelItem) listViewChildren: QueryList<PointerPanelItem<T>>;
  detailsPanelTop = 0;
  detailsPointerLeft = 0;
  sink = new Subscriber();
  /** Subscription that listens for the data provided by the data source. */
  private _dataChangeSubscription: Subscription | null;
  private _selectedIndex = -1;
  private _dataDiffer: IterableDiffer<PointerPanelItem<T>>;
  small = false;

  get detailsPanelState(): string {
    if (this.detailsPanel) {
      return this.detailsPanel.panelState;
    } else {
      return 'close';
    }
  }

  @HostListener('window:resize', ['$event']) onResize(event) {
    this.setDetailPanelPosition();
  }

  @Input()
  set detailsPanelState(_state: string) {
    this.detailsPanel.panelState = _state;
  }

  private _dataSource: Observable<T[]> | T[];

  @Input()
  get dataSource(): Observable<T[]> | T[] {
    return this._dataSource;
  }

  set dataSource(dataSource: Observable<T[]> | T[]) {
    if (this._dataSource !== dataSource) {
      // Stop listening for data from the previous data source.
      if (this._dataChangeSubscription) {
        this._dataChangeSubscription.unsubscribe();
        this._dataChangeSubscription = null;
      }
      this._dataSource = dataSource;
    }
  }

  protected _data: T[] | ReadonlyArray<T>;
  get data(): T[] | ReadonlyArray<T> {
    return this._data;
  }

  icSelectionChanged(icSel: PointerPanelItem<T>): void {

    if (!this.detailsPanel) {
      return;
    }

    const icPrev = this.getItem(this._selectedIndex);

    const gridScrolledTop = this.gridContainer.nativeElement.getBoundingClientRect().top - this.gridContainer.nativeElement.offsetTop;
    const selIndex = this.listViewChildren.toArray().indexOf(icSel);

    if (this._selectedIndex === selIndex) { // same card selected...close row
      icSel.isSelected = false;
      this._selectedIndex = -1;
      this.detailsPanelState = 'close';
      this.detailsPanel.data = null;
      const belows = this.listViewChildren.filter(ic => ic.translatedBottom > icSel.translatedBottom);
      for (const ibc of belows) {
        ibc.detailsPanelState = 'close';
      }
    } else if (!icPrev) { // no card selected...new row
      icSel.isSelected = true;
      this._selectedIndex = selIndex;
      this.detailsPanel.data = icSel.data;

      const belows = this.listViewChildren.filter(ic => ic.translatedBottom > icSel.translatedBottom);
      for (const ibc of belows) {
        ibc.detailsPanelState = 'open';
      }
      this.detailsPanelState = 'open';
      this.detailsPanelTop = icSel.translatedBottom - gridScrolledTop - 10;

    } else {  // different card selection... check row
      icPrev.isSelected = false;
      icSel.isSelected = true;
      this._selectedIndex = selIndex;
      this.detailsPanel.data = icSel.data;
      if (icPrev.translatedBottom > icSel.translatedBottom) { // over
        this.detailsPanelTop = icSel.translatedBottom - gridScrolledTop - 10;
        const belows = this.listViewChildren.filter(ic => ic.translatedBottom > icSel.translatedBottom);
        for (const ibc of belows) {
          ibc.detailsPanelState = 'open';
        }
      } else if (icPrev.translatedBottom < icSel.translatedBottom) {  // under
        this.detailsPanelTop = (icSel.translatedBottom - gridScrolledTop) - this.detailsRowHeight - 10;

        const aboves = this.listViewChildren.filter(ic => ic.translatedBottom <= icSel.translatedBottom);
        for (const ibc of aboves) {
          ibc.detailsPanelState = 'close';
        }

      }
      // else... selecting different card on same row
    }

    this.detailsPointerLeft = icSel.centerHorz;
  }

  closeDetailsPanel() {
    this._selectedIndex = -1;

    this.detailsPanelState = 'close';
    this.listViewChildren.forEach((ibc) => {
      ibc.detailsPanelState = 'close';
      ibc.isSelected = false;
    });
    this.detailsPanel.data = null;
  }

  constructor(private ruler: ViewportRuler,
              protected readonly differs: IterableDiffers,
              private breakpointObserver: BreakpointObserver) {
  }

  ngOnInit(): void {
    this.sink.add(this.breakpointObserver
      .observe(['(max-width: 500px)'])
      .subscribe((state: BreakpointState) => {
        this.small = state.matches;
      })
    );

    this._dataDiffer = this.differs.find([]).create();

    this.sink.add(this.ruler.change().subscribe(() => {
        this.setDetailPanelPosition();
      })
    );
  }

  ngAfterViewInit(): void {

    this.sink.add(this.listViewChildren.changes.subscribe(() => {
        setTimeout(() => {
          this.setDetailPanelPosition();
        });
      })
    );

    this.detailsPanel.close.subscribe(() => {
      this.closeDetailsPanel();
    });
  }

  ngAfterContentChecked(): void {
    if (this.dataSource && !this._dataChangeSubscription) {
      this._observeRenderChanges();
    }
  }

  ngOnDestroy(): void {
    this.sink.unsubscribe();
  }

  ngDoCheck(): void {
    if (this.listViewChildren) {
      const changes = this._dataDiffer.diff(this.listViewChildren.toArray());

      if (changes) {

        changes.forEachAddedItem((record: IterableChangeRecord<any>) => {

          // this.renderer.addClass(this.host.nativeElement, record.item);
          this.setDetailPanelPosition();
        });

        changes.forEachRemovedItem((record: IterableChangeRecord<any>) => {
          this.closeDetailsPanel();
          return; // only handles single item deletion for now.
        });
      }
    }
  }

  protected getItem(index: number) {
    let icSel = null;
    if (index !== -1) {
      if (this.listViewChildren.length > index) {
        icSel = this.listViewChildren.toArray()[index];
      } else {
        icSel = this.listViewChildren.last;
      }
    }
    return icSel;
  }

  protected setDetailPanelPosition() {

    if (!this.listViewChildren) {
      return;
    }

    const icSel = this.getItem(this._selectedIndex);

    if (icSel) {
      const gridScrolledTop = this.gridContainer.nativeElement.getBoundingClientRect().top - this.gridContainer.nativeElement.offsetTop;

      const evens = this.listViewChildren.filter(ic => ic.bottom === icSel.bottom);
      for (const ic of evens) {
        ic.detailsPanelState = 'closeNow';
      }

      const belows = this.listViewChildren.filter(ic => ic.bottom > icSel.bottom);
      for (const ic of belows) {
        ic.detailsPanelState = 'openNow';
      }

      this.detailsPanelTop = icSel.bottom - gridScrolledTop - 10;
      this.detailsPointerLeft = icSel.centerHorz;
      // icSel.ScrollIntoView();
    }
  }

  private _observeRenderChanges() {
    // If no data source has been set, there is nothing to observe for changes.
    if (!this.dataSource) {
      return;
    }

    let dataStream: Observable<T[] | ReadonlyArray<T>> | undefined;

    if (this.dataSource instanceof Observable) {
      dataStream = this.dataSource;
    } else if (Array.isArray(this.dataSource)) {
      dataStream = of(this.dataSource);
    }

    if (dataStream === undefined) {
      throw new Error('datastream undefined.');
    }

    this._dataChangeSubscription = dataStream
      .subscribe(
        data => {
          this._data = data || [];
        },
        err => {
          console.log('error ' + err);
        },
        () => {
          console.log('completed');
        });

  }
}


