export class IdCounter {
  idCounter: number;

  constructor() {
    this.idCounter = 1;
  }

  nextId(): number {
    return this.idCounter++;
  }
}
