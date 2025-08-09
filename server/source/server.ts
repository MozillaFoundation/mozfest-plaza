import { defineRoute, FetchRouter, serveHTTP } from "gruber";
import { useAppConfig } from "./config.ts";
import { useStore, useTerminator } from "./lib/globals.ts";
import { emailRoute } from "./deconf/email.ts";
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

export const routes = [helloRoute, healthzRoute, emailRoute, titoWebhookRoute];

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
