export class UtilityInputError extends Error {
  constructor(readonly code: string) {
    super(code);
    this.name = 'UtilityInputError';
  }
}
