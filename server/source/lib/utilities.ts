import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import { AppConfig } from "../config.ts";
import { DeconfApiClient } from "./deconf-client.ts";

/**
 * A helper to wrap a method in a cache.
 * The frist time it is used, the result is written to the specified cache file as JSON.
 * When called again, the cached version is returned instead of executing the function.
 */
export async function cacheToDisk<T>(
  file: URL,
  noCache: boolean,
  fn: () => Promise<T>,
): Promise<T> {
  if (noCache) return fn();

  await fs.promises.mkdir(path.dirname(url.fileURLToPath(file)), {
    recursive: true,
  });

  try {
    const value = JSON.parse(await fs.promises.readFile(file, "utf8"));
    console.error("[cache] hit=%o", file.toString());
    return value;
  } catch (error) {
    console.error("[cache] miss", (error as Error).message);
  }

  const data = await fn();
  if (data) {
    await fs.promises.writeFile(file, JSON.stringify(data));
    console.error("[cache] write=%o", file.toString());
  }
  return data;
}

/** Create a namespaced function to write to stderr */
export function createDebug(namespace: string) {
  return (first: string, ...args: any[]) => {
    console.error(`[${namespace}] ` + first, ...args);
  };
}

// https://github.com/tc39/proposal-upsert
export function getOrInsert<K, V>(map: Map<K, V>, key: K, defaultValue: V) {
  if (!map.has(key)) {
    map.set(key, defaultValue);
  }
  return map.get(key)!;
}

export function getDeconfClient({ url, apiToken }: AppConfig["deconf"]) {
  const deconf = new DeconfApiClient(url);
  deconf.authzToken = apiToken;
  return deconf;
}

export class MissingConfig extends Error {
  constructor(key: string) {
    super(`[config] ${key} not set`);
    this.name = "MissingConfig";
    Error.captureStackTrace(this, MissingConfig);
  }
}
