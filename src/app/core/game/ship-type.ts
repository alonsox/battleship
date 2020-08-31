import { Ship } from './ship';

export class ShipType {
  static readonly CARRIER = new ShipType('carrier', 5);
  static readonly BATTLESHIP = new ShipType('battleship', 4);
  static readonly CRUISER = new ShipType('cruiser', 3);
  static readonly SUBMARINE = new ShipType('submarine', 3);
  static readonly DESTROYER = new ShipType('destroyer', 2);

  static readonly ALL_SHIPS = [
    ShipType.CARRIER,
    ShipType.BATTLESHIP,
    ShipType.CRUISER,
    ShipType.SUBMARINE,
    ShipType.DESTROYER,
  ];

  private constructor(
    public readonly type: string,
    public readonly size: number,
  ) {}
}
