import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { UiCommunicationService } from '../services/ui-communication.service';
import { ShipType } from '../core/game/ship-type';
import { IShipSpec } from '../core/interfaces';
import { Direction, GamePhase } from '../core/enums';
import { GameService } from '../core/services/game.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-control-panel',
  templateUrl: './control-panel.component.html',
  styleUrls: ['./control-panel.component.css'],
})
export class ControlPanelComponent implements OnInit, OnDestroy {
  rows: number[];
  cols: number[];
  shipTypes = ShipType.ALL_SHIPS;
  directions = ['horizontal', 'vertical'];

  gameOngoing = false;
  gamePhaseSub: Subscription;

  shipInfoForm = new FormGroup({
    row: new FormControl('1'),
    column: new FormControl('1'),
    direction: new FormControl('horizontal'),
    shipType: new FormControl('carrier'),
  });

  constructor(
    private newShipService: UiCommunicationService,
    private gameService: GameService,
  ) {}

  ngOnDestroy(): void {
    this.gamePhaseSub.unsubscribe();
  }

  ngOnInit(): void {
    this.rows = [];
    this.cols = [];
    const size = 10;
    for (let i = 0; i < size; i++) {
      this.rows.push(i + 1);
      this.cols.push(i + 1);
    }

    // Get the game phase
    this.gamePhaseSub = this.gameService
      .getGamePhase()
      .subscribe((phase: GamePhase) => {
        this.gameOngoing = phase === GamePhase.Playing;
      });
  }

  onSubmit(): void {
    const { row, column, direction, shipType } = this.shipInfoForm.value;

    /* 1 is subtracted from the row and the column in order to adjust to the
     * indexing used by the game service (that starts from 0) */
    const shipSpec: IShipSpec = {
      position: { row: +row - 1, col: +column - 1 },
      direction:
        direction === this.directions[0] ? Direction.Right : Direction.Down,
      shipType: ShipType.ALL_SHIPS.find((ship) => ship.type === shipType),
    };

    this.newShipService.sendNewShipSpec(shipSpec);
  }

  onStartGame(): void {
    this.gameService.startGame();
  }
  onNewRound(): void {
    this.gameService.newRound();
  }
}
