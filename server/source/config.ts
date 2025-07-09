import { getConfiguration, Infer, loader } from "gruber";
import process from "node:process";

import pkg from "../package.json" with { type: "json" };
import { MOZ_STUB } from "./lib/globals.ts";

const config = getConfiguration();

const struct = config.object({
  env: config.string({
    variable: "NODE_ENV",
    flag: "--env",
    fallback: "development",
  }),

  meta: config.object({
    name: config.string({ variable: "APP_NAME", fallback: pkg.name }),
    version: config.string({ variable: "APP_VERSION", fallback: pkg.version }),
  }),

  server: config.object({
    port: config.number({ variable: "PORT", flag: "--port", fallback: 3000 }),
    hostname: config.string({
      variable: "HOST",
      flag: "--hostname",
      fallback: "0.0.0.0",
    }),
    url: config.url({
      variable: "SELF_URL",
      flag: "--url",
      fallback: "http://localhost:3000",
    }),
  }),

  pretalx: config.object({
    event: config.string({ variable: "PRETALX_EVENT", fallback: MOZ_STUB }),
    url: config.url({
      variable: "PRETALX_URL",
      fallback: "https://pretalx.com/api/",
    }),
    apiToken: config.string({
      variable: "PRETALX_API_TOKEN",
      fallback: MOZ_STUB,
    }),
  }),

  deconf: config.object({
    url: config.url({
      variable: "DECONF_URL",
      fallback: "http://localhost:3000",
    }),
    conference: config.number({
      variable: "DECONF_CONFERENCE_ID",
      fallback: 1,
    }),
    apiToken: config.string({
      variable: "DECONF_TOKEN",
      fallback: MOZ_STUB,
    }),

    // TODO: IDEA - deconf provides a JWKS endpoint that JWTs are signed with,
    //              this server can use the public key to verify authenticity and trust requests to assert admins
    // jwksEndpoint: config.url({
    //   variable: "AUTH_JWKS_ENDPOINT",
    //   fallback: MOZ_STUB,
    // }),
  }),

  redis: config.object({
    url: config.url({
      variable: "REDIS_URL",
      fallback: "redis://localhost:6379",
    }),
    prefix: config.string({ variable: "REDIS_PREFIX", fallback: "" }),
  }),

  cache: config.object({
    local: config.url({
      variable: "LOCAL_CACHE",
      fallback: new URL("../.cache/", import.meta.url),
    }),
  }),

  content: config.object({
    url: config.url({
      variable: "CONTENT_URL",
      fallback: "http://localhost:9000",
    }),
    prefix: config.string({
      variable: "CONTENT_PREFIX",
      fallback: "content/",
    }),
  }),
});

export async function loadConfiguration(path: string | URL) {
  const value = await config.load(path, struct);

  if (value.env === "production") {
    if (value.pretalx.apiToken === MOZ_STUB) {
      throw new Error("pretalx.apiToken not set");
    }
    if (value.deconf.url.hostname === "localhost") {
      throw new Error("deconf.url not set");
    }
  }

  return value;
}

export function dumpConfiguration() {
  if (process.stdout.isTTY) console.log(config.getUsage(struct, _appConfig));
  else console.log(JSON.stringify(_appConfig));
}

export const _appConfig = await loadConfiguration(
  new URL("../config.json", import.meta.url),
);

export const useAppConfig = loader(() => _appConfig);

export type AppConfig = Infer<typeof struct>;
