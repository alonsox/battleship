import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';

import { IBoardCell, Credential, IAttackReport } from '../core/interfaces';
import { CellState, PlayerType, GamePhase } from '../core/enums';
import { GameService } from '../core/services/game.service';

@Component({
  selector: 'app-computer-grid',
  templateUrl: './computer-grid.component.html',
  styleUrls: ['./computer-grid.component.css'],
})
export class ComputerGridComponent implements OnInit, OnDestroy {
  computerBoard: IBoardCell[][];

  CellState = CellState;

  player: Credential;
  computerName: string;
  gamePhase: GamePhase;
  currentPlayerId: number;

  @Input() otherPlayerId: number;

  newShipSubsription: Subscription;
  gamePhaseSub: Subscription;
  currentPlayerIdSub: Subscription;
  attackReportSub: Subscription;
  newRoundSub: Subscription;

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    // Find game phase
    this.gamePhaseSub = this.gameService
      .getGamePhase()
      .subscribe((phase: GamePhase) => {
        this.gamePhase = phase;
      });

    // Get current player ID
    this.currentPlayerIdSub = this.gameService
      .getCurrentPlayer()
      .subscribe((playerId: number) => (this.currentPlayerId = playerId));

    // Receive attack reports
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
    this.player = this.gameService.createPlayer(
      'Computer',
      PlayerType.Computer,
    );
    this.computerName = this.gameService.getPlayerName(this.player.id);
    this.getPlayerBoard();
  }

  ngOnDestroy(): void {
    this.newShipSubsription.unsubscribe();
    this.gamePhaseSub.unsubscribe();
    this.currentPlayerIdSub.unsubscribe();
    this.attackReportSub.unsubscribe();
    this.newRoundSub.unsubscribe();
  }

  cellClicked(row: number, col: number): void {
    if (this.gamePhase === GamePhase.Playing) {
      this.gameService.attack(this.otherPlayerId, this.player.id, { row, col });
    }
  }

  getCellClass(cell: IBoardCell): string {
    if (cell.state === CellState.Hit) {
      return !cell.shipInfo ? 'empty-cell-hit' : 'ship-cell-hit ';
    } else {
      return 'empty-cell';
    }
  }

  private getPlayerBoard() {
    this.computerBoard = this.gameService.getPlayerBoard(this.player);
  }
}
