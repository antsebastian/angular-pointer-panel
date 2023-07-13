import {Component} from '@angular/core';
import {Observable, of} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {IStarWarsCharacter, StarWarsModel} from "./star-wars-character";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  public cards: Array<StarWarsModel> = new Array<StarWarsModel>();
  $cards = of(this.cards);

  uniqueId = 0;

  constructor(private http: HttpClient) {

    // get the mock data
    this.getJSON().subscribe(data => {
      data.forEach(item => {
        const icm = new StarWarsModel(item);
        this.subscribeToDeleteCard(icm);
        this.cards.push(icm);
      });
    });
  }


  addCard() {
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
}
