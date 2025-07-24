import "urlpattern-polyfill";

import process from "node:process";
import yargs from "yargs";
import { dumpConfiguration, useAppConfig } from "./config.ts";
import { runServer } from "./server.ts";
import { fetchSchedule } from "./pretalx/fetch-schedule.ts";
import { fakeSchedule } from "./lib/fake-schedule.ts";
import { fetchContent } from "./content/fetch-content.ts";
import { titoData } from "./tito/tito-data.ts";
import { fetchRegistrations } from "./tito/fetch-registrations.ts";
import { pretalxData } from "./pretalx/pretalx-data.ts";

const cli = yargs(process.argv.slice(2))
  .help()
  .demandCommand(1, "A command is required")
  .strictCommands();

cli.command(
  "config",
  "dump the current configuration and usage information",
  (yargs) => yargs,
  () => dumpConfiguration(),
);

cli.command(
  ["serve", "start"],
  "run the http server",
  (yargs) => yargs,
  () => runServer(useAppConfig().server),
);

cli.command(
  "fetch-schedule",
  "query the pretalx API and populate the schedule",
  (yargs) =>
    yargs
      .option("cache", { type: "boolean", default: true })
      .option("dry-run", { type: "string", choices: ["client", "server"] }),
  (args) => fetchSchedule(args),
);

cli.command(
  "pretalx <data>",
  "query and output data from pretalx",
  (yargs) => yargs.positional("data", { type: "string", demandOption: true }),
  (args) => pretalxData(args.data),
);

cli.command(
  "fake-schedule",
  "generate a fake schedule for testing",
  (yargs) =>
    yargs.option("dry-run", { type: "string", choices: ["client", "server"] }),
  (args) => fakeSchedule(args),
);

cli.command(
  "fetch-content",
  "query the repo-api-service to get content and upload to deconf",
  (yargs) =>
    yargs
      .option("cache", { type: "boolean", default: true })
      .option("dry-run", { type: "string", choices: ["client", "server"] }),
  (args) => fetchContent(args),
);

cli.command(
  "tito <data>",
  "query and output data from ti.to",
  (yargs) => yargs.positional("data", { type: "string", demandOption: true }),
  (args) => titoData(args.data),
);

cli.command(
  "fetch-registrations",
  "query ti.to and merge registrations",
  (yargs) =>
    yargs
      .option("cache", { type: "boolean", default: true })
      .option("dry-run", { type: "string", choices: ["client", "server"] }),
  (args) => fetchRegistrations(args),
);

try {
  await cli.parseAsync();
} catch (error) {
  console.error("Fatal error:", error);
}
