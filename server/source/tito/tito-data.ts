import { useAppConfig } from "../config.ts";
import { createDebug, MissingConfig, MOZ_STUB } from "../lib/mod.ts";
import { TitoEventV3Client } from "./tito-client.ts";

function dump(data: any) {
  console.log(JSON.stringify(data, null, 2));
}

// A command to fetch and output specific information from TiTo
export async function titoData(arg: string) {
  const appConfig = useAppConfig();

  if (appConfig.tito.apiToken === MOZ_STUB) {
    throw new MissingConfig("tito.apiToken");
  }

  const tito = new TitoEventV3Client(
    appConfig.tito.account,
    appConfig.tito.event,
    {
      debug: createDebug("tito"),
      apiToken: appConfig.tito.apiToken,
    },
  );

  if (arg === "account") return dump(await tito.getAccount());
  if (arg === "events") return dump(await tito.listEvents());
  if (arg === "tickets") return dump(await tito.listTickets());
  if (arg === "registrations") return dump(await tito.listRegistrations());
  if (arg === "releases") return dump(await tito.listReleases());

  throw new Error("unknown command");
}
