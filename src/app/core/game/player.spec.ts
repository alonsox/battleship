import { BasePlayer, ComputerPlayer, PlayerError } from './player';
import { IGridPoint, IAttack } from '../interfaces';
import { Direction } from '../enums';
import { ShipType } from './ship-type';

describe('BasePlayer', () => {
  let player: BasePlayer;

  beforeEach(() => {
    player = new BasePlayer('Player name');
  });

  it('Throws error when name is null, undefined or an empty string', () => {
    // Undefined on purpose
    let name: string;

    // ASSERT
    expect(() => new BasePlayer(null)).toThrowError(PlayerError);
    expect(() => new BasePlayer(name)).toThrowError(PlayerError);
    expect(() => new BasePlayer('')).toThrowError(PlayerError);
  });

  it('Sets the name of the player', () => {
    expect(player.name).toBe('Player name');
  });

  it('Modifying board copy does not change internal board', () => {
    // GET BOARD COPY
    const boardCopy = player.getBoardCopy();

    // CHANGE BOARD
    // Just the coordinates of a random point in the board
    const row = 8;
    const col = 4;
    boardCopy[row][col].hit = true; // Originally false
    boardCopy[row][col].shipInfo = { shipId: 2, shipSegment: 4 };

    // ASSERT
    // Get the gameboard again
    const boardOriginal = player.getBoardCopy();

    // Original table should not be modified
    expect(boardOriginal[row][col].hit).toBeFalse();
    expect(boardOriginal[row][col].shipInfo).toBeNull();
  });

  it('Score should be 0 for new player', () => {
    expect(player.score).toBe(0);
  });

  it('Keeps count of the number of wins', () => {
    // SET UP
    player.addWin();
    player.addWin();
    player.addWin();
    player.addWin();

    // ASSERT
    expect(player.score).toBe(4);
  });

  it('Throws error when a parameter of addShip is null or undefined', () => {
    const shipType = ShipType.SUBMARINE;
    const point: IGridPoint = { row: 0, col: 0 };
    const direction = Direction.Down;

    // SHIT TYPE
    expect(() => player.addShip(null, point, direction)).toThrowError(
      PlayerError,
    );

    expect(() => player.addShip(undefined, point, direction)).toThrowError(
      PlayerError,
    );

    // POINT
    expect(() => player.addShip(shipType, null, direction)).toThrowError(
      PlayerError,
    );

    expect(() => player.addShip(shipType, undefined, direction)).toThrowError(
      PlayerError,
    );

    // DIRECTION
    expect(() => player.addShip(shipType, point, null)).toThrowError(
      PlayerError,
    );

    expect(() => player.addShip(shipType, point, undefined)).toThrowError(
      PlayerError,
    );
  });

  it('Throws error when a ship does not fit in the board', () => {
    // OUT FROM ABOVE
    expect(function () {
      player.addShip(ShipType.SUBMARINE, { row: 0, col: 4 }, Direction.Up);
    }).toThrowError(PlayerError);

    // OUT FROM BELOW
    expect(() =>
      player.addShip(
        ShipType.BATTLESHIP,
        { row: player.getBoardSize() - 1, col: 5 },
        Direction.Down,
      ),
    ).toThrowError(PlayerError);

    // OUT FROM THE LEFT
    expect(() =>
      player.addShip(ShipType.BATTLESHIP, { row: 7, col: 0 }, Direction.Left),
    ).toThrowError(PlayerError);

    // OUT FROM THE RIGHT
    expect(() =>
      player.addShip(
        ShipType.BATTLESHIP,
        { row: 7, col: player.getBoardSize() - 1 },
        Direction.Right,
      ),
    ).toThrowError(PlayerError);
  });

  it('Throws error when the ships overlap', () => {
    // ROW OR COLUMN NEGATIVE
    expect(() =>
      player.addShip(ShipType.CARRIER, { row: -1, col: 0 }, Direction.Right),
    ).toThrowError(PlayerError);

    expect(() =>
      player.addShip(ShipType.CARRIER, { row: 0, col: -1 }, Direction.Right),
    ).toThrowError(PlayerError);

    // ROW OR COLUMN GREATER THAN THE BOARD SIZE
    expect(() =>
      player.addShip(
        ShipType.CARRIER,
        { row: player.getBoardSize(), col: 0 },
        Direction.Right,
      ),
    ).toThrowError(PlayerError);

    expect(() =>
      player.addShip(
        ShipType.CARRIER,
        { row: 0, col: player.getBoardSize() },
        Direction.Up,
      ),
    ).toThrowError(PlayerError);
  });

  it('Adds a ship to its board', () => {
    // SET UP
    const row = 4;
    const col = 6;
    const shipType = ShipType.CRUISER;

    // ADD SHIP
    player.addShip(shipType, { row, col }, Direction.Down);

    // ASSERT
    const board = player.getBoardCopy();
    for (let i = 0; i < shipType.size; i++) {
      // No attacks have been done yet
      expect(board[row + i][col].hit).toBeFalse();
      // Ship was added
      expect(board[row + i][col].shipInfo).not.toBe(null);
    }
  });

  it('Throws error when attacking with a null or undefined point', () => {
    expect(() => player.receiveAttack(null)).toThrowError(PlayerError);
    expect(() => player.receiveAttack(undefined)).toThrowError(PlayerError);
  });

  it('Throws error when attacking a point outside the grid', () => {
    // ROW OR COLUMN NEGATIVE
    expect(() => player.receiveAttack({ row: -1, col: 0 })).toThrowError(
      PlayerError,
    );

    expect(() => player.receiveAttack({ row: 0, col: -1 })).toThrowError(
      PlayerError,
    );

    // ROW OR COLUMN GREATER THAN THE BOARD SIZE
    expect(() =>
      player.receiveAttack({ row: player.getBoardSize(), col: 0 }),
    ).toThrowError(PlayerError);

    expect(() =>
      player.receiveAttack({ row: 0, col: player.getBoardSize() }),
    ).toThrowError(PlayerError);
  });

  it('Receives an attack', () => {
    // SET UP
    const point: IGridPoint = { row: 6, col: 3 };
    player.addShip(ShipType.DESTROYER, point, Direction.Down);

    // ATTACK GRID
    player.receiveAttack(point);
    player.receiveAttack({ row: 1, col: 2 });

    // ASSERT
    const board = player.getBoardCopy();
    expect(board[point.row][point.col].hit).toBeTrue();
    expect(board[1][2].hit).toBeTrue();
  });

  it('Player with no ships has automatially lost', () => {
    expect(player.hasLost()).toBeTrue();
  });

  it('Tests hasLost', () => {
    // SET UP
    player.addShip(ShipType.CRUISER, { row: 0, col: 0 }, Direction.Right);

    // SINK SHIP: Attack ship, but fail one place
    player.receiveAttack({ row: 0, col: 0 });
    player.receiveAttack({ row: 0, col: 1 });
    player.receiveAttack({ row: 0, col: 6 }); // <= Failed on purpose

    // ASSERT 1: Ship should not be sunk yet
    expect(player.hasLost()).toBeFalse();
    expect(player.getAliveShipsCount()).toBe(1);
    expect(player.getSunkShipsCount()).toBe(0);

    // SINK SHIP: TRY 2
    player.receiveAttack({ row: 0, col: 2 }); // <= Now the ship is sunk

    // ASSERT 2: Ship should be sunk
    expect(player.hasLost()).toBeTrue();
    expect(player.getAliveShipsCount()).toBe(0);
    expect(player.getSunkShipsCount()).toBe(1);
  });
});

