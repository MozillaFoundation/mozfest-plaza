import { Buffer } from "node:buffer";
import os from "node:os";

import { useAppConfig } from "../config.ts";
import {
  cacheToDisk,
  createDebug,
  getDeconfClient,
  MissingConfig,
  MOZ_STUB,
  Semaphore,
  sha1Hash,
  StagedRegistration,
  StagedTitoData,
  StagedUser,
  useStore,
} from "../lib/mod.ts";
import { TitoEventV3Client, TitoTicket } from "./tito-client.ts";

const debug = createDebug("fetch-registrations");

export interface FetchRegistrationsOptions {
  cache: boolean;
  dryRun?: string;
}

export async function fetchRegistrations(options: FetchRegistrationsOptions) {
  debug("start cache=%o dryRun=%o", options.cache, options.dryRun);

  // Load dependencies
  const appConfig = useAppConfig();
  await using _store = useStore();
  const semaphore = Semaphore.use();

  // Ensure the environment is set up correctly
  if (appConfig.tito.apiToken === MOZ_STUB) {
    throw new MissingConfig("tito.apiToken");
  }
  if (appConfig.deconf.apiToken === MOZ_STUB) {
    throw new MissingConfig("deconf.apiToken");
  }

  // Aquire a lock so that only one instance of this job can run exclusively
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
    options.cache,
    () => tito.listTickets(),
  );

  const diff = await _convertTitoToDeconf(tickets);

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

export type _MinimalTitoTicket = Pick<
  TitoTicket,
  "email" | "consented_at" | "name"
>;

export async function _convertTitoToDeconf(
  tickets: _MinimalTitoTicket[],
): Promise<StagedTitoData> {
  // One email might have bought multiple tickets
  // The other tickets might not have been assigned (null)
  // or use the same email address multiple times
  const visited = new Set<string>();

  const diff = {
    users: [] as StagedUser[],
    registrations: [] as StagedRegistration[],
  };

  // Convert each ticket into a user and registration
  // ignore duplicate tickets for the same email address
  for (const ticket of tickets) {
    if (!ticket.email) continue;
    const email = trimEmail(ticket.email);
    const emailHash = await sha1Hash(email);

    if (visited.has(email)) continue;
    visited.add(email);

    // Use the base64'd hash of the email as the unique reference
    const ref = `tito/email:${emailHash}`;

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
