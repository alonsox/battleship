export interface IBoardCell {
  // true for hit, false otherwise
  hit: boolean;

  // Ship info (null there is no ship on the board)
  shipInfo: null | {
    readonly shipId: number;
    readonly shipSegment: number;
  };
}

export interface IGridPoint {
  row: number; // A row of the grid
  col: number; // A column of the grid
}
