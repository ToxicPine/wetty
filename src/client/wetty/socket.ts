import io from "socket.io-client";

const basePath = window.location.pathname
  .replace(/\/+$/, "")
  .replace(/\/ssh\/[^/]+$/, "");

export const socket = io(window.location.origin, {
  path: `${basePath}/socket.io`,
});
