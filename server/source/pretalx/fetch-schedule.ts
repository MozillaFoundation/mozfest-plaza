import { hostname } from "node:os";

import { useAppConfig } from "../config.ts";
import {
  cacheToDisk,
  DeconfApiClient,
  Localised,
  MOZ_STUB,
  Semaphore,
  StagedDeconfData,
  StagedTaxonomy,
  useStore,
} from "../lib/mod.ts";
import {
  PretalxEventClient,
  PretalxSlot,
  PretalxSpeaker,
  PretalxSubmission,
} from "./pretalx-client.ts";

export interface FetchScheduleOptions {
  noCache: boolean;
  dryRun?: string;
}

/** Fetches data from Deconf + Pretalx and updates the Deconf schedule */
export async function fetchSchedule(options: FetchScheduleOptions) {
  console.error(
    "[fetch-schedule] noCache=%o dryRun=%o",
    options.noCache,
    options.dryRun,
  );

  const appConfig = useAppConfig();
  await using _store = useStore();
  const semaphore = Semaphore.use();

  if (appConfig.pretalx.event === MOZ_STUB) {
    throw new Error("pretalx.event not set");
  }
  if (appConfig.pretalx.apiToken === MOZ_STUB) {
    throw new Error("pretalx.apiToken not set");
  }
  if (appConfig.deconf.apiToken === MOZ_STUB) {
    throw new Error("deconf.apiToken not set");
  }

  // Aquire a lock so that only one instance of this job can run at once
  await using _lock = await semaphore.aquire({
    name: "fetch_schedule",
    hostname: hostname(),
    maxAge: 10 * 60 * 1_000, // ten minutes
    debug: (msg: string, ...args) => {
      console.error("[semaphore] " + msg, ...args);
    },
  });

  // Create a client to talk to the Pretalx API
  const event = new PretalxEventClient(appConfig.pretalx.event, {
    debug: (msg, ...args) => console.error("[pretalx] " + msg, ...args),
    apiToken: appConfig.pretalx.apiToken,
    version: "v1",
  });

  const deconf = new DeconfApiClient(appConfig.deconf.url);
  deconf.authzToken = appConfig.deconf.apiToken;

  // TODO: configure questions

  // Fetch the current deconf data
  const _schedule = await cacheToDisk(
    new URL("deconf.json", appConfig.cache.local),
    options.noCache,
    () => deconf.getSchedule(appConfig.deconf.conference),
  );

  // Fetch information from pretalx
  const pretalx = await cacheToDisk(
    new URL("pretalx.json", appConfig.cache.local),
    options.noCache,
    () => getPretalxData(event),
  );

  const diff = convertToDeconf(pretalx, appConfig.deconf.conference);

  // Output the diff file
  if (options.dryRun === "client") {
    console.log(JSON.stringify(diff));
    return;
  }

  const output = await deconf.putSchedule(
    appConfig.deconf.conference,
    diff,
    options.dryRun === "server",
  );
  console.log(JSON.stringify(output));
}

export async function getPretalxData(event: PretalxEventClient) {
  const rooms = await event.listRooms(); // -> tracks
  const slots = await event.listSlots(); // -> add to sessions
  const speakers = await event.listSpeakers(); // -> people
  const types = await event.listSubmissionTypes(); // -> types
  const tags = await event.listTags(); // -> not used
  const tracks = await event.listTracks(); // -> themes
  const submissions = await event.listSubmissions(); // -> sessions

  return { rooms, slots, speakers, types, tags, tracks, submissions };
}

type PretalxData = Awaited<ReturnType<typeof getPretalxData>>;

/** A helper for conversion */
interface ConvertContext {
  id(): string;
  confId: number;
  data: StagedDeconfData;
}

interface Taxonomies {
  themes: StagedTaxonomy;
  tracks: StagedTaxonomy;
  types: StagedTaxonomy;
}

