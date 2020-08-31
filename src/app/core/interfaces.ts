import { MessageStatus, Direction, CellState, PlayerType } from './enums';
import { ShipType } from './game/ship-type';
import { Player } from './game/player';
import { Gameboard } from './game/gameboard';

export interface IMessage {
  body: string;
  status: MessageStatus;
}

export interface IBoardCell {
  // true for hit, false otherwise
  state: CellState;

  // Ship info (null there is no ship on the board)
  shipInfo: null | {
    readonly shipId: number;
    readonly shipSegment: number;
  };
}

export interface IShipSpec {
  shipType: ShipType;
  position: IGridPoint;
  direction: Direction;
}

export interface IGridPoint {
  row: number; // A row of the grid
  col: number; // A column of the grid
}

export interface IAttack {
  victimId: number;
  attackPoint: IGridPoint;
}

export interface IAttackReport extends IAttack {
  hasVictimLost: boolean;
}

/** The credentials to use the game service */
export interface Credential {
  id: number;
  key: string;
}

/** Represents a player inside the GameService */
export interface GameUser {
  key: string;
  playerType: PlayerType;
  player: Player;
  board: Gameboard;
}
