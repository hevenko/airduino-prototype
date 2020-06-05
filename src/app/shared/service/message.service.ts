import {BehaviorSubject} from 'rxjs';
import {Injectable} from '@angular/core';

export enum MessageColor {
  Green,
  Yellow,
  Red
}

export interface iMessage {
  message: string;
  messageColor: MessageColor;
}

@Injectable({providedIn: 'root'})
export class MessageService {
  messageBus: BehaviorSubject<iMessage[]> = new BehaviorSubject<iMessage[]>(null);

  constructor() {
    console.log('MessageService created');
  }
  showMessage(msg: string, msgColor: MessageColor) {
    this.messageBus.next([{message: msg, messageColor: msgColor}]);
  }
}
