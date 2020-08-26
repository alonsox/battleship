import { MessageStatus } from './enums';

export interface IMessage {
  body: string;
  status: MessageStatus;
}

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

export interface IAttack {
  attackedPlayerId: number;
  attackedPoint: IGridPoint;
}

export interface IAttackReport extends IAttack {
  hasAttackedPlayerLost: boolean;
}
