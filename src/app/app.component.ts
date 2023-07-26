import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {Observable, of, Subscription} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {IStarWarsCharacter, StarWarsModel} from "./star-wars-character";
import {MatSnackBar} from "@angular/material/snack-bar";
import {BreakpointObserver, BreakpointState} from "@angular/cdk/layout";
import {PointerPanelList} from './pointer-panel-list/pointer-panel-list';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatCardModule} from '@angular/material/card';
import {NgIf} from '@angular/common';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [NgIf, MatCardModule, MatToolbarModule, MatButtonModule, MatTooltipModule, MatIconModule, PointerPanelList]
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {

  public cards: Array<StarWarsModel> = new Array<StarWarsModel>();
  $cards = of(this.cards);

  sink = new Subscription();
  uniqueId = 0;
  small = false;

  constructor(private http: HttpClient, private snackBar: MatSnackBar,
              private breakpointObserver: BreakpointObserver) {

    // get the mock data
    this.getJSON().subscribe(data => {
      data.forEach(item => {
        const icm = new StarWarsModel(item);
        this.subscribeToDeleteCard(icm);
        this.cards.push(icm);
      });
    });
  }

  ngOnInit(): void {
    this.small = this.breakpointObserver.isMatched(['(max-width: 500px)'])
    this.sink.add(this.breakpointObserver
      .observe(['(max-width: 500px)'])
      .subscribe((state: BreakpointState) => {
        this.small = state.matches;
      })
    );
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.help();
    }, 1500);
  }


  addItem() {
    if (this.cards.length == 14) {
      this.snackBar.open('Max 15 items reached.',
        'Dismiss', {
          duration: 2000,
          verticalPosition: 'bottom'
        });
    }
    const jsonData =
      JSON.parse('{ "name":"' + 'Card ' + this.uniqueId++ + '", "avatarSrc":"./assets/hanssolo_a.jpg", ' +
        '"fullSrc":"./assets/hanssolo.jpg", "subtitle": "Test pointer position", ' +
        '"fullDesc": "Test pointer position when adding a new card. ' +
        'The card should position itself correctly around the pointer panel."}');

    const icm = new StarWarsModel(jsonData);
    this.subscribeToDeleteCard(icm);
    this.cards.push(icm);
  }

  public getJSON(): Observable<IStarWarsCharacter[]> {
    return this.http.get<IStarWarsCharacter[]>('./assets/star-wars.json');
  }

  private subscribeToDeleteCard(icm: any) {
    icm.deleteCardClicked.subscribe((c: StarWarsModel) => {
      const index = this.cards.indexOf(icm);
      this.cards.splice(index, 1);
      icm.deleteCardClicked.unsubscribe();
    }, () => {
    }, () => {
      console.log('delete click complete');
    });
  }

  goToDoc() {
    window.open("https://github.com/antsebastian/angular-pointer-panel", "_blank");
  }

  help() {
    this.snackBar.open('Click on an item to see the details. Click + icon to add a new item.',
      'Dismiss',
      {
        verticalPosition: 'bottom',
        duration: 5000
      });
  }

  ngOnDestroy(): void {
    this.sink.unsubscribe();
  }

}
