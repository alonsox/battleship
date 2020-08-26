import * as _ from 'lodash';

import { Gameboard, GameboardError } from './gameboard';
import { IGridPoint, IBoardCell, IAttackReport, IAttack } from '../interfaces';
import { Direction } from '../enums';
import { ShipType } from './ship-type';
import { IdGenerator } from 'src/app/shared/id-generator';

interface IEnemyInfo {
  id: number; // An enemy's ID
  isAlive: boolean; // true if this enemy has not lost
  board: boolean[][]; // True if that cell was hit, false otherwise
}

export class PlayerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PlayerError';
  }
}

export class BasePlayer {
  private static idGenerator = new IdGenerator();
  private readonly _id: number; // number greater than 0
  private _name: string;
  private _winsCount: number;
  private gameboard: Gameboard;

  constructor(name: string) {
    if (!name) {
      throw new PlayerError('The name is null, undefined, or an empty string');
    }

    this._name = name;
    this._winsCount = 0;
    this._id = BasePlayer.idGenerator.nextId();
    this.gameboard = new Gameboard();
  }

  /** The player's ID. */
  get id(): number {
    return this._id;
  }

  /** The player's name. */
  get name(): string {
    return this._name;
  }

  /** The number of games won by the player. */
  get score(): number {
    return this._winsCount;
  }

  /** @returns The number of ships that have not been sunk yet */
  getAliveShipsCount(): number {
    return this.gameboard.aliveShips;
  }

  /** @returns The number of ships that have been sunk */
  getSunkShipsCount(): number {
    return this.gameboard.sunkShips;
  }

  /** @returns The total number of ships available on the board (sunk or not) */
  getShipsCount(): number {
    return this.gameboard.availableShips;
  }

  /** @returns The size of the board */
  getBoardSize(): number {
    return this.gameboard.size;
  }

  /** @returns A copy of board */
  getBoardCopy(): IBoardCell[][] {
    return this.gameboard.getBoardCopy();
  }

  /** Adds a win to the player's win count */
  addWin(): void {
    this._winsCount += 1;
  }

  /**
   * Adds a new ship to the player's board.
   *
   * @param shipType The type of the ship to be addded.
   * @param point Point to put the ship.
   * @param direction Direction to put the ship.
   *
   * @throws PlayerError if the ship could not be added.
   */
  addShip(shipType: ShipType, point: IGridPoint, direction: Direction): void {
    try {
      this.gameboard.addShip(shipType, point, direction);
    } catch (e) {
      if (e instanceof GameboardError) {
        throw new PlayerError((e as GameboardError).message);
      }
    }
  }

  /**
   * Receives an attack from an enemy.
   *
   * @param point The point where the attack was made.
   *
   * @throws PlayerError if the attack is out of the grid or the point is invalid.
   */
  receiveAttack(attackPoint: IGridPoint): void {
    try {
      this.gameboard.receiveAttack(attackPoint);
    } catch (e) {
      throw new PlayerError((e as Error).message);
    }
  }

  /**
   * Checks if a player has lost or not.
   *
   * @returns
   * true if all the ships of the have been sunk; false otherwise. If the player
   * has no ships yet, is considered as if the player has lost.
   */
  hasLost(): boolean {
    return this.gameboard.areAllShipsSunk();
  }

  protected isValidPoint(point: IGridPoint): boolean {
    return (
      point.row >= 0 &&
      point.row < this.getBoardSize() &&
      point.col >= 0 &&
      point.col < this.getBoardSize()
    );
  }
}

export class ComputerPlayer extends BasePlayer {
  private enemies: IEnemyInfo[];

  /** Creates a new automated player */
  constructor(name: string) {
    super(name);

    this.enemies = [];
  }

  /**
   * @returns A point to attack an enemy and the attacked enemy's ID.
   *
   * @throws PlayerError when there are no other players to attack.
   * */
  makeMove(): IAttack {
    if (this.getEnemiesCount() === 0) {
      throw new PlayerError('There are no enemies to attack');
    }

    // Get random enemy
    let enemy: IEnemyInfo;
    do {
      enemy = this.getEnemy();
    } while (!enemy.isAlive);

    // Select attack point
    let row: number;
    let col: number;
    do {
      row = this.getRandomNumber(0, this.getBoardSize());
      col = this.getRandomNumber(0, this.getBoardSize());
    } while (enemy.board[row][col]);

    // Attack!
    return {
      attackedPlayerId: enemy.id,
      attackedPoint: { row, col },
    };
  }

  private getRandomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  /**
   * Receives an inform of an attack made to an enemy. Null or undefined attacks
   * or attack points are ignored. The same applies if the attacked player is
   * 'this' player or if the attacked player has not been acknoledge.
   */
  receiveAttackReport(attackReport: IAttackReport): void {
    // INITIAL VALIDATION
    if (!attackReport) {
      return;
    }

    if (!attackReport.attackedPoint) {
      return;
    }

    // TAKE ACTIONS ON ATTACK
    const {
      hasAttackedPlayerLost,
      attackedPlayerId,
      attackedPoint,
    } = attackReport;

    // Ignore if attacked player is 'this' player
    if (attackedPlayerId === this.id) {
      return;
    }

    // Find enemy board
    const enemy = this.enemies.find(
      (enemyInfo) => enemyInfo.id === attackedPlayerId,
    );

    // Mark the attack
    if (enemy.board && this.isValidPoint(attackedPoint)) {
      enemy.board[attackedPoint.row][attackedPoint.col] = true;
    }

    // Mark as dead (if it died)
    enemy.isAlive = !hasAttackedPlayerLost;
  }

  /**
   * Accepts a new player as an enemy. If the new player's ID is the same as
   * 'this' player it is ignored. The same applies if the new enemy has already
   * been acknoledge. */
  acknowledgeEnemy(newPlayerId: number): void {
    if (newPlayerId === this.id) {
      return;
    }

    // Create enemy's board
    const enemyBoard = [];
    for (let i = 0; i < this.getBoardSize(); i++) {
      const row: boolean[] = [];
      for (let j = 0; j < this.getBoardSize(); j++) {
        row.push(false);
      }
      enemyBoard.push(row);
    }

    // Add enemy (if it does not exist)
    if (!this.enemies.find((enemyInfo) => enemyInfo.id === newPlayerId))
      this.enemies.push({
        id: newPlayerId,
        isAlive: true,
        board: enemyBoard,
      });
  }

  /** @returns The number of acknowledged enemies */
  protected getEnemiesCount(): number {
    return this.enemies.length;
  }

  /**
   * Gets the information about a specific enemy.
   *
   * If the ID of the enemy is not specified it will return a random enemy. If
   * there are no enemies or the enemy ID does not exist, it will also return
   * null.
   *
   * @param enemyId The id of the enemy we want the information from.
   *
   * @returns A copy of the information about an enemy.
   */
  protected getEnemy(enemyId?: number): IEnemyInfo {
    if (this.getEnemiesCount() === 0) {
      return null;
    }

    if (enemyId) {
      const enemy = this.enemies.find((enemyInfo) => enemyInfo.id === enemyId);
      return enemy ? _.cloneDeep(enemy) : null;
    } else {
      const randomIndex = Math.floor(Math.random() * this.getEnemiesCount());
      return _.cloneDeep(this.enemies[randomIndex]);
    }
  }
}
