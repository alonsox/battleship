import * as _ from 'lodash';

import { IBoardCell, IGridPoint } from '../interfaces';
import { Direction } from '../enums';
import { ShipType } from './ship-type';
import { Ship } from './ship';

export class GameboardError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GameboardError';
  }
}

export class Gameboard {
  private ships: Ship[];
  private readonly boardSize = 10;
  private board: IBoardCell[][];

  /** Creates a new Gameboard */
  constructor() {
    this.ships = [];
    this.board = [];
    for (let i = 0; i < this.boardSize; i++) {
      const newRow: IBoardCell[] = [];
      for (let j = 0; j < this.boardSize; j++) {
        newRow.push({ hit: false, shipInfo: null });
      }
      this.board.push(newRow);
    }
  }

  /**
   * Adds a new ship to the board
   *
   * @param shipType The type of the ship to be addded.
   * @param point Point to put the ship.
   * @param direction Direction to put the ship.
   *
   * @throws GameboardError if the ship could not be added.
   */
  addShip(shipType: ShipType, point: IGridPoint, direction: Direction): void {
    // BASIC VALIDATION
    if (!shipType) {
      throw new GameboardError('The type of the ship is null or undefined');
    } else if (!point) {
      throw new GameboardError('The point is null or undefined');
    } else if (!direction) {
      throw new GameboardError('The direction is null or undefined');
    }

    // CHECK IF THERE IS SPACE FOR THE SHIP
    if (!this.isValidPoint(point)) {
      throw new GameboardError('The point to add the ship is out of the grid');
    }

    const result = this.doesShipFits(shipType, point, direction);
    if (result.error) {
      throw new GameboardError(result.error);
    }

    // ALL OK, ADD THE SHIP
    const newShip = new Ship(shipType);
    this.ships.push(newShip);

    for (let index = 0; index < newShip.size; index++) {
      // Determine position
      let row = point.row;
      let col = point.col;
      switch (direction as Direction) {
        case Direction.Up:
          row -= index;
          break;
        case Direction.Down:
          row += index;
          break;
        case Direction.Left:
          col -= index;
          break;
        case Direction.Right:
          col += index;
          break;
        default:
          break;
      }

      // Add ship to the board
      this.board[row][col].shipInfo = {
        shipId: newShip.id,
        shipSegment: index,
      };
    }
  }

  /**
   * @param point The point to test.
   *
   * @returns true if the point is in the grid; false if not.
   */
  isValidPoint(point: IGridPoint): boolean {
    if (!point) {
      return false;
    }

    return (
      point.row >= 0 &&
      point.row < this.boardSize &&
      point.col >= 0 &&
      point.col < this.boardSize
    );
  }

  private doesShipFits(
    shipType: ShipType,
    point: IGridPoint,
    direction: Direction,
  ): { error?: string } {
    for (let index = 0; index < shipType.size; index++) {
      // Determine the position for the ship's segment
      let row = point.row;
      let col = point.col;

      switch (direction as Direction) {
        case Direction.Up:
          row -= index;
          break;
        case Direction.Down:
          row += index;
          break;
        case Direction.Left:
          col -= index;
          break;
        case Direction.Right:
          col += index;
          break;
        default:
          break;
      }

      // The ship segment is out of the board
      if (
        row < 0 ||
        row >= this.boardSize ||
        col < 0 ||
        col >= this.boardSize
      ) {
        return { error: 'The ship goes out of the board' };
      }

      // The cell is used by another ship
      if (this.board[row][col].shipInfo != null) {
        return { error: 'The ship overlaps with another ship' };
      }
    }

    return {};
  }

  /**
   * Receives an attack from an enemy.
   *
   * @param point The point where the attack was made.
   *
   * @throws GameboardError if the attack is out of the grid or the point is
   * invalid.
   */
  receiveAttack(point: IGridPoint): void {
    if (!point) {
      throw new GameboardError('The attack point is null or undefined');
    }

    if (!this.isValidPoint(point)) {
      throw new GameboardError(
        'Cannot receive an attack in a point outside the grid',
      );
    }

    // Attack the grid
    const attackedCell = this.board[point.row][point.col];
    attackedCell.hit = true;
    if (attackedCell.shipInfo) {
      const { shipId, shipSegment } = attackedCell.shipInfo;
      this.ships.find((ship) => ship.id === shipId).hit(shipSegment);
    }
  }

  /**
   * @returns true if all the ships in the board are sunk; false otherwise.
   */
  areAllShipsSunk(): boolean {
    return this.aliveShips === 0;
  }

  /**
   * @param shipType The ship type to search.
   *
   * @returns A number indicating how many ships of such type are in the board.
   * If the ship type is null or undefined it returns 0.
   */
  hasShip(shipType: ShipType): number {
    if (!shipType) {
      return 0;
    }

    return this.ships.filter((ship) => ship.type === shipType.type).length;
  }

  /**
   * Removes all the ships and attacks from the board.
   */
  reset(): void {
    // Delete ships
    this.ships = [];

    // Reset board
    this.board.forEach((row) => {
      row.forEach((cell) => {
        cell.hit = false;
        cell.shipInfo = null;
      });
    });
  }

  /**
   * @returns A copy of the board.
   */
  getBoardCopy(): IBoardCell[][] {
    return _.cloneDeep(this.board);
  }

  /**
   * The size of the board.
   */
  get size(): number {
    return this.boardSize;
  }

  /**
   * The number of ships on the board.
   */
  get availableShips(): number {
    return this.ships.length;
  }

  /**
   * The number of sunk ships.
   */
  get sunkShips(): number {
    return this.ships.reduce((sunkShipCount, currentShip) => {
      return currentShip.isSunk() ? sunkShipCount + 1 : sunkShipCount;
    }, 0);
  }

  /**
   * The number of ships that have not been sunk yet.
   */
  get aliveShips(): number {
    return this.availableShips - this.sunkShips;
  }
}