/** Convert pretalx data into a staged Deconf schedule */
function convertToDeconf(input: PretalxData, confId: number): StagedDeconfData {
  const data: StagedDeconfData = {
    labels: [],
    people: [],
    sessionLabels: [],
    sessionLinks: [],
    sessionPeople: [],
    sessions: [],
    taxonomies: [],
  };

  const ctx: ConvertContext = {
    id: () => `fake://${crypto.randomUUID()}`,
    confId,
    data,
  };

  const taxonomies: Taxonomies = {
    themes: {
      id: "legacy/themes",
      conference_id: ctx.confId,
      icon: "",
      title: { en: "Themes" },
      metadata: { ref: "legacy/themes" },
    },
    tracks: {
      id: "legacy/tracks",
      conference_id: ctx.confId,
      icon: "",
      title: { en: "Tracks" },
      metadata: { ref: "legacy/tracks" },
    },
    types: {
      id: "legacy/types",
      conference_id: ctx.confId,
      icon: "",
      title: { en: "Types" },
      metadata: { ref: "legacy/types" },
    },
  };

  data.taxonomies.push(...Object.values(taxonomies));

  // Rooms -> "track" labels
  for (const room of input.rooms) {
    upsertLabel(ctx, {
      id: `room/${room.guid ?? room.id}`,
      taxonomy: taxonomies.tracks.id,
      title: room.name,
    });
  }

  // Types -> "type" labels
  for (const type of input.types) {
    upsertLabel(ctx, {
      id: `type/${type.id}`,
      taxonomy: taxonomies.types.id,
      title: type.name,
    });
  }

  // Tracks -> "themes" labels
  for (const track of input.tracks) {
    upsertLabel(ctx, {
      id: `theme/${track.id}`,
      taxonomy: taxonomies.themes.id,
      title: track.name,
    });
  }

  // speakers -> people
  for (const speaker of input.speakers) {
    upsertPerson(ctx, speaker);
  }

  const slots = new Map(input.slots.map((s) => [s.id, s]));
  const visitedPeople = new Set<string>();

  // let limit = 10;

  for (const submission of input.submissions) {
    // //
    // // TODO: hack for testing
    // if (limit <= 0) continue;
    // limit--;

    // if (convertState(submission.state) === "draft") continue;

    // TODO: revisit if submissions get scheduled more than once
    const slot = submission.slots[0]
      ? slots.get(submission.slots[0])
      : undefined;

    // Create the submission
    const sessionId = upsertSession(ctx, submission, slot);

    // Create links
    // TODO: revisit with questions logic
    // upsertSessionLink(ctx)

    // Create people
    for (const speaker of submission.speakers) {
      const id = `pretalx/speaker/${speaker}`;
      visitedPeople.add(id);
      upsertSessionPerson(ctx, sessionId, id);
    }

    // Link labels from rooms, submission types & tracks
    if (slot?.room) {
      upsertSessionLabel(ctx, sessionId, `pretalx/room/${slot.room}`);
    }
    if (submission.submission_type) {
      upsertSessionLabel(
        ctx,
        sessionId,
        `pretalx/type/${submission.submission_type}`,
      );
    }
    if (submission.track) {
      upsertSessionLabel(ctx, sessionId, `pretalx/theme/${submission.track}`);
    }
  }

  // Remove people that weren't visited
  data.people = data.people.filter((r) => visitedPeople.has(r.id));

  return data;
}

interface LabelInit {
  id: string | number;
  taxonomy: string;
  title: Localised;
}

function upsertLabel(ctx: ConvertContext, init: LabelInit) {
  const id = `pretalx/${init.id}`;
  ctx.data.labels.push({
    id,
    icon: "",
    taxonomy_id: init.taxonomy,
    title: init.title,
    metadata: {
      ref: id,
    },
  });
}

function upsertPerson(ctx: ConvertContext, speaker: PretalxSpeaker) {
  const id = `pretalx/speaker/${speaker.code}`;

  ctx.data.people.push({
    id,
    avatar_id: null, // TODO: ...
    bio: { en: speaker.biography ?? "" },
    conference_id: ctx.confId,
    name: speaker.name,
    subtitle: "", // TODO: pull from a Q
    metadata: {
      ref: id,
    },
  });
}

function convertState(input: PretalxSubmission["state"]) {
  if (input === "accepted") return "accepted";
  if (input === "confirmed") return "confirmed";
  return "draft";
}

function upsertSession(
  ctx: ConvertContext,
  submission: PretalxSubmission,
  slot: PretalxSlot | undefined,
) {
  const id = `pretalx/submission/${submission.code}`;
  ctx.data.sessions.push({
    id: id,
    conference_id: ctx.confId,
    title: { en: submission.title },
    slug: submission.code,
    summary: { en: submission.abstract ?? undefined },
    details: { en: submission.description ?? "" },
    languages: "en",
    visibility: "public", // TODO: pull from questions
    state: convertState(submission.state),
    start_date: slot?.start ? new Date(slot.start) : null,
    end_date: slot?.end ? new Date(slot.end) : null,
    metadata: {
      ref: id,
    },
  });
  return id;
}

function upsertSessionPerson(
  ctx: ConvertContext,
  sessionId: string,
  speakerId: string,
) {
  ctx.data.sessionPeople.push({
    id: ctx.id(),
    session_id: sessionId,
    person_id: speakerId,
  });
}

function upsertSessionLabel(
  ctx: ConvertContext,
  sessionId: string,
  labelId: string,
) {
  ctx.data.sessionLabels.push({
    id: ctx.id(),
    session_id: sessionId,
    label_id: labelId,
  });
}
