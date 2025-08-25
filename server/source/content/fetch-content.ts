import os from "node:os";
import path from "node:path";

import { AppConfig, useAppConfig } from "../config.ts";
import {
  createDebug,
  getDeconfClient,
  getOrInsert,
  MissingConfig,
  MOZ_STUB,
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
  cache: boolean;
  dryRun?: string;
}

export async function fetchContent(options: FetchContentOptions) {
  debug("start cache=%o dryRun=%o", options.cache, options.dryRun);

  // Set up dependencies
  const appConfig = useAppConfig();
  await using _store = useStore();
  const semaphore = Semaphore.use();

  // Lock the process against the store to ensure synchronous execution
  await using _lock = await semaphore.aquire({
    name: "fetch_content",
    hostname: os.hostname(),
    maxAge: 5 * 60 * 1_000, // five minutes
    debug: createDebug("semaphore"),
  });

  debug("query url=%o", appConfig.content.url.toString());

  // Create a client for the repo-api
  const api = new RepoApi(appConfig.content.url);

  const newRecords = [
    ...(await getContent(api, appConfig)),
    ...(await getConfig(api, appConfig)),
  ];

  // Exit-early and output the diff when using client dry-run
  if (options.dryRun === "client") {
    console.log(JSON.stringify(newRecords));
    return;
  }

  if (appConfig.deconf.apiToken === MOZ_STUB) {
    throw new MissingConfig("deconf.apiToken");
  }

  const deconf = getDeconfClient(appConfig.deconf);

  const output = await deconf.putContent(
    appConfig.deconf.conference,
    newRecords,
    options.dryRun === "server",
  );

  console.log(JSON.stringify(output));
}

export async function getContent(
  repo: RepoApi,
  appConfig: AppConfig,
): Promise<StagedContent[]> {
  const files = await repo.queryGlob<RepoMarkdown>(
    appConfig.content.prefix + "*/*.md",
    { format: "markdown" },
  );

  debug("found content", Array.from(files.keys()));

  const content = new Map<string, Map<string, string>>();

  // Group "<dir>/<locale>.md" based on the directory then locale into nested maps
  for (const [file, data] of files) {
    const normalised = path.relative(appConfig.content.prefix, file);
    const { dir, name } = path.parse(normalised);

    getOrInsert(content, dir, new Map()).set(name, processMarkdown(data.body));
  }

  // Convert grouped content into staged ContentRecord objects
  return Array.from(content.entries()).map(([slug, copy]) => ({
    id: `moz/${slug}`,
    slug,
    content_type: "text/markdown",
    body: Object.fromEntries(copy),
    metadata: {
      ref: `moz/${slug}`,
    },
  }));
}

function isObject(value: any) {
  return value && typeof value === "object";
}

// Only a rough check
function checkSettings(settings: any) {
  return (
    isObject(settings) &&
    isObject(settings.navigation) &&
    isObject(settings.features) &&
    isObject(settings.atriumWidgets) &&
    isObject(settings.content)
  );
}

export async function getConfig(
  repo: RepoApi,
  appConfig: AppConfig,
): Promise<StagedContent[]> {
  const files: StagedContent[] = [];

  // Fetch the settings.json file
  const settings = await repo.queryFile<any>(
    appConfig.content.prefix + "settings.json",
    { format: "json" },
  );

  // Do a rough check that the it will not crash the legacy deconf client
  if (!checkSettings(settings)) throw new Error("Invalid settings");

  files.push({
    id: "moz/settings",
    slug: "settings",
    content_type: "application/json",
    body: { en: JSON.stringify(settings) },
    metadata: { ref: "moz/settings" },
  });

  return files;
}

/**
 * Replace %shortcode% widget-things into <div id=shortcode></div> for
 * the legacy deconf client to consume, based on:
 * https://github.com/digitalinteraction/deconf-api-toolkit/blob/main/src/content/content-service.ts
 *
 * NOTE: in the future, I'd like to move these widgets to HTML custom elements
 *       that can support attributes along with being web-standards based
 */
function processMarkdown(input: string) {
  return input
    .split("\n")
    .map((line) =>
      line.replace(/^%+(.+)%+$/, (match, id) => `<div id="${id}"></div>`),
    )
    .join("\n");
}
