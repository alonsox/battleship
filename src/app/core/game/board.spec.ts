import { Board } from './board';

describe('Board', () => {
  let gameboard: Board;

  beforeEach(() => {
    gameboard = new Board();
  });

  it('#isValidPoint returns false on null or undefined', () => {
    expect(gameboard.isValidPoint(null)).toBeFalse();
    expect(gameboard.isValidPoint(undefined)).toBeFalse();
  });

  it('#isValidPoint returns false on points outside the grid', () => {
    // OUT FROM ABOVE
    expect(gameboard.isValidPoint({ row: -12, col: 6 })).toBeFalse();

    // OUT FROM BELOW
    expect(
      gameboard.isValidPoint({ row: gameboard.height, col: 4 }),
    ).toBeFalse();

    // OUT FROM THE LEFT
    expect(gameboard.isValidPoint({ row: 3, col: -5 })).toBeFalse();

    // OUT FROM THE RIGHT
    expect(
      gameboard.isValidPoint({ row: 5, col: gameboard.width }),
    ).toBeFalse();
  });

  it('#isValidPoint returns true on points inside the grid', () => {
    expect(gameboard.isValidPoint({ row: 0, col: 0 })).toBeTrue();
    expect(gameboard.isValidPoint({ row: 7, col: 2 })).toBeTrue();
  });
});
