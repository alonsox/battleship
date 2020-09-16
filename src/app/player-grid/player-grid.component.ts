import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
} from '@angular/core';

import { GameService } from '../core/services/game.service';
import {
  IBoardCell,
  IShipSpec,
  Credential,
  IAttackReport,
} from '../core/interfaces';
import { CellState, Direction, PlayerType } from '../core/enums';
import { UiCommunicationService } from '../services/ui-communication.service';
import { Subscription } from 'rxjs';
import { ShipType } from '../core/game/ship-type';

@Component({
  selector: 'app-player-grid',
  templateUrl: './player-grid.component.html',
  styleUrls: ['./player-grid.component.css'],
})
export class PlayerGridComponent implements OnInit, OnDestroy {
  playerBoard: IBoardCell[][];

  CellState = CellState;
  player: Credential;
  playerName: string;

  newShipSubsription: Subscription;
  attackReportSub: Subscription;
  newRoundSub: Subscription;

  @Output() humanPlayerIdEvent = new EventEmitter<number>();

  constructor(
    private gameService: GameService,
    private newShipService: UiCommunicationService,
  ) {}

  ngOnInit(): void {
    // Add new ship
    this.newShipSubsription = this.newShipService
      .getShipSpec()
      .subscribe((shipSpec: IShipSpec) => {
        if (this.gameService.addShip(this.player, shipSpec)) {
          this.getPlayerBoard();
        }
      });

    // Get attack reports
    this.attackReportSub = this.gameService
      .getAttackReport()
      .subscribe((attack: IAttackReport) => {
        if (attack.victimId === this.player.id) {
          this.getPlayerBoard();
        }
      });

    // Notification of new round
    this.newRoundSub = this.gameService
      .getNewRoundNotification()
      .subscribe(() => {
        this.getPlayerBoard();
      });

    // Create player
    this.player = this.gameService.createPlayer('You', PlayerType.Person);
    this.playerName = this.gameService.getPlayerName(this.player.id);
    this.humanPlayerIdEvent.emit(this.player.id);
    this.getPlayerBoard();
  }

  ngOnDestroy(): void {
    this.newShipSubsription.unsubscribe();
    this.attackReportSub.unsubscribe();
    this.newRoundSub.unsubscribe();
  }

  getCellClass(cell: IBoardCell): string {
    if (cell.state === CellState.Hit) {
      return !cell.shipInfo ? 'empty-cell-hit' : 'ship-cell-hit ';
    } else {
      return !cell.shipInfo ? 'empty-cell' : 'ship-cell';
    }
  }

  private getPlayerBoard() {
    this.playerBoard = this.gameService.getPlayerBoard(this.player);
  }
}
