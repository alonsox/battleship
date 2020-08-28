import { ComputerPlayer } from './computer-player';
import { PlayerError } from './game-errors';
import { Player } from './player';
import { IAttack, IGridPoint } from '../interfaces';
import { Board } from './board';

describe('ComputerPlayer', () => {
  let computerPlayer: ComputerPlayer;
  let secondPlayer: Player;
  let thirdPlayer: Player;

  beforeEach(() => {
    computerPlayer = new ComputerPlayer('computer player');
    secondPlayer = new Player('second player');
    thirdPlayer = new Player('third player');
  });

  it('Throws error when there are no other players to attack', () => {
    expect(() => computerPlayer.attack()).toThrowError(PlayerError);
  });

  it('#reset should reset the score', () => {
    // SET UP
    computerPlayer.addWin();
    computerPlayer.addWin();
    computerPlayer.addWin();

    // RESET
    computerPlayer.reset();

    // ASSERT
    expect(computerPlayer.score).toBe(0);
  });

  it('Generated attack is not null nor undefined (including attacked point)', () => {
    // SET UP: There must be another player to make an attack
    computerPlayer.acknowledgeEnemy(secondPlayer.id);

    // MAKE A MOVE
    const move: IAttack = computerPlayer.attack();

    // ASSERT
    expect(move).not.toBe(null);
    expect(move).toBeDefined();
    expect(move.attackPoint).not.toBe(null);
    expect(move.attackPoint).toBeDefined();
  });

  it('Should attack the right player', () => {
    // SET UP: There must be another player to make an attack
    computerPlayer.acknowledgeEnemy(secondPlayer.id);

    // ASSERT
    const move: IAttack = computerPlayer.attack();
    expect(move.victimId).toBe(secondPlayer.id);
  });

  it('Should attack not-attacked cells', () => {
    // SET UP: add another player, create a point to not attack and add a ship
    // to the otherPlayer so it does not autommatically loose
    const emptyPoint: IGridPoint = { row: 4, col: 7 };
    computerPlayer.acknowledgeEnemy(secondPlayer.id);

    // ATTACK ALL GRID EXCEPT FOR ONE POINT ALL GRID
    const dummyBoard = new Board();
    for (let row = 0; row < dummyBoard.height; row++) {
      for (let col = 0; col < dummyBoard.width; col++) {
        if (row !== emptyPoint.row || col !== emptyPoint.col) {
          computerPlayer.receiveAttackReport({
            victimId: secondPlayer.id,
            attackPoint: { row, col },
            hasAttackedPlayerLost: false,
          });
        }
      }
    }

    // ASSERT
    const move: IAttack = computerPlayer.attack();
    expect(move.attackPoint.row).toBe(emptyPoint.row);
    expect(move.attackPoint.col).toBe(emptyPoint.col);
  });

  it('Should not attack players that have lost', () => {
    computerPlayer.acknowledgeEnemy(secondPlayer.id);
    computerPlayer.acknowledgeEnemy(thirdPlayer.id);

    // KILL ONLY PLAYER 2
    computerPlayer.receiveAttackReport({
      attackPoint: { row: 0, col: 0 },
      victimId: secondPlayer.id,
      hasAttackedPlayerLost: true,
    });

    // ASSERT
    const attack = computerPlayer.attack();
    expect(attack.victimId).toBe(thirdPlayer.id);
    expect(attack.victimId).not.toBe(secondPlayer.id);
  });
});
