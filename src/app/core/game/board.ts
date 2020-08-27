import { IGridPoint } from '../interfaces';

/**
 * An object representing a basic board.
 *
 * The height of the board corresponds to the number of rows of the board has
 * and the width of the board corresponds to the number of columns of the
 * board.
 *
 * The order of both rows and columns starts from 0 until (board.height - 1)
 * for the rows and until (board.width - 1) for the columns.
 *
 * THIS CLASS IS NOT MEANT TO BE INSTANTIATED.
 */
export class Board {
  private readonly boardWidth = 10;
  private readonly boardHeight = 10;

  constructor() {}

  /**  The number of columns */
  get width(): number {
    return this.boardWidth;
  }

  /** The number of rows */
  get height(): number {
    return this.boardHeight;
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
      point.row < this.height &&
      point.col >= 0 &&
      point.col < this.width
    );
  }
}
