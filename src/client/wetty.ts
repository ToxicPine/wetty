import "../assets/css/styles.css";

import { confirmUnload, disconnect } from "./wetty/disconnect";
import { FileDownloader } from "./wetty/download";
import { FlowControlClient } from "./wetty/flowcontrol";
import { setupKeyboard } from "./wetty/keyboard";
import { configureTerm } from "./wetty/config";
import { mobileKeyboard, setupMobileViewport } from "./wetty/mobile";
import { socket } from "./wetty/socket";
import { Term } from "./wetty/term";

socket.on("connect", () => {
  const container = document.getElementById("terminal");
  if (container === null) return;

  const term = new Term(socket);
  container.innerHTML = "";
  term.open(container);
  configureTerm(term);
  setupKeyboard(term);

  const overlay = document.getElementById("overlay");
  if (overlay !== null) overlay.style.display = "none";

  window.addEventListener("beforeunload", confirmUnload);
  window.onresize = () => term.resizeTerm();

  term.resizeTerm();
  term.focus();
  mobileKeyboard();
  setupMobileViewport(() => term.resizeTerm());

  const downloader = new FileDownloader();
  const flowControl = new FlowControlClient();

  term.onData((data: string) => socket.emit("input", data));
  term.onResize((size: { cols: number; rows: number }) =>
    socket.emit("resize", size)
  );

  socket
    .on("data", (data: string) => {
      const remaining = downloader.buffer(data);
      const downloadLen = data.length - remaining.length;
      if (downloadLen && flowControl.consume(downloadLen)) {
        socket.emit("commit", flowControl.ackBytes);
      }
      if (remaining) {
        if (flowControl.consume(remaining.length)) {
          term.write(
            remaining,
            () => socket.emit("commit", flowControl.ackBytes),
          );
        } else {
          term.write(remaining);
        }
      }
    })
    .on("login", () => {
      term.writeln("");
      term.resizeTerm();
    })
    .on("logout", disconnect)
    .on("disconnect", disconnect)
    .on("error", (err: string | null) => {
      if (err) disconnect(err);
    });
});
