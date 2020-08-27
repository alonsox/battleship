import { ShipType } from './ship-type';
import { Gameboard } from './gameboard';
import { Direction, CellState } from '../enums';
import { BoardError } from './game-errors';

describe('Gameboard', () => {
  let gameboard: Gameboard;

  beforeEach(() => {
    gameboard = new Gameboard();
  });

  it('Creates a new empty Gameboard', () => {
    const board = gameboard.getBoardCopy();

    board.forEach((row) => {
      row.forEach((cell) => {
        expect(cell.state).toBe(CellState.NotHit);
        expect(cell.shipInfo).toBe(null);
      });
    });
  });

  it('Changing board copy does not affect the internal board', () => {
    // SET UP
    const boardCopy = gameboard.getBoardCopy();
    const row = 3; // Random row and column
    const col = 8;

    // CHANGE BOARD
    boardCopy[row][col].state = CellState.Hit;
    boardCopy[row][col].shipInfo = { shipId: 2, shipSegment: 4 };

    // ASSERT
    const boardOriginal = gameboard.getBoardCopy();
    expect(boardOriginal[row][col].state).toBe(CellState.NotHit);
    expect(boardOriginal[row][col].shipInfo).toBeNull();
  });

  it('#isSafeToAddShip returns error on null or undefined parameters', () => {
    // NULL OR UNDEFINED SPEC
    expect(gameboard.isSafeToAddShip(null)).toBeInstanceOf(BoardError);
    expect(gameboard.isSafeToAddShip(undefined)).toBeInstanceOf(BoardError);

    // INVALID SHIP TYPE
    expect(
      gameboard.isSafeToAddShip({
        shipType: null,
        position: { row: 0, col: 0 },
        direction: Direction.Up,
      }),
    ).toBeInstanceOf(BoardError);

    expect(
      gameboard.isSafeToAddShip({
        shipType: undefined,
        position: { row: 0, col: 0 },
        direction: Direction.Up,
      }),
    ).toBeInstanceOf(BoardError);

    // INVALID GRID POINT
    expect(
      gameboard.isSafeToAddShip({
        shipType: ShipType.CRUISER,
        position: null,
        direction: Direction.Up,
      }),
    ).toBeInstanceOf(BoardError);

    expect(
      gameboard.isSafeToAddShip({
        shipType: ShipType.CRUISER,
        position: undefined,
        direction: Direction.Up,
      }),
    ).toBeInstanceOf(BoardError);

    // INVALID DIRECTION
    expect(
      gameboard.isSafeToAddShip({
        shipType: ShipType.CRUISER,
        position: { row: 0, col: 0 },
        direction: null,
      }),
    ).toBeInstanceOf(BoardError);

    expect(
      gameboard.isSafeToAddShip({
        shipType: ShipType.CRUISER,
        position: { row: 0, col: 0 },
        direction: undefined,
      }),
    ).toBeInstanceOf(BoardError);
  });

  it('#isSafeToAddShip returns error when adding a ship outside the grid', () => {
    // ROW OR COLUMN NEGATIVE
    expect(
      gameboard.isSafeToAddShip({
        shipType: ShipType.CARRIER,
        position: { row: -1, col: 0 },
        direction: Direction.Up,
      }),
    ).toBeInstanceOf(BoardError);

    expect(
      gameboard.isSafeToAddShip({
        shipType: ShipType.CARRIER,
        position: { row: 0, col: -1 },
        direction: Direction.Up,
      }),
    ).toBeInstanceOf(BoardError);

    // ROW OR COLUMN GREATER THAN THE BOARD SIZE
    expect(
      gameboard.isSafeToAddShip({
        shipType: ShipType.CARRIER,
        position: { row: gameboard.height, col: 0 },
        direction: Direction.Up,
      }),
    ).toBeInstanceOf(BoardError);

    expect(
      gameboard.isSafeToAddShip({
        shipType: ShipType.CARRIER,
        position: { row: 0, col: gameboard.width },
        direction: Direction.Up,
      }),
    ).toBeInstanceOf(BoardError);
  });

  it('#isSafeToAddShip returns error when a ship gets out of the board', () => {
    // OUT FROM ABOVE
    expect(
      gameboard.isSafeToAddShip({
        shipType: ShipType.SUBMARINE,
        position: { row: 0, col: 4 },
        direction: Direction.Up,
      }),
    ).toBeInstanceOf(BoardError);

    // OUT FROM BELOW
    expect(
      gameboard.isSafeToAddShip({
        shipType: ShipType.CARRIER,
        position: { row: gameboard.height - 1, col: 5 },
        direction: Direction.Down,
      }),
    ).toBeInstanceOf(BoardError);

    // OUT FROM THE LEFT
    expect(
      gameboard.isSafeToAddShip({
        shipType: ShipType.BATTLESHIP,
        position: { row: 0, col: 0 },
        direction: Direction.Left,
      }),
    ).toBeInstanceOf(BoardError);

    // OUT FROM THE RIGHT
    expect(
      gameboard.isSafeToAddShip({
        shipType: ShipType.DESTROYER,
        position: { row: 0, col: gameboard.width - 1 },
        direction: Direction.Right,
      }),
    ).toBeInstanceOf(BoardError);
  });

  it('#isSafeToAddShip returns error when a ship overlaps', () => {
    // SETUP
    gameboard.addShip({
      shipType: ShipType.SUBMARINE,
      position: { row: 3, col: 3 },
      direction: Direction.Right,
    });

    // OVERLAPS EXACTLY
    expect(
      gameboard.isSafeToAddShip({
        shipType: ShipType.SUBMARINE,
        position: { row: 3, col: 3 },
        direction: Direction.Right,
      }),
    ).toBeInstanceOf(BoardError);

    // OVERLAPS IN A PART
    expect(
      gameboard.isSafeToAddShip({
        shipType: ShipType.DESTROYER,
        position: { row: 3, col: 3 },
        direction: Direction.Down,
      }),
    ).toBeInstanceOf(BoardError);
  });

  it('Adds the ship correctly', () => {
    // SET UP
    const row = 4;
    const col = 6;
    const shipType = ShipType.CRUISER;

    // ACT
    gameboard.addShip({
      shipType,
      position: { row, col },
      direction: Direction.Down,
    });

    // ASSERT
    const board = gameboard.getBoardCopy();
    for (let i = 0; i < shipType.size; i++) {
      // No attacks have been done yet
      expect(board[row + i][col].state).toBe(CellState.NotHit);
      // Ship was added
      expect(board[row + i][col].shipInfo).not.toBe(null);
    }

    expect(gameboard.shipsCount).toBe(1);
    expect(gameboard.aliveShipsCount).toBe(1);
  });

  it('Throws error when attacking in a null or undefined point', () => {
    expect(() => gameboard.receiveAttack(null)).toThrowError(BoardError);
    expect(() => gameboard.receiveAttack(undefined)).toThrowError(BoardError);
  });

  it('Throws error when receiving an attack outside the grid', () => {
    // ROW OR COLUMN NEGATIVE
    expect(() => gameboard.receiveAttack({ row: -1, col: 0 })).toThrowError(
      BoardError,
    );

    expect(() => gameboard.receiveAttack({ row: 0, col: -1 })).toThrowError(
      BoardError,
    );

    // ROW OR COLUMN GREATER THAN THE BOARD SIZE
    expect(() =>
      gameboard.receiveAttack({ row: gameboard.height, col: 0 }),
    ).toThrowError(BoardError);

    expect(() =>
      gameboard.receiveAttack({ row: 0, col: gameboard.width }),
    ).toThrowError(BoardError);
  });

  it('Detects the number of sunk ships', () => {
    // SET UP: add ship and sunk it
    gameboard.addShip({
      shipType: ShipType.SUBMARINE,
      position: { row: 8, col: 8 },
      direction: Direction.Left,
    });

    gameboard.addShip({
      shipType: ShipType.SUBMARINE,
      position: { row: 2, col: 2 },
      direction: Direction.Down,
    });

    // ACT 1
    gameboard.receiveAttack({ row: 2, col: 2 });
    gameboard.receiveAttack({ row: 3, col: 2 });
    gameboard.receiveAttack({ row: 4, col: 2 });

    gameboard.receiveAttack({ row: 8, col: 8 });
    gameboard.receiveAttack({ row: 8, col: 7 });
    gameboard.receiveAttack({ row: 8, col: 2 }); // <= attack missed on purpose

    // ASSERT 1
    expect(gameboard.areAllShipsSunk()).toBeFalse();
    expect(gameboard.aliveShipsCount).toBe(1);
    expect(gameboard.shipsCount).toBe(2);

    // ACT 2
    gameboard.receiveAttack({ row: 8, col: 6 }); // <= Attack corrected

    // ASSERT 2
    expect(gameboard.areAllShipsSunk()).toBeTrue();
    expect(gameboard.aliveShipsCount).toBe(0);
    expect(gameboard.shipsCount).toBe(2);
  });

  it('Resets the board', () => {
    // SET UP: Add some ships and make some random attacks
    gameboard.addShip({
      shipType: ShipType.SUBMARINE,
      position: { row: 2, col: 2 },
      direction: Direction.Down,
    });

    gameboard.addShip({
      shipType: ShipType.SUBMARINE,
      position: { row: 8, col: 8 },
      direction: Direction.Left,
    });

    // Resets the board
    gameboard.receiveAttack({ row: 4, col: 5 });
    gameboard.receiveAttack({ row: 8, col: 8 });
    gameboard.receiveAttack({ row: 6, col: 3 });

    // RESET
    gameboard.reset();

    // ASSERT
    expect(gameboard.shipsCount).toBe(0);
    expect(gameboard.aliveShipsCount).toBe(0);

    gameboard.getBoardCopy().forEach((row) => {
      row.forEach((cell) => {
        expect(cell.state).toBe(CellState.NotHit);
        expect(cell.shipInfo).toBe(null);
      });
    });
  });

  it('#hasShip returns 0 on null or undefined ship type', () => {
    expect(gameboard.hasShip(null)).toBe(0);
    expect(gameboard.hasShip(undefined)).toBe(0);
  });

  it('#hasShip returns the correct number', () => {
    // SETUP
    gameboard.addShip({
      shipType: ShipType.CRUISER,
      position: { row: 0, col: 0 },
      direction: Direction.Right,
    });

    gameboard.addShip({
      shipType: ShipType.CRUISER,
      position: { row: 1, col: 0 },
      direction: Direction.Right,
    });

    gameboard.addShip({
      shipType: ShipType.BATTLESHIP,
      position: { row: 2, col: 0 },
      direction: Direction.Right,
    });

    // Ship that has not been added
    expect(gameboard.hasShip(ShipType.DESTROYER)).toBe(0);
    expect(gameboard.hasShip(ShipType.SUBMARINE)).toBe(0);

    // Ship that has been added
    expect(gameboard.hasShip(ShipType.CRUISER)).toBe(2);
    expect(gameboard.hasShip(ShipType.BATTLESHIP)).toBe(1);
  });
});
