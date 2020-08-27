import { ShipType } from './ship-type';
import { Gameboard, GameboardError } from './gameboard';
import { Direction } from '../enums';
import { IGridPoint } from '../interfaces';

describe('Gameboard', () => {
  let gameboard: Gameboard;

  beforeEach(() => {
    gameboard = new Gameboard();
  });

  it('Creates a new empty Board', () => {
    const board = gameboard.getBoardCopy();

    board.forEach((row) => {
      row.forEach((cell) => {
        expect(cell.hit).toBeFalse();
        expect(cell.shipInfo).toBe(null);
      });
    });
  });

  it('Changing board copy does not affect the internal board', () => {
    const boardCopy = gameboard.getBoardCopy();

    // Just the coordinates of a random point in the board
    const row = 3;
    const col = 8;

    // Modify board
    boardCopy[row][col].hit = true; // Originally false
    boardCopy[row][col].shipInfo = { shipId: 2, shipSegment: 4 };

    // Get the gameboard again
    const boardOriginal = gameboard.getBoardCopy();

    // Original table should not be modified
    expect(boardOriginal[row][col].hit).toBeFalse();
    expect(boardOriginal[row][col].shipInfo).toBeNull();
  });

  it('Throws error on null or undefined invalid parameters', () => {
    // Undefined on purpose
    let undefinedShipType: ShipType;
    let undefinedPosition: IGridPoint;
    let undefinedDirection: Direction;

    // INVALID SHIP TYPE
    expect(() =>
      gameboard.addShip(null, { row: 0, col: 0 }, Direction.Up),
    ).toThrowError(GameboardError);

    expect(() =>
      gameboard.addShip(undefinedShipType, { row: 0, col: 0 }, Direction.Up),
    ).toThrowError(GameboardError);

    // INVALID GRID POINT
    expect(() =>
      gameboard.addShip(ShipType.BATTLESHIP, null, Direction.Up),
    ).toThrowError(GameboardError);

    expect(() =>
      gameboard.addShip(ShipType.BATTLESHIP, undefinedPosition, Direction.Up),
    ).toThrowError(GameboardError);

    // INVALID DIRECTION
    expect(() =>
      gameboard.addShip(ShipType.BATTLESHIP, { row: 0, col: 0 }, null),
    ).toThrowError(GameboardError);

    expect(() =>
      gameboard.addShip(
        ShipType.SUBMARINE,
        { row: 0, col: 0 },
        undefinedDirection,
      ),
    ).toThrowError(GameboardError);
  });

  it('Throws error when adding a ship in a point out of the grid', () => {
    // ROW OR COLUMN NEGATIVE
    expect(() =>
      gameboard.addShip(ShipType.CARRIER, { row: -1, col: 0 }, Direction.Right),
    ).toThrowError(GameboardError);

    expect(() =>
      gameboard.addShip(ShipType.CARRIER, { row: 0, col: -1 }, Direction.Right),
    ).toThrowError(GameboardError);

    // ROW OR COLUMN GREATER THAN THE BOARD SIZE
    expect(() =>
      gameboard.addShip(
        ShipType.CARRIER,
        { row: gameboard.size, col: 0 },
        Direction.Right,
      ),
    ).toThrowError(GameboardError);

    expect(() =>
      gameboard.addShip(
        ShipType.CARRIER,
        { row: 0, col: gameboard.size },
        Direction.Up,
      ),
    ).toThrowError(GameboardError);
  });

  it('Throws error when a ship gets out of the board', () => {
    // OUT FROM ABOVE
    expect(function () {
      gameboard.addShip(ShipType.SUBMARINE, { row: 0, col: 4 }, Direction.Up);
    }).toThrowError(GameboardError);

    // OUT FROM BELOW
    expect(() =>
      gameboard.addShip(
        ShipType.BATTLESHIP,
        { row: gameboard.size - 1, col: 5 },
        Direction.Down,
      ),
    ).toThrowError(GameboardError);

    // OUT FROM THE LEFT
    expect(() =>
      gameboard.addShip(
        ShipType.BATTLESHIP,
        { row: 7, col: 0 },
        Direction.Left,
      ),
    ).toThrowError(GameboardError);

    // OUT FROM THE RIGHT
    expect(() =>
      gameboard.addShip(
        ShipType.BATTLESHIP,
        { row: 7, col: gameboard.size - 1 },
        Direction.Right,
      ),
    ).toThrowError(GameboardError);
  });

  it('Throws error on ships overlapping', () => {
    // SETUP
    gameboard.addShip(ShipType.CARRIER, { row: 0, col: 0 }, Direction.Right);

    // OVERLAPS EXACTLY
    expect(() =>
      gameboard.addShip(ShipType.CARRIER, { row: 0, col: 0 }, Direction.Right),
    ).toThrowError(GameboardError);

    // OVERLAPS IN A PART
    expect(() =>
      gameboard.addShip(
        ShipType.BATTLESHIP,
        { row: 0, col: 3 },
        Direction.Down,
      ),
    ).toThrowError(GameboardError);
  });

  it('Adds the ship correctly', () => {
    // SET UP
    const row = 4;
    const col = 6;
    const shipType = ShipType.CRUISER;

    // ACT
    gameboard.addShip(shipType, { row, col }, Direction.Down);

    // ASSERT
    const board = gameboard.getBoardCopy();
    for (let i = 0; i < shipType.size; i++) {
      // No attacks have been done yet
      expect(board[row + i][col].hit).toBeFalse();
      // Ship was added
      expect(board[row + i][col].shipInfo).not.toBe(null);
    }

    expect(gameboard.availableShips).toBe(1);
  });

  it('Throws error when attacking in a null or undefined point', () => {
    // SET UP
    let point: IGridPoint; // Undefined on purpose

    // ASSERT
    expect(() => gameboard.receiveAttack(null)).toThrowError(GameboardError);
    expect(() => gameboard.receiveAttack(point)).toThrowError(GameboardError);
  });

  it('Throws error when receiving an attack outside the grid', () => {
    // ROW OR COLUMN NEGATIVE
    expect(() => gameboard.receiveAttack({ row: -1, col: 0 })).toThrowError(
      GameboardError,
    );

    expect(() => gameboard.receiveAttack({ row: 0, col: -1 })).toThrowError(
      GameboardError,
    );

    // ROW OR COLUMN GREATER THAN THE BOARD SIZE
    expect(() =>
      gameboard.receiveAttack({ row: gameboard.size, col: 0 }),
    ).toThrowError(GameboardError);

    expect(() =>
      gameboard.receiveAttack({ row: 0, col: gameboard.size }),
    ).toThrowError(GameboardError);
  });

  it('All ships should be sunk', () => {
    // SET UP: add ship and sunk it
    gameboard.addShip(ShipType.SUBMARINE, { row: 8, col: 8 }, Direction.Left);
    gameboard.addShip(ShipType.SUBMARINE, { row: 2, col: 2 }, Direction.Down);

    // ACT 1
    gameboard.receiveAttack({ row: 2, col: 2 });
    gameboard.receiveAttack({ row: 3, col: 2 });
    gameboard.receiveAttack({ row: 4, col: 2 });

    gameboard.receiveAttack({ row: 8, col: 8 });
    gameboard.receiveAttack({ row: 8, col: 7 });
    gameboard.receiveAttack({ row: 8, col: 2 }); // <= attack missed on purpose

    // ASSERT 1
    expect(gameboard.areAllShipsSunk()).toBeFalse();
    expect(gameboard.aliveShips).toBe(1);
    expect(gameboard.sunkShips).toBe(1);

    // ACT 2
    gameboard.receiveAttack({ row: 8, col: 6 }); // <= Attack corrected

    // ASSERT 2
    expect(gameboard.areAllShipsSunk()).toBeTrue();
    expect(gameboard.aliveShips).toBe(0);
    expect(gameboard.sunkShips).toBe(2);
  });

  it('Resets the board', () => {
    // SET UP: Add some ships and make some random attacks
    gameboard.addShip(ShipType.SUBMARINE, { row: 2, col: 2 }, Direction.Down);
    gameboard.addShip(ShipType.SUBMARINE, { row: 8, col: 8 }, Direction.Left);
    gameboard.receiveAttack({ row: 4, col: 5 });
    gameboard.receiveAttack({ row: 8, col: 8 });
    gameboard.receiveAttack({ row: 6, col: 3 });

    // ACT
    gameboard.reset();

    // ASSERT
    expect(gameboard.availableShips).toBe(0);

    gameboard.getBoardCopy().forEach((row) => {
      row.forEach((cell) => {
        expect(cell.hit).toBeFalse();
        expect(cell.shipInfo).toBe(null);
      });
    });
  });

  it('#isValidPoint does its job', () => {
    // NULL OR UNDEFINED
    expect(gameboard.isValidPoint(null)).toBeFalse();
    expect(gameboard.isValidPoint(undefined)).toBeFalse();

    // POINTS OUTSIDE THE GRID
    expect(gameboard.isValidPoint({ row: -12, col: 0 })).toBeFalse();
    expect(gameboard.isValidPoint({ row: 0, col: -23 })).toBeFalse();
    expect(gameboard.isValidPoint({ row: 0, col: gameboard.size })).toBeFalse();
    expect(gameboard.isValidPoint({ row: gameboard.size, col: 0 })).toBeFalse();

    // POINTS INSIDE THE GRID
    expect(gameboard.isValidPoint({ row: 0, col: 0 })).toBeTrue();
    expect(gameboard.isValidPoint({ row: 3, col: 5 })).toBeTrue();
    expect(gameboard.isValidPoint({ row: 7, col: 2 })).toBeTrue();
  });

  it('#hasShip returns 0 on null or undefined ship type', () => {
    expect(gameboard.hasShip(null)).toBe(0);
    expect(gameboard.hasShip(undefined)).toBe(0);
  });

  it('#hasShip returns the correct number', () => {
    // SETUP
    gameboard.addShip(ShipType.CRUISER, { row: 0, col: 0 }, Direction.Right);
    gameboard.addShip(ShipType.CRUISER, { row: 1, col: 0 }, Direction.Right);
    gameboard.addShip(ShipType.BATTLESHIP, { row: 2, col: 0 }, Direction.Right);

    // Ship that has not been added
    expect(gameboard.hasShip(ShipType.DESTROYER)).toBe(0);
    expect(gameboard.hasShip(ShipType.SUBMARINE)).toBe(0);

    // Ship that has been added
    expect(gameboard.hasShip(ShipType.CRUISER)).toBe(2);
    expect(gameboard.hasShip(ShipType.BATTLESHIP)).toBe(1);
  });
});
