import { TrackingBoard } from './tracking-board';
import { BoardError } from './game-errors';
import { CellState } from '../enums';

describe('TrackingBoard', () => {
  const enemyId = 8;
  let trackingBoard: TrackingBoard;

  beforeEach(() => {
    trackingBoard = new TrackingBoard(enemyId); // Just a random ID
  });

  it('Throws error when the ID of the enemy is null or undefined', () => {
    expect(() => new TrackingBoard(null)).toThrowError(BoardError);
    expect(() => new TrackingBoard(undefined)).toThrowError(BoardError);
  });

  it('Enemy id should be must the one passed in the constructor', () => {
    expect(trackingBoard.enemyId).toBe(enemyId);
  });

  it('New board has the enemy as alive', () => {
    expect(trackingBoard.isEnemyAlive()).toBeTrue();
  });

  it('Should kill the enemy', () => {
    trackingBoard.killEnemy();
    expect(trackingBoard.isEnemyAlive()).toBeFalse();
  });

  it('Creates a new empty TrackingBoard', () => {
    const board = trackingBoard.getBoardCopy();

    board.forEach((row) => {
      row.forEach((cell) => {
        expect(cell).toBe(CellState.NotHit);
      });
    });
  });

  it('Changing board copy does not affect the internal board', () => {
    // SET UP
    const boardCopy = trackingBoard.getBoardCopy();
    const row = 3; // Random row and column
    const col = 8;

    // CHANGE BOARD
    boardCopy[row][col] = CellState.Hit; // Originally not hit

    // ASSERT
    const boardOriginal = trackingBoard.getBoardCopy();
    expect(boardOriginal[row][col]).toBe(CellState.NotHit);
  });

  it('Throws error when tracking a null or undefined point', () => {
    expect(() => trackingBoard.trackAttack(null)).toThrowError(BoardError);
    expect(() => trackingBoard.trackAttack(undefined)).toThrowError(BoardError);
  });

  it('Throws error when tracking an attack outside the grid', () => {
    // ROW OR COLUMN NEGATIVE
    expect(() => trackingBoard.trackAttack({ row: -1, col: 0 })).toThrowError(
      BoardError,
    );

    expect(() => trackingBoard.trackAttack({ row: 0, col: -1 })).toThrowError(
      BoardError,
    );

    // ROW OR COLUMN GREATER THAN THE BOARD SIZE
    expect(() =>
      trackingBoard.trackAttack({ row: trackingBoard.height, col: 0 }),
    ).toThrowError(BoardError);

    expect(() =>
      trackingBoard.trackAttack({ row: 0, col: trackingBoard.width }),
    ).toThrowError(BoardError);
  });

  it('Tracks attacks correctly', () => {
    const row = 4;
    const col = 5;
    trackingBoard.trackAttack({ row, col });

    const board = trackingBoard.getBoardCopy();
    expect(board[row][col]).toBe(CellState.Hit);
  });

  it('#isCellHit returns false in null or undefined point', () => {
    expect(trackingBoard.wasCellHit(null)).toBeFalse();
    expect(trackingBoard.wasCellHit(undefined)).toBeFalse();
  });

  it('#isCellHit returns false in point outside the board', () => {
    // ROW OR COLUMN NEGATIVE
    expect(trackingBoard.wasCellHit({ row: -1, col: 0 })).toBeFalse();

    expect(trackingBoard.wasCellHit({ row: 0, col: -1 })).toBeFalse();

    // ROW OR COLUMN GREATER THAN THE BOARD SIZE
    expect(
      trackingBoard.wasCellHit({ row: trackingBoard.height, col: 0 }),
    ).toBeFalse();

    expect(
      trackingBoard.wasCellHit({ row: 0, col: trackingBoard.width }),
    ).toBeFalse();
  });

  it('#isCellHit returns the correct result in point inside the board', () => {
    const row = 8;
    const col = 6;
    trackingBoard.trackAttack({ row, col });

    expect(trackingBoard.wasCellHit({ row, col })).toBeTrue();
    expect(trackingBoard.wasCellHit({ row: row + 1, col })).toBeFalse();

    const board = trackingBoard.getBoardCopy();
    expect(board[row][col]).toBe(CellState.Hit);
  });

  it('Resets the board', () => {
    // SET UP: add some attacks
    trackingBoard.trackAttack({ row: 4, col: 5 });
    trackingBoard.trackAttack({ row: 8, col: 8 });
    trackingBoard.trackAttack({ row: 6, col: 3 });

    // RESET
    trackingBoard.reset();

    // ASSERT
    expect(trackingBoard.isEnemyAlive()).toBeTrue();
    trackingBoard.getBoardCopy().forEach((row) => {
      row.forEach((cell) => {
        expect(cell).toBe(CellState.NotHit);
      });
    });
  });
});
