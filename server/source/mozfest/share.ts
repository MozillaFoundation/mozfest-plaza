import { defineRoute, HTTPError, Store, trimIndentation } from "gruber";
import {
  DeconfSchedule,
  escapeHTML,
  getDeconfClient,
  getSchedule,
  truncate,
  useStore,
  withCache,
} from "../lib/mod.ts";
import { AppConfig, useAppConfig } from "../config.ts";

interface CachedResult {
  status: number;
  headers?: Record<string, string>;
  body?: string;
}

// Generate a basic-enough HTML page to provide OpenGraph information about the session
// using a HTTP 200 response with a meta tag to reload to the correct page
async function getResult(
  idOrSlug: string,
  schedule: DeconfSchedule,
  appConfig: AppConfig,
): Promise<CachedResult> {
  const session = schedule.sessions.find(
    (s) => s.id === parseInt(idOrSlug) || s.slug === idOrSlug,
  );

  if (!session) {
    return {
      status: 302,
      headers: {
        location: new URL("./not-found", appConfig.client.url).toString(),
      },
    };
  }

  const app = "Mozilla Festival Schedule";
  const title = escapeHTML(truncate(session.title.en ?? "Session", 100));
  const desc = escapeHTML(truncate(session.details.en ?? "", 200));
  const url = new URL(`session/${session.id}`, appConfig.client.url);
  const image = new URL("https://mzf.st/opengraph-image");

  const body = trimIndentation`
    <!DOCTYPE html>
    <html lang="en" dir="ltr">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>${title} | ${app}</title>
        <meta property="og:title" content="${title}">
        <meta property="og:description" content="${desc}">
        <meta property="og:type" content="website">
        <meta property="og:site_name" content="${title}">
        <meta property="og:url" content="${url}">
        <meta property="og:image" content="${image}">
        <meta http-equiv="refresh" content="0; url='${url}'" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@mozillafestival" />
      </head>
      <body>Redirecting...</body>
    </html>
  `;

  return {
    status: 200,
    body,
    headers: {
      "content-type": "text/html; charset=UTF-8",
    },
  };
}

export const shareSessionRoute = defineRoute({
  method: "GET",
  pathname: "/share/session/:session",
  dependencies: {
    store: useStore,
    appConfig: useAppConfig,
  },
  async handler({ params, store, appConfig }) {
    const schedule = await getSchedule(store, appConfig);

    const { body, ...init } = await getResult(
      params.session,
      schedule,
      appConfig,
    );

    // const { body, ...init } = await withCache({
    //   store,
    //   key: `/share/session/${params.session}`,
    //   maxAge: 1 * 60 * 60 * 1_000,
    //   factory: () => getResult(params.session, schedule, appConfig),
    // });

    return new Response(body, init);
  },
});
