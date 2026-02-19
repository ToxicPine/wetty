import { isDev } from "../../shared/env.js";
import type { Request, RequestHandler, Response } from "express";

const jsFiles = isDev ? ["dev.js", "wetty.js"] : ["wetty.js"];

const render = (title: string, base: string): string =>
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, interactive-widget=overlays-content">
    <link rel="icon" type="image/x-icon" href="${base}/client/favicon.ico">
    <title>${title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,500;0,600;0,700;1,400;1,700&display=swap">
    <link rel="stylesheet" href="${base}/client/wetty.css" />
  </head>
  <body>
    <div id="overlay">
      <div class="error">
        <div id="msg"></div>
        <button onclick="location.reload()">Reconnect</button>
      </div>
    </div>
    <div id="toolbar">
      <button data-action="toggle-keyboard" aria-label="Keyboard">\u2328</button>
      <button data-action="toggle-settings" aria-label="Settings">\u2699</button>
    </div>
    <div id="keyboard-panel">
      <button data-action="esc">Esc</button>
      <button data-action="up">\u2191</button>
      <button data-action="tab">Tab</button>
      <button data-action="paste">Paste</button>
      <button data-action="left">\u2190</button>
      <button data-action="down">\u2193</button>
      <button data-action="right">\u2192</button>
      <button id="onscreen-ctrl" data-action="toggle-ctrl">Ctrl</button>
    </div>
    <div id="settings-modal">
      <div class="modal-backdrop" data-action="close-settings"></div>
      <div class="modal-content">
        <div class="modal-header">
          <span>Settings</span>
          <button class="modal-close" data-action="close-settings">\u2715</button>
        </div>
        <iframe class="editor" src="${base}/client/xterm_config/index.html"></iframe>
      </div>
    </div>
    <div id="terminal"></div>
    ${
    jsFiles
      .map(
        (file) =>
          `    <script type="module" src="${base}/client/${file}"></script>`,
      )
      .join("\n")
  }
  </body>
</html>`;

export const html =
  (base: string, title: string): RequestHandler =>
  (_req: Request, res: Response): void => {
    res.send(render(title, base));
  };
