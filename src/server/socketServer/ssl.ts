import { resolve } from "path";
import fs from "fs-extra";
import type { SSL, SSLBuffer } from "../../shared/interfaces";

export async function loadSSL(ssl?: SSL): Promise<SSLBuffer> {
  if (ssl === undefined || ssl.key === undefined || ssl.cert === undefined) {
    return {};
  }
  const [key, cert]: Buffer[] = await Promise.all([
    fs.readFile(resolve(ssl.key)),
    fs.readFile(resolve(ssl.cert)),
  ]);
  return { key, cert };
}
