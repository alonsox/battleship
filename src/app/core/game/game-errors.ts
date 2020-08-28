export class BoardError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GameboardError';
  }
}

export class PlayerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PlayerError';
  }
}
