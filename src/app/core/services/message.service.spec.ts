import { TestBed } from '@angular/core/testing';

import { MessageService } from './message.service';
import { IMessage } from '../interfaces';
import { MessageStatus } from '../enums';
import { Subscription } from 'rxjs';

describe('MessageService', () => {
  let message$: MessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    message$ = TestBed.inject(MessageService);
  });

  it('Sends a message', (done: DoneFn) => {
    // SETUP
    const msgBody = 'asdfasdf';
    const msgStatus = MessageStatus.OK;

    // PREPARE TO RECEIVE AND ASSERT
    const sub: Subscription = message$.receive().subscribe((msg: IMessage) => {
      expect(msg.body).toBe(msgBody);
      expect(msg.status).toBe(msgStatus);
      done();
    });

    // SEND MESSAGE
    message$.send({ status: msgStatus, body: msgBody });

    // CLEAN UP
    sub.unsubscribe();
  });
});
