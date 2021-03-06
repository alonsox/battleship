import { IdGenerator } from '../../shared/id-generator';
import { ShipType } from './ship-type';

export class Ship {
  private shipID: number;
  private shipType: string;
  private shipStructure: boolean[];
  private static idCounter = new IdGenerator();

  /** Creates a new ship. */
  constructor(shipType: ShipType) {
    this.shipID = Ship.idCounter.nextId();
    this.shipType = `${shipType.type}`;
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

  /** The type of the ship */
  get type(): string {
    return this.shipType;
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
