export class BoardError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GameboardError';
  }
}
