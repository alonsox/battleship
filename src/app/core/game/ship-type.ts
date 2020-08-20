export class ShipType {
  static readonly CARRIER = new ShipType('carrier', 5);
  static readonly BATTLESHIP = new ShipType('battleship', 4);
  static readonly CRUISER = new ShipType('cruiser', 3);
  static readonly SUBMARINE = new ShipType('submarine', 3);
  static readonly DESTROYER = new ShipType('destroyer', 2);

  private constructor(
    public readonly type: string,
    public readonly size: number,
  ) {}
}
