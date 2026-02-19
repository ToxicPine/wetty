export class FlowControlClient {
  readonly ackBytes: number;
  #counter = 0;

  constructor(ackBytes = 262144) {
    this.ackBytes = ackBytes;
  }

  consume(length: number): boolean {
    this.#counter += length;
    if (this.#counter >= this.ackBytes) {
      this.#counter -= this.ackBytes;
      return true;
    }
    return false;
  }
}
