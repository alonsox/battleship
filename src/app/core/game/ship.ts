import { IdCounter } from '../../shared/id-counter';
import { ShipType } from './ship-type';

export class Ship {
  private shipID: number;
  private shipStructure: boolean[];
  private static idCounter = new IdCounter();

  /** Creates a new ship. */
  constructor(shipType: ShipType) {
    this.shipID = Ship.idCounter.nextId();
    this.shipStructure = new Array(shipType.size).fill(false);
  }

  /** The ship's ID. */
  get id(): number {
    return this.shipID;
  }

  /** The ship's size. */
  get size(): number {
    return this.shipStructure.length;
  }

  /**
   * Attacks the ship.
   *
   * @param pos The position where the ship will be hit.
   *
   * @returns true if the ship was hit; false otherwise.
   */
  hit(pos: number): boolean {
    if (pos >= 0 && pos < this.size) {
      this.shipStructure[pos] = true;
      return true;
    } else {
      return false;
    }
  }

  /**
   * @returns true if the ship was sunk, false otherwise.
   */
  isSunk(): boolean {
    return this.shipStructure.every((shipPart) => shipPart);
  }
}
