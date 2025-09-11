import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import * as jose from "jose";
import { AppConfig } from "../config.ts";
import { DeconfApiClient } from "./deconf-client.ts";
import {
  _nestContext,
  AuthzToken,
  SignTokenOptions,
  Store,
  Structure,
  TokenService,
} from "gruber";

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

interface CachedOptions<T> {
  store: Store;
  factory(): T;
  maxAge: number;
  key: string;
}

// Run a factory but cache the result in the store for a certain amount of time
export async function withCache<T>({
  store,
  factory,
  maxAge,
  key,
}: CachedOptions<T>): Promise<Awaited<T>> {
  const previous = await store.get<T>(key);
  if (previous !== undefined) return previous;

  const value = await factory();
  await store.set(key, value, { maxAge });
  return value;
}

/** Get the schedule from Deconf, but cached so it only requests it every 5 minutes */
export function getSchedule(store: Store, appConfig: AppConfig) {
  return withCache({
    store,
    maxAge: 5 * 60 * 1_000,
    key: `/schedule`,
    factory() {
      return getDeconfClient(appConfig.deconf).getSchedule(
        appConfig.deconf.conference,
      );
    },
  });
}

/** Truncate a string so it is never longer that `length` */
export function truncate(input: string, length: number) {
  return input.length > length ? input.slice(0, length - 1) + "…" : input;
}

/** VERY BASIC HTML escape of a string, to avoid extra dependencies */
export function escapeHTML(input: string) {
  return input
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&gt;")
    .replace(/>/g, "&lt;");
}

export interface ExternalJoseOptions {
  url: URL;
  issuer: string;
}

// NOTE: I think this is the ideal solution, but it needs more testing
export class ExternalJoseTokens implements TokenService {
  options: ExternalJoseOptions;

  constructor(options: ExternalJoseOptions) {
    this.options = options;
  }

  sign(scope: string, options?: SignTokenOptions): Promise<string> {
    throw new Error("Not implemented");
  }

  async verify(input: string): Promise<AuthzToken | null> {
    try {
      const key = jose.createRemoteJWKSet(
        new URL(".well-known/jwks.json", this.options.url),
      );

      const token = await jose.jwtVerify(input, key, {
        issuer: this.options.issuer,
      });

      return {
        userId: token.payload.sub ? parseInt(token.payload.sub) : undefined,
        scope: token.payload.scope as string,
      };
    } catch (error) {
      return null;
    }
  }
}

interface PartialDeconfAuth {
  kind: string;
  scope: string;
  user?: { id: number };
}

export class DeconfTokens implements TokenService {
  url: URL;
  constructor(url: URL) {
    this.url = url;
  }

  sign(scope: string, options?: SignTokenOptions): Promise<string> {
    throw new Error("Not implemented");
  }

  async verify(token: string): Promise<AuthzToken | null> {
    try {
      const res = await fetch(new URL("auth/v1/me", this.url), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) return null;

      const payload: PartialDeconfAuth = await res.json();

      return {
        userId: payload.user?.id,
        scope: payload.scope,
      };
    } catch (error) {
      return null;
    }
  }
}