describe('ComputerPlayer', () => {
  let computerPlayer: ComputerPlayer;
  let otherPlayer: BasePlayer;

  beforeEach(() => {
    computerPlayer = new ComputerPlayer('Computer player');
    otherPlayer = new BasePlayer('Second player');
  });

  it('Throws error when there are no other players to attack', () => {
    expect(() => computerPlayer.makeMove()).toThrowError(PlayerError);
  });

  it('Generated attack is not null nor undefined (including attacked point)', () => {
    // SET UP: There must be another player to make an attack
    computerPlayer.acknowledgeEnemy(otherPlayer.id);

    // MAKE A MOVE
    const move: IAttack = computerPlayer.makeMove();

    // ASSERT
    expect(move).not.toBe(null);
    expect(move).toBeDefined();
    expect(move.attackedPoint).not.toBe(null);
    expect(move.attackedPoint).toBeDefined();
  });

  it('Should attack the right player', () => {
    // SET UP: There must be another player to make an attack
    computerPlayer.acknowledgeEnemy(otherPlayer.id);

    // ASSERT
    const move: IAttack = computerPlayer.makeMove();
    expect(move.attackedPlayerId).toBe(otherPlayer.id);
  });

  it('Should attack not-attacked cells', () => {
    // SET UP: add another player, create a point to not attack and add a ship
    // to the otherPlayer so it does not autommatically loose
    const emptyPoint: IGridPoint = { row: 4, col: 7 };
    otherPlayer.addShip(ShipType.CARRIER, emptyPoint, Direction.Down);
    computerPlayer.acknowledgeEnemy(otherPlayer.id);

    // ATTACK ALL GRID EXCEPT FOR ONE POINT ALL GRID
    otherPlayer.getBoardCopy().forEach((row, rowIndex) => {
      row.forEach((cell, column) => {
        if (rowIndex !== emptyPoint.row || column !== emptyPoint.col) {
          otherPlayer.receiveAttack({ row: rowIndex, col: column });

          computerPlayer.receiveAttackReport({
            attackedPlayerId: otherPlayer.id,
            attackedPoint: { row: rowIndex, col: column },
            hasAttackedPlayerLost: otherPlayer.hasLost(),
          });
        }
      });
    });

    // ASSERT
    const move: IAttack = computerPlayer.makeMove();
    expect(move.attackedPoint.row).toBe(emptyPoint.row);
    expect(move.attackedPoint.col).toBe(emptyPoint.col);
  });
});
