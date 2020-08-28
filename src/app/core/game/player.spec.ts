import { Player } from './player';
import { PlayerError } from './game-errors';

describe('Player', () => {
  let player: Player;

  beforeEach(() => {
    player = new Player('Player name');
  });

  it('Throws error when name is null, undefined or an empty string', () => {
    expect(() => new Player(null)).toThrowError(PlayerError);
    expect(() => new Player(undefined)).toThrowError(PlayerError);
    expect(() => new Player('')).toThrowError(PlayerError);
  });

  it('Throws error when setting the player name to null, undefined or empty string', () => {
    expect(() => (player.name = null)).toThrowError(PlayerError);
    expect(() => (player.name = undefined)).toThrowError(PlayerError);
    expect(() => (player.name = '')).toThrowError(PlayerError);
  });

  it("The player's name is the same as the one in the constructor", () => {
    expect(player.name).toBe('Player name');
  });

  it('Changes name correctly', () => {
    const newName = 'new player name';
    player.name = newName;
    expect(player.name).toBe(newName);
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

  it('Players ID are unique', () => {
    // Create a set of IDs
    const idSet = new Set<number>();

    // Fill the set with IDs.
    const numberOfIds = 100;
    for (let i = 0; i < numberOfIds; i++) {
      const newPlayer = new Player('name');
      idSet.add(newPlayer.id);
    }

    /* Since sets does not allow repeated elements, the value of numberOfIds
     * must be equal to the size of the set. */
    expect(idSet.size).toBe(numberOfIds);
  });

  it('Resets the player', () => {
    expect(player.score).toBe(0);
  });
});
