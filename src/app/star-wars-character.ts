import {Directive, EventEmitter, Output} from "@angular/core";

export interface IStarWarsCharacter {
  name: string
  avatarSrc: string
  fullSrc: string
  subtitle: string
  fullDesc: string
  birthdate: string
}


/**
 Mock data type for individual star wars character.
 **/
@Directive()
export class StarWarsModel {

  @Output() deleteCardClicked: EventEmitter<StarWarsModel> = new EventEmitter();

  constructor(public starWarsChar: IStarWarsCharacter) {
  }


  // TODO: temporary place for item events until I figure out best way to pass item events into item template.
  deleteCard($event: any) {
    $event.stopPropagation();   // TODO: need a declarative way to stop event propagation.
    this.deleteCardClicked.emit(this);
    // return false; didn't work to stop event
  }
}
