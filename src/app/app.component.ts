import {AfterViewInit, Component} from '@angular/core';
import {Observable, of} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {IStarWarsCharacter, StarWarsModel} from "./star-wars-character";
import {MatSnackBar} from "@angular/material/snack-bar";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

  public cards: Array<StarWarsModel> = new Array<StarWarsModel>();
  $cards = of(this.cards);

  uniqueId = 0;

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {

    // get the mock data
    this.getJSON().subscribe(data => {
      data.forEach(item => {
        const icm = new StarWarsModel(item);
        this.subscribeToDeleteCard(icm);
        this.cards.push(icm);
      });
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.snackBar.open('Click on an item to see the details. Click + icon to add a new item.',
        'Dismiss');

    }, 750);
  }


  addItem() {
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
}
