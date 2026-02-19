import path from "path";
import fs from "fs-extra";
import JSON5 from "json5";
import {
  defaultCommand,
  defaultLogLevel,
  forceSSHDefault,
  serverDefault,
  sshDefault,
} from "./defaults.js";
import type { Config, Server, SSH, SSL } from "./interfaces";
import type winston from "winston";
import type { Arguments } from "yargs";

type confValue =
  | boolean
  | string
  | number
  | undefined
  | unknown
  | SSH
  | Server
  | SSL;

function ensureBoolean(value: confValue): boolean {
  switch (value) {
    case true:
    case "true":
    case 1:
    case "1":
    case "on":
    case "yes":
      return true;
    default:
      return false;
  }
}

function parseLogLevel(
  confLevel: typeof winston.level,
  optsLevel: unknown,
): typeof winston.level {
  const logLevel = optsLevel === undefined ? confLevel : `${optsLevel}`;
  return [
      "error",
      "warn",
      "info",
      "http",
      "verbose",
      "debug",
      "silly",
    ].includes(logLevel)
    ? (logLevel as typeof winston.level)
    : defaultLogLevel;
}

export async function loadConfigFile(filepath?: string): Promise<Config> {
  if (filepath === undefined) {
    return {
      ssh: sshDefault,
      server: serverDefault,
      command: defaultCommand,
      forceSSH: forceSSHDefault,
      logLevel: defaultLogLevel,
    };
  }
  const content = await fs.readFile(path.resolve(filepath));
  const parsed = JSON5.parse(content.toString()) as Config;
  return {
    ssh: parsed.ssh === undefined
      ? sshDefault
      : Object.assign(sshDefault, parsed.ssh),
    server: parsed.server === undefined
      ? serverDefault
      : Object.assign(serverDefault, parsed.server),
    command: parsed.command === undefined
      ? defaultCommand
      : `${parsed.command}`,
    forceSSH: parsed.forceSSH === undefined
      ? forceSSHDefault
      : ensureBoolean(parsed.forceSSH),
    ssl: parsed.ssl,
    logLevel: parseLogLevel(defaultLogLevel, parsed.logLevel),
  };
}

const objectAssign = (
  target: SSH | Server,
  source: Record<string, confValue>,
): SSH | Server =>
  Object.fromEntries(
    Object.entries(source).map(([key, value]) => [
      key,
      source[key] === undefined ? target[key] : value,
    ]),
  ) as SSH | Server;

export function mergeCliConf(opts: Arguments, config: Config): Config {
  const ssl = {
    key: opts["ssl-key"],
    cert: opts["ssl-cert"],
    ...config.ssl,
  } as SSL;
  return {
    ssh: objectAssign(config.ssh, {
      user: opts["ssh-user"],
      host: opts["ssh-host"],
      auth: opts["ssh-auth"],
      port: opts["ssh-port"],
      pass: opts["ssh-pass"],
      key: opts["ssh-key"],
      allowRemoteHosts: opts["allow-remote-hosts"],
      allowRemoteCommand: opts["allow-remote-command"],
      config: opts["ssh-config"],
      knownHosts: opts["known-hosts"],
    }) as SSH,
    server: objectAssign(config.server, {
      base: opts.base,
      host: opts.host,
      socket: opts.socket,
      port: opts.port,
      title: opts.title,
      allowIframe: opts["allow-iframe"],
    }) as Server,
    command: opts.command === undefined ? config.command : `${opts.command}`,
    forceSSH: opts["force-ssh"] === undefined
      ? config.forceSSH
      : ensureBoolean(opts["force-ssh"]),
    ssl: ssl.key === undefined || ssl.cert === undefined ? undefined : ssl,
    logLevel: parseLogLevel(config.logLevel, opts["log-level"]),
  };
}
