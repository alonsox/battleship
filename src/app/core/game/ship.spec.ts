import { Ship } from './ship';
import { ShipType } from './ship-type';

describe('Ship', () => {
  let carrier: Ship;
  let battleship: Ship;
  let cruiser: Ship;
  let submarine: Ship;
  let destroyer: Ship;
  let ships: Ship[];

  beforeEach(() => {
    carrier = new Ship(ShipType.CARRIER);
    battleship = new Ship(ShipType.BATTLESHIP);
    cruiser = new Ship(ShipType.CRUISER);
    submarine = new Ship(ShipType.SUBMARINE);
    destroyer = new Ship(ShipType.DESTROYER);

    ships = [carrier, battleship, cruiser, submarine, destroyer];
  });

  it('Ship sizes are correct', () => {
    expect(carrier.size).toBe(5);
    expect(battleship.size).toBe(4);
    expect(cruiser.size).toBe(3);
    expect(submarine.size).toBe(3);
    expect(destroyer.size).toBe(2);
  });

  it('Ship types are correct', () => {
    expect(carrier.type).toBe(ShipType.CARRIER.type);
    expect(battleship.type).toBe(ShipType.BATTLESHIP.type);
    expect(cruiser.type).toBe(ShipType.CRUISER.type);
    expect(submarine.type).toBe(ShipType.SUBMARINE.type);
    expect(destroyer.type).toBe(ShipType.DESTROYER.type);
  });

  it('Ship gets hit properly', () => {
    ships.forEach((ship) => {
      // -2 and +4 are random numbers, the point of the tests is that it returns
      // true if the ship was hit in a valid position and false otherwise.
      const lowerLimit = -2;
      const upperLimit = ship.size + 4;
      for (let i = lowerLimit; i < upperLimit; i++) {
        if (i < 0 || i >= ship.size) {
          expect(ship.hit(i)).toBeFalse();
        } else {
          expect(ship.hit(i)).toBeTrue();
        }
      }
    });
  });

  it('Ship should be sunk', () => {
    ships.forEach((ship) => {
      // Hit a ship in every position
      for (let i = 0; i < ship.size; i++) {
        ship.hit(i);
      }
      expect(ship.isSunk()).toBeTrue();
    });
  });

  it("Ships' IDs are greater than 0", () => {
    ships.forEach((ship) => {
      expect(ship.id).toBeGreaterThan(0);
    });
  });

  it("Ships' IDs are unique", () => {
    /* Create a set of IDs.
     * Since sets does not allow repeated elements, the set's size must be
     * equal to the size of the ships array. */
    const idSet = new Set<number>();

    ships.forEach((ship) => idSet.add(ship.id));

    expect(idSet.size).toBe(ships.length);
  });
});
