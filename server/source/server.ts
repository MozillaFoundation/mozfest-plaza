import {
  defineRoute,
  FetchRouter,
  HTTPError,
  serveHTTP,
  useRandom,
} from "gruber";
import { Buffer } from "node:buffer";
import sharp from "sharp";

import { useAppConfig } from "./config.ts";
import { emailRoute } from "./deconf/email.ts";
import { useStore, useTerminator } from "./lib/globals.ts";
import { titoWebhookRoute } from "./tito/tito-webhook.ts";

export const helloRoute = defineRoute({
  method: "GET",
  pathname: "/",
  dependencies: {
    appConfig: useAppConfig,
  },
  async handler({ appConfig }) {
    return Response.json({
      message: "ok",
      meta: structuredClone(appConfig.meta),
    });
  },
});

export const healthzRoute = defineRoute({
  method: "GET",
  pathname: "/healthz",
  dependencies: {
    arnie: useTerminator,
  },
  async handler({ arnie }) {
    return arnie.getResponse();
  },
});

export const headshot = defineRoute({
  method: "GET",
  pathname: "/headshot",
  dependencies: {
    store: useStore,
    random: useRandom,
  },
  async handler({ store, url, random }) {
    const headers = new Headers({ "Content-Type": "image/webp" });

    const target = url.searchParams.get("url");
    if (!target || !target.startsWith("https://pretalx.com/media/avatars/")) {
      throw HTTPError.notFound();
    }

    const id = target.replace("https://pretalx.com/media/avatars/", "");

    // See if a resized version is already stored
    const found = await store.get<string>(`headshot/${id}`);
    if (found) return new Response(Buffer.from(found, "base64"), { headers });

    // Fetch the image
    const res = await fetch(target);
    if (!res.ok) throw HTTPError.notFound();

    // Get the raw bytes
    const raw = await res.bytes();
    if (raw.byteLength === 0) throw HTTPError.notFound();

    // Resize the image to 128x128 webp
    const resized = await sharp(raw).resize(128, 128).webp().toBuffer();

    // Cache the result for 6-8 hours
    await store.set(`/headshot/${id}`, resized.toString("base64"), {
      maxAge: 6 * 60 * 60 * 1_000 + random.number(0, 2 * 60 * 60 * 1_000),
    });

    // Return the image
    return new Response(new Uint8Array(resized), { headers });
  },
});

export const routes = [
  helloRoute,
  healthzRoute,
  emailRoute,
  titoWebhookRoute,
  headshot,
];

export interface RunServerOptions {
  port: number;
  hostname: string;
}

export async function runServer(options: RunServerOptions) {
  const arnie = useTerminator();
  const store = useStore();

  const router = new FetchRouter({
    log: true,
    routes,
    errorHandler(error, request) {
      console.error("[http error]", request.url, error);
    },
  });

  const server = await serveHTTP(options, (r) => router.getResponse(r));

  arnie.start(async () => {
    await server.stop();
    await store.close();
  });
}
