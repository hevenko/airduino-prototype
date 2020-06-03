import {BehaviorSubject} from 'rxjs';
import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class MessageService {
  messageBus: BehaviorSubject<string[]> = new BehaviorSubject<string[]>(null);

  constructor() {
    console.log('MessageService created');
  }
}
