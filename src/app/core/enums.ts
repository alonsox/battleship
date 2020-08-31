export enum Direction {
  Up = 'up',
  Down = 'down',
  Left = 'left',
  Right = 'right',
}

export enum MessageStatus {
  Error = 'error',
  Warning = 'warning',
  OK = 'ok',
}

export enum GamePhase {
  /** The game is a phase were changes can be made, e.g., add new players. */
  NotPlaying = 'not playing',
  /** The game is ongoing and the players attacks each other */
  Playing = 'playing',
}

export enum CellState {
  Hit = 'hit',
  NotHit = 'not hit',
}

export enum PlayerType {
  Person = 'person',
  Computer = 'computer',
}
