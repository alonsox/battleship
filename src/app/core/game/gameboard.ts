import * as _ from 'lodash';

import { IBoardCell, IGridPoint, IShipSpec } from '../interfaces';
import { Direction, CellState } from '../enums';
import { ShipType } from './ship-type';
import { Ship } from './ship';
import { Board } from './board';
import { BoardError } from './game-errors';

/** The board where the players put their ships and get attacked. */
export class Gameboard extends Board {
  private ships: Ship[];
  private board: IBoardCell[][];

  /** Creates a new Gameboard */
  constructor() {
    super();

    // SHIPS
    this.ships = [];

    // INITIALIZE BOARD
    this.board = [];
    for (let row = 0; row < this.height; row++) {
      const newRow: IBoardCell[] = [];
      for (let col = 0; col < this.width; col++) {
        newRow.push({ state: CellState.NotHit, shipInfo: null });
      }
      this.board.push(newRow);
    }
  }

  /** The number of ships on the board.  */
  get shipsCount(): number {
    return this.ships.length;
  }

  /** The number of ships that have not been sunk yet. */
  get aliveShipsCount(): number {
    return this.ships.reduce((aliveShipsCount: number, currentShip: Ship) => {
      return currentShip.isSunk() ? aliveShipsCount : aliveShipsCount + 1;
    }, 0);
  }

  /** @returns A copy of the board. */
  getBoardCopy(): IBoardCell[][] {
    return _.cloneDeep(this.board);
  }

  /**
   * Adds a new ship to the board
   *
   * @param shipType The type of the ship to be addded.
   * @param point Point to put the ship.
   * @param direction Direction to put the ship.
   *
   * @throws GameboardError if the ship cannot be added.
   */
  addShip(shipSpec: IShipSpec): void {
    // VALIDATION
    const result = this.isSafeToAddShip(shipSpec);
    if (result !== null) {
      throw result;
    }

    // ALL OK, ADD THE SHIP
    const newShip = new Ship(shipSpec.shipType);
    this.ships.push(newShip);

    for (let index = 0; index < newShip.size; index++) {
      // Determine position
      let row = shipSpec.position.row;
      let col = shipSpec.position.col;
      switch (shipSpec.direction as Direction) {
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
   * Checks if a ship can be safely added to the board or not.
   *
   * @param shipSpec The specification of where and how the ship will be added.
   *
   * @returns null if the ship fits with no errors, otherwise the error of why
   * the ship does not fit properly.
   */
  isSafeToAddShip(shipSpec: IShipSpec): BoardError {
    // CHECK IF THE SPECIFICATION IS NULL OR UNDEFINED
    if (!shipSpec) {
      return new BoardError('No ship specification provided');
    }

    // CHECK IF THE SPECIFICATION'S PROPERTIES ARE NULL OR UNDEFINED
    if (!shipSpec.shipType) {
      return new BoardError('The type of the ship is null or undefined');
    } else if (!shipSpec.position) {
      return new BoardError('The position is null or undefined');
    } else if (!shipSpec.direction) {
      return new BoardError('The direction is null or undefined');
    }

    // CHECK IF THE SHIP IS ADDED INSIDE THE GRID
    if (!this.isValidPoint(shipSpec.position)) {
      return new BoardError('The point to add the ship is out of the grid');
    }

    // CHECKS IF IT GETS OUT OF THE BOARD OR OVERLAPS WITH ANOTHER SHIP
    return this.doesShipFits(shipSpec);
  }

  /**
   * Checks if a ship overlaps with other ship or if the ship gets out of the
   * board.
   *
   * @param shipSpec The specification of where and how the ship will be added.
   *
   * @returns null if the ship fits with no errors, otherwise the error of why
   * the ship does not fit properly.
   */
  private doesShipFits(shipSpec: IShipSpec): BoardError {
    const { shipType, position, direction } = shipSpec;

    for (let index = 0; index < shipType.size; index++) {
      // Determine the position for the ship's segment
      let row = position.row;
      let col = position.col;

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
      if (!this.isValidPoint({ row, col })) {
        return new BoardError('The ship goes out of the board');
      }

      // The cell is used by another ship
      if (this.board[row][col].shipInfo != null) {
        return new BoardError('The ship overlaps with another ship');
      }
    }

    // ALL OK
    return null;
  }

  /**
   * Receives an attack from an enemy.
   *
   * @param position The point where the attack was made.
   *
   * @throws GameboardError if the attack is out of the grid or the point is
   * invalid.
   */
  receiveAttack(position: IGridPoint): void {
    if (!position) {
      throw new BoardError('The attack point is null or undefined');
    }

    if (!this.isValidPoint(position)) {
      throw new BoardError('Cannot receive an attack in an invalid position');
    }

    // Attack the grid
    const attackedCell = this.board[position.row][position.col];
    attackedCell.state = CellState.Hit;
    if (attackedCell.shipInfo) {
      const { shipId, shipSegment } = attackedCell.shipInfo;
      this.ships.find((ship) => ship.id === shipId).hit(shipSegment);
    }
  }

  /**
   * @returns true if all the ships in the board are sunk; false otherwise.
   */
  areAllShipsSunk(): boolean {
    return this.aliveShipsCount === 0;
  }

  /**
   * Indicate how many types of a certain ship are in the board.
   *
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

  /** Removes all the ships and attacks from the board. */
  reset(): void {
    // Delete ships
    this.ships.splice(0, this.ships.length);

    // Reset board
    this.board.forEach((row) => {
      row.forEach((cell) => {
        cell.state = CellState.NotHit;
        cell.shipInfo = null;
      });
    });
  }
}
