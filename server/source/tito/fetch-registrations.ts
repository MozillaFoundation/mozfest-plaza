import os from "node:os";

import { useAppConfig } from "../config.ts";
import { MOZ_STUB, useStore } from "../lib/globals.ts";
import { Semaphore } from "../lib/semaphore.ts";
import {
  cacheToDisk,
  createDebug,
  getDeconfClient,
  MissingConfig,
} from "../lib/utilities.ts";
import { TitoEventV3Client, TitoTicket } from "./tito-client.ts";
import {
  StagedAsset,
  StagedRegistration,
  StagedTitoData,
  StagedUser,
} from "../lib/types.ts";

const debug = createDebug("fetch-registrations");

export interface FetchRegistrationsOptions {
  noCache: boolean;
  dryRun?: string;
}

export async function fetchRegistrations(options: FetchRegistrationsOptions) {
  debug("start noCache=%o dryRun=%o", options.noCache, options.dryRun);

  const appConfig = useAppConfig();
  await using _store = useStore();
  const semaphore = Semaphore.use();

  if (appConfig.tito.apiToken === MOZ_STUB) {
    throw new MissingConfig("tito.apiToken");
  }
  if (appConfig.deconf.apiToken === MOZ_STUB) {
    throw new MissingConfig("deconf.apiToken");
  }

  await using _lock = await semaphore.aquire({
    name: "fetch_registrations",
    hostname: os.hostname(),
    maxAge: 5 * 60 * 1_000, // five minutes
    debug: createDebug("semaphore"),
  });

  const tito = new TitoEventV3Client(
    appConfig.tito.account,
    appConfig.tito.event,
    {
      debug: createDebug("tito"),
      apiToken: appConfig.tito.apiToken,
    },
  );

  const deconf = getDeconfClient(appConfig.deconf);

  // TODO: "since" date

  const tickets = await cacheToDisk(
    new URL("tickets.json", appConfig.cache.local),
    options.noCache,
    () => tito.listTickets(),
  );

  const diff = convertToDeconf(tickets);

  // Output the diff file
  if (options.dryRun === "client") {
    console.log(JSON.stringify(diff));
    return;
  }

  const output = await deconf.putRegistrations(
    appConfig.deconf.conference,
    diff,
    options.dryRun === "server",
  );
  console.log(JSON.stringify(output));
}

function trimEmail(input: string) {
  return input.toLowerCase().trim();
}

function convertToDeconf(tickets: TitoTicket[]): StagedTitoData {
  // One email might have bought multiple tickets
  // The other tickets might not have been assigned (null)
  // or use the same email address multiple times
  const visited = new Set<string>();

  const diff = {
    users: [] as StagedUser[],
    registrations: [] as StagedRegistration[],
    // assets: [] as StagedAsset[],
  };

  for (const ticket of tickets) {
    if (!ticket.email) continue;
    const email = trimEmail(ticket.email);

    if (visited.has(email)) continue;
    visited.add(email);

    const ref = `tito/ticket/${ticket.id}`;

    diff.users.push({
      id: ref,
      email: ticket.email,
      consented_at: new Date(ticket.consented_at ?? Date.now()),
      metadata: { ref },
    });
    diff.registrations.push({
      id: ref,
      avatar_id: null,
      name: ticket.name,
      role: "attendee",
      user_id: ref,
      metadata: { ref },
    });
  }

  return diff;
}
