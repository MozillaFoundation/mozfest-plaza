import os from "node:os";
import path from "node:path";

import { useAppConfig } from "../config.ts";
import {
  createDebug,
  getDeconfClient,
  getOrInsert,
  Semaphore,
  StagedContent,
  useStore,
} from "../lib/mod.ts";

import { RepoApi } from "./repo-api-client.js";

const debug = createDebug("fetch-content");

interface RepoMarkdown<T = unknown> {
  frontMatter: string;
  body: string;
  attrs: T;
}

export interface FetchContentOptions {
  noCache: boolean;
  dryRun?: string;
}

export async function fetchContent(options: FetchContentOptions) {
  debug("start noCache=%o dryRun=%o", options.noCache, options.dryRun);

  const appConfig = useAppConfig();
  await using _store = useStore();
  const semaphore = Semaphore.use();

  await using _lock = await semaphore.aquire({
    name: "fetch_content",
    hostname: os.hostname(),
    maxAge: 5 * 60 * 1_000, // five minutes
    debug: createDebug("semaphore"),
  });

  debug("query url=%o", appConfig.content.url.toString());

  const api = new RepoApi(appConfig.content.url);

  const files = await api.queryGlob<RepoMarkdown>(
    appConfig.content.prefix + "**/*.md",
    { format: "markdown" },
  );

  debug("found", Array.from(files.keys()));

  const content = new Map<string, Map<string, string>>();

  for (const [file, data] of files) {
    const normalised = path.relative(appConfig.content.prefix, file);
    const { dir, name } = path.parse(normalised);

    getOrInsert(content, dir, new Map()).set(name, processMarkdown(data.body));
  }

  const newRecords: StagedContent[] = Array.from(content.entries()).map(
    ([slug, copy]) => ({
      id: `moz/${slug}`,
      slug,
      body: Object.fromEntries(copy),
      metadata: {
        ref: `moz/${slug}`,
      },
    }),
  );

  // Exit-early and output the diff when using client dry-run
  if (options.dryRun === "client") {
    console.log(JSON.stringify(newRecords));
    return;
  }

  const deconf = getDeconfClient(appConfig.deconf);

  const output = await deconf.putContent(
    appConfig.deconf.conference,
    newRecords,
    options.dryRun === "server",
  );

  console.log(JSON.stringify(output));
}

// https://github.com/digitalinteraction/deconf-api-toolkit/blob/main/src/content/content-service.ts
function processMarkdown(input: string) {
  return input
    .split("\n")
    .map((line) =>
      line.replace(/^%+(.+)%+$/, (match, id) => `<div id="${id}"></div>`),
    )
    .join("\n");
}
