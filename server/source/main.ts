import "urlpattern-polyfill";

import process from "node:process";
import yargs from "yargs";
import { dumpConfiguration, useAppConfig } from "./config.ts";
import { runServer } from "./server.ts";
import { fetchSchedule } from "./pretalx/fetch-schedule.ts";
import { fakeSchedule } from "./lib/fake-schedule.ts";

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
  "serve",
  "run the http server",
  (yargs) => yargs,
  () => runServer(useAppConfig().server),
);

cli.command(
  "fetch-schedule",
  "query the pretalx API and populate the schedule",
  (yargs) =>
    yargs
      .option("no-cache", { type: "boolean", default: false })
      .option("dry-run", { type: "string", choices: ["client", "server"] }),
  (args) => fetchSchedule(args),
);

cli.command(
  "fake-schedule",
  "generate a fake schedule for testing",
  (yargs) =>
    yargs.option("dry-run", { type: "string", choices: ["client", "server"] }),
  (args) => fakeSchedule(args),
);

try {
  await cli.parseAsync();
} catch (error) {
  console.error("Fatal error:", error);
}
