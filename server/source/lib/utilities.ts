import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import { AppConfig } from "../config.ts";
import { DeconfApiClient } from "./deconf-client.ts";
import { _nestContext, Structure } from "gruber";

/**
 * A helper to wrap a method in a cache.
 * The frist time it is used, the result is written to the specified cache file as JSON.
 * When called again, the cached version is returned instead of executing the function.
 *
 * NOTE: if the factory method changes, the cached file will be incorrect
 */
export async function cacheToDisk<T>(
  file: URL,
  cache: boolean,
  fn: () => Promise<T>,
): Promise<T> {
  // Ensure the cache directory exists
  await fs.promises.mkdir(path.dirname(url.fileURLToPath(file)), {
    recursive: true,
  });

  // If the cache is enabled, attempt to load and parse the existing JSON file
  // NOTE: this does assume the JSON structure has not changed since it was cached
  if (cache) {
    try {
      const value = JSON.parse(await fs.promises.readFile(file, "utf8"));
      console.error("[cache] hit=%o", file.toString());
      return value;
    } catch (error) {
      console.error("[cache] miss", (error as Error).message);
    }
  } else {
    console.error("[cache] skip cache");
  }

  // If the cache was not used, populate it using the factory method and return the result
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

/** A helper error to throw consistent errors when configuration is not set correctly */
export class MissingConfig extends Error {
  constructor(key: string) {
    super(`[config] ${key} not set`);
    this.name = "MissingConfig";
    Error.captureStackTrace(this, MissingConfig);
  }
}

// NOTE: working towards https://github.com/robb-j/gruber/issues/44
export function structureInterface<
  T extends Record<string, Structure<unknown>>,
>(fields: T) {
  return new Structure({}, (value: any, context) => {
    if (!value || typeof value !== "object") {
      throw new Error("not an object");
    }

    const output: any = {};
    const errors: any[] = [];

    for (const property in fields) {
      try {
        output[property] = fields[property].process(
          value[property],
          _nestContext(context, property),
        );
      } catch (error) {
        errors.push(Structure.Error.chain(error, context));
      }
    }

    return output;
  });
}

export async function sha1Hash(input: string) {
  const data = await crypto.subtle.digest(
    "SHA-1",
    new TextEncoder().encode(input),
  );
  // NOTE: I'd prefer this be web-standards based
  // i.e. Uint8Array.prototype.toBase64 when it is supported
  return Buffer.from(data).toString("base64");
}
