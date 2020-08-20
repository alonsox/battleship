import { IdCounter } from '../../shared/id-counter';
import { ShipType } from './ship-type';

export class Ship {
  private static idCounter = new IdCounter();
  id: number;
  shipStructure: boolean[];

  constructor(shipType: ShipType) {
    this.id = Ship.idCounter.nextId();
    this.shipStructure = new Array(shipType.size).fill(false);
  }

  getId(): number {
    return this.id;
  }

  /**
   * @returns The size of the ship.
   */
  getSize(): number {
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
    if (pos >= 0 && pos < this.getSize()) {
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
