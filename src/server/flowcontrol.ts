import { Socket } from "socket.io";

/**
 * Coalesces PTY output to reduce WebSocket message pressure.
 * Data is buffered for at most `timeout` ms, or flushed immediately
 * when accumulated size exceeds `maxSize`.
 */
export function tinybuffer(socket: Socket, timeout: number, maxSize: number) {
  const chunks: string[] = [];
  let length = 0;
  let timer: NodeJS.Timeout | null = null;

  const flush = () => {
    socket.emit("data", chunks.join(""));
    chunks.length = 0;
    length = 0;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  return (data: string) => {
    chunks.push(data);
    length += data.length;
    if (length > maxSize) {
      flush();
    } else if (!timer) {
      timer = setTimeout(flush, timeout);
    }
  };
}

/**
 * Server-side flow control using HIGH/LOW watermarks.
 *
 * `account(length)` tracks outgoing data. Returns true when the HIGH
 * watermark is crossed, signaling the PTY should be paused.
 *
 * `commit(length)` processes client ACKs. Returns true when dropping
 * below the LOW watermark, signaling the PTY should be resumed.
 *
 * Default values are chosen to prioritize throughput. Lower them for
 * snappier keyboard response under heavy output (e.g. Ctrl-C during `yes`).
 */
export class FlowControlServer {
  readonly #low: number;
  readonly #high: number;
  #counter = 0;

  constructor(low = 524288, high = 2097152) {
    this.#low = low;
    this.#high = high;
  }

  account(length: number): boolean {
    const prev = this.#counter;
    this.#counter += length;
    return prev < this.#high && this.#counter > this.#high;
  }

  commit(length: number): boolean {
    const prev = this.#counter;
    this.#counter -= length;
    return prev > this.#low && this.#counter < this.#low;
  }
}
