import * as _ from 'lodash';

import { PlayerError } from './game-errors';
import { IdGenerator } from '../../shared/id-generator';

export class Player {
  private static idGenerator = new IdGenerator();

  private readonly _id: number; // number greater than 0
  private _name: string;
  private _winsCount: number;

  /**
   * @param name The name of the new player.
   *
   * @throws PlayerError if the name is null, undefined, or an empty string.
   */
  constructor(name: string) {
    this.name = name;
    this._id = Player.idGenerator.nextId();
    this._winsCount = 0;
  }

  /** The player's ID. */
  get id(): number {
    return this._id;
  }

  /**
   * The player's name.
   *
   * @throws PlayerError if the name is null, undefined, or an empty string.
   */
  set name(newName: string) {
    if (!newName) {
      throw new PlayerError('The name is null, undefined, or an empty string');
    }

    this._name = newName;
  }

  get name(): string {
    return this._name;
  }

  /** The number of games won by the player. */
  get score(): number {
    return this._winsCount;
  }

  /** Adds a win to the player's win count */
  addWin(): void {
    this._winsCount += 1;
  }

  /**
   * Sets the score to 0.
   */
  reset(): void {
    this._winsCount = 0;
  }
}
