import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { IMessage } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private msgSubject = new Subject<IMessage>();

  constructor() {}

  send(message: IMessage): void {
    this.msgSubject.next(message);
  }

  receive(): Observable<IMessage> {
    return this.msgSubject.asObservable();
  }
}
