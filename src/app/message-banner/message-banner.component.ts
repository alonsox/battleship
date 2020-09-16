import { Component, OnDestroy, OnInit } from '@angular/core';

import { MessageService } from '../core/services/message.service';
import { IMessage } from '../core/interfaces';
import { MessageStatus } from '../core/enums';
import { Subscription } from 'rxjs';
import { GameService } from '../core/services/game.service';

@Component({
  selector: 'app-message-banner',
  templateUrl: './message-banner.component.html',
  styleUrls: ['./message-banner.component.css'],
})
export class MessageBannerComponent implements OnInit, OnDestroy {
  message = '';

  messageServiceSub: Subscription;
  winnerSub: Subscription;

  constructor(
    private messageService: MessageService,
    private gameService: GameService,
  ) {}

  ngOnInit(): void {
    this.messageServiceSub = this.messageService
      .receive()
      .subscribe((msg: IMessage) => {
        this.message =
          msg.status === MessageStatus.Error ||
          msg.status === MessageStatus.Warning
            ? msg.body
            : '';
      });

    this.winnerSub = this.gameService
      .getWinner()
      .subscribe((winnerId: number) => {
        const winnerName = this.gameService.getPlayerName(winnerId);
        this.message = `${winnerName} wins`;
      });
  }

  ngOnDestroy(): void {
    this.messageServiceSub.unsubscribe();
    this.winnerSub.unsubscribe();
  }
}
