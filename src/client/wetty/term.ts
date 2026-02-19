import { FitAddon } from "@xterm/addon-fit";
import { ImageAddon } from "@xterm/addon-image";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { Terminal } from "@xterm/xterm";
import { loadOptions } from "./options";
import type { Socket } from "socket.io-client";

export class Term extends Terminal {
  readonly socket: Socket;
  readonly fitAddon: FitAddon;

  constructor(socket: Socket) {
    super({ allowProposedApi: true });
    this.socket = socket;
    this.fitAddon = new FitAddon();
    this.loadAddon(this.fitAddon);
    this.loadAddon(new WebLinksAddon());
    this.loadAddon(new ImageAddon());
  }

  resizeTerm(): void {
    this.refresh(0, this.rows - 1);
    if (this.shouldFitTerm) this.fitAddon.fit();
    this.socket.emit("resize", { cols: this.cols, rows: this.rows });
  }

  get shouldFitTerm(): boolean {
    return loadOptions().wettyFitTerminal ?? true;
  }
}
