import * as _ from 'lodash';

import { Board } from './board';
import { IGridPoint } from '../interfaces';
import { CellState } from '../enums';
import { BoardError } from './game-errors';

/**
 * A board that it serves to keep track of the attacks that other players have
 * received.
 */
export class TrackingBoard extends Board {
  private _enemyId: number;
  private _isEnemyAlive: boolean;
  private board: CellState[][];

  /**
   * Creates a new tracking board.
   *
   * @param enemyId The id of the enemy that will be tracked.
   */
  constructor(enemyId: number) {
    super();

    if (!enemyId) {
      throw new BoardError("The enemy's ID is null or undefined");
    }

    // Initialize fields
    this._enemyId = enemyId;
    this._isEnemyAlive = true;

    // Initialize board
    this.board = [];
    for (let row = 0; row < this.height; row++) {
      const newRow: CellState[] = [];
      for (let col = 0; col < this.width; col++) {
        newRow.push(CellState.NotHit);
      }
      this.board.push(newRow);
    }
  }

  /** The ID of the enemy. */
  get enemyId(): number {
    return this._enemyId;
  }

  /** @returns true if the enemy has not lost yet; false otherwise. */
  isEnemyAlive(): boolean {
    return this._isEnemyAlive;
  }

  /** Kills the enemy, that is, the enemy lost. */
  killEnemy(): void {
    this._isEnemyAlive = false;
  }

  /** @returns A copy of the board. */
  getBoardCopy(): CellState[][] {
    return _.cloneDeep(this.board);
  }

  /**
   * Registers an attack to the board.
   *
   * @param point The point where the attack is being carried out.
   *
   * @throws BoardError if the point is null, undefined or is not valid.
   */
  trackAttack(point: IGridPoint): void {
    if (!point) {
      throw new BoardError('The attack point is null or undefined');
    }

    if (!this.isValidPoint(point)) {
      throw new BoardError('Cannot track an attack in an invalid point');
    }

    this.board[point.row][point.col] = CellState.Hit;
  }

  /** @returns true if the cell was hit; false otherwise (this includes the
   * cases in which the point is null, undefined or outside the board). */
  wasCellHit(point: IGridPoint): boolean {
    if (!point) {
      return false;
    }

    if (!this.isValidPoint(point)) {
      return false;
    }

    switch (this.board[point.row][point.col] as CellState) {
      case CellState.Hit:
        return true;
      default:
        return false;
    }
  }

  /** Removes all tracking marks from the board and marks the enemy as alive. */
  reset(): void {
    this._isEnemyAlive = true;
    this.board.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        this.board[rowIndex][colIndex] = CellState.NotHit;
      });
    });
  }
}
