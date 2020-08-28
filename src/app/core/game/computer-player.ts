import { PlayerError } from './game-errors';
import { IAttack, IAttackReport } from '../interfaces';
import { TrackingBoard } from './tracking-board';
import { Player } from './player';

/**
 * Represents an automated player.
 */
export class ComputerPlayer extends Player {
  private enemies: TrackingBoard[];

  /**
   * Creates a new automated player
   *
   * @param name The name of the new player.
   *
   * @throws PlayerError if the name is null, undefined, or an empty string.
   */
  constructor(name: string) {
    super(name);
    this.enemies = [];
  }

  /** Resets the enemy tracking and player score. */
  reset(): void {
    super.reset();
    this.resetEnemyTracking();
  }

  /** Resets only the enemy tracking, but not the score. */
  resetEnemyTracking(): void {
    this.enemies.forEach((enemyBoard) => {
      enemyBoard.reset();
    });
  }

  /**
   * @returns A point to attack an enemy and the attacked enemy's ID.
   *
   * @throws PlayerError when there are no other players to attack.
   * */
  attack(): IAttack {
    if (this.enemies.length === 0) {
      throw new PlayerError('There are no enemies to attack');
    }

    // Get random enemy
    let enemyBoard: TrackingBoard;
    do {
      enemyBoard = this.selectRandomEnemy();
    } while (!enemyBoard.isEnemyAlive());

    // Select attack point
    let row: number;
    let col: number;
    do {
      row = this.getRandomNumber(0, enemyBoard.height);
      col = this.getRandomNumber(0, enemyBoard.width);
    } while (enemyBoard.wasCellHit({ row, col }));

    // Attack!
    return {
      victimId: enemyBoard.enemyId,
      attackPoint: { row, col },
    };
  }

  private selectRandomEnemy(): TrackingBoard {
    const index = this.getRandomNumber(0, this.enemies.length);
    return this.enemies[index];
  }

  /** Returns a random number between MIN and MAX (excluded) */
  private getRandomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  /**
   * Receives an inform of an attack made to an enemy.
   *
   * The attack is ignored if: the attack report is null or undefined; the
   * attack point is null, undefined or outside the grid; the attacked player
   * is "this" player; the attacked player'ID does not exists or the player
   * has not been acknowledged.
   *
   * @param attackReport Information about the attack.
   */
  receiveAttackReport(attackReport: IAttackReport): void {
    // Null or undefined attack
    if (!attackReport) {
      return;
    }

    // Attacked player is 'this' player
    if (this.id === attackReport.victimId) {
      return;
    }

    // Mark the attack
    const attackedEnemy = this.enemies.find(
      (board) => board.enemyId === attackReport.victimId,
    );
    if (attackedEnemy) {
      try {
        /* Note: Track attack will check if the point is not null, undefined and
         * valid */
        attackedEnemy.trackAttack(attackReport.attackPoint);
      } catch (e) {
        // Do nothing: ignore
      }
    }

    // Kill the player (if necessary)
    if (attackReport.hasAttackedPlayerLost) {
      attackedEnemy.killEnemy();
    }
  }

  /**
   * Accepts a new player as an enemy.
   *
   * If the new player's ID is the same as 'this' player it is ignored. The
   * same applies if the new enemy has already been acknowledged.
   *
   * @param newEnemyId The ID of a new enemy.
   */
  acknowledgeEnemy(newEnemyId: number): void {
    // There is no ID
    if (!newEnemyId) {
      return;
    }

    // Enemy ID is 'this' player
    if (newEnemyId === this.id) {
      return;
    }

    // Enemy already acknoledwed
    if (this.enemies.find((board) => board.enemyId === newEnemyId)) {
      return;
    }

    this.enemies.push(new TrackingBoard(newEnemyId));
  }
}
