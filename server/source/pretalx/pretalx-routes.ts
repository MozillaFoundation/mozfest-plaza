import { defineRoute, HTTPError } from "gruber";
import { AppConfig, useAppConfig } from "../config.ts";
import { Semaphore, useAuthorization } from "../lib/mod.ts";
import {
  _fetchSchedule,
  FETCH_SCHEDULE_LOCK,
  FetchScheduleOptions,
} from "./fetch-schedule.ts";

// whether the pretalx schedule job is already running or not
async function isRunning(semaphore: Semaphore) {
  return Boolean(await semaphore.isLocked(FETCH_SCHEDULE_LOCK));
}

// perform the schedule job
async function runSchedule(
  semaphore: Semaphore,
  appConfig: AppConfig,
  options: FetchScheduleOptions,
) {
  try {
    await _fetchSchedule(options, semaphore, appConfig);
  } catch (error) {
    console.error("Failed to fetch schedule", error);
  }
}

// An endpoint to query if the fetch-schedule job is enabled and/or running
export const pretalxStatusRoute = defineRoute({
  method: "GET",
  pathname: "/pretalx/fetch-schedule",
  dependencies: {
    authz: useAuthorization,
    semaphore: Semaphore.use,
  },
  async handler({ authz, request, semaphore }) {
    await authz.assert(request, { scope: "admin" });

    return Response.json({
      isEnabled: true,
      isRunning: await isRunning(semaphore),
    });
  },
});

// An endpoint to run the fetch-schedule job
export const runPretalxRoute = defineRoute({
  method: "POST",
  pathname: "/pretalx/fetch-schedule",
  dependencies: {
    semaphore: Semaphore.use,
    authz: useAuthorization,
    appConfig: useAppConfig,
  },
  async handler({ authz, request, semaphore, url, appConfig }) {
    await authz.assert(request, { scope: "admin" });

    if (await isRunning(semaphore)) {
      throw HTTPError.badRequest("already running");
    }

    const options = {
      cache: url.searchParams.has("cache"),
      dryRun: url.searchParams.has("dryRun") ? "server" : undefined,
    };

    // NOTE: this is NOT awaited, so it doesn't hold up the response
    runSchedule(semaphore, appConfig, options);

    return Response.json({
      message: "ok",
      options,
    });
  },
});

export const pretalxRoutes = [pretalxStatusRoute, runPretalxRoute];
