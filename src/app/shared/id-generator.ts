/**
 * An ID generator. The IDs generated are greater or equal than one.
 */
export class IdGenerator {
  idCounter: number;

  constructor() {
    this.idCounter = 1;
  }

  /** Generates and returns a new ID. */
  nextId(): number {
    return this.idCounter++;
  }
}
