import os from "node:os";

import { AppConfig, useAppConfig } from "../config.ts";
import {
  cacheToDisk,
  createDebug,
  getDeconfClient,
  Localised,
  MissingConfig,
  MOZ_STUB,
  Semaphore,
  sha1Hash,
  StagedDeconfData,
  StagedTaxonomy,
  useStore,
} from "../lib/mod.ts";
import {
  PretalxAnswer,
  PretalxEventClient,
  PretalxSlot,
  PretalxSpeaker,
  PretalxSubmission,
} from "./pretalx-client.ts";

const debug = createDebug("fetch-schedule");

export interface FetchScheduleOptions {
  cache: boolean;
  dryRun?: string;
}

/** Fetches data from Deconf + Pretalx and updates the Deconf schedule */
export async function fetchSchedule(options: FetchScheduleOptions) {
  debug("start cache=%o dryRun=%o", options.cache, options.dryRun);

  // Load dependencies
  const appConfig = useAppConfig();
  await using _store = useStore();
  const semaphore = Semaphore.use();

  // Ensure the environment is set up correctly
  if (appConfig.pretalx.event === MOZ_STUB) {
    throw new MissingConfig("pretalx.event");
  }
  if (appConfig.pretalx.apiToken === MOZ_STUB) {
    throw new MissingConfig("pretalx.apiToken");
  }
  if (appConfig.deconf.apiToken === MOZ_STUB) {
    throw new MissingConfig("deconf.apiToken");
  }

  // Aquire a lock so that only one instance of this job can run exclusively
  await using _lock = await semaphore.aquire({
    name: "fetch_schedule",
    hostname: os.hostname(),
    maxAge: 10 * 60 * 1_000, // ten minutes
    debug: createDebug("semaphore"),
  });

  // Create a client to talk to the Pretalx API
  const event = new PretalxEventClient(appConfig.pretalx.event, {
    debug: createDebug("pretalx"),
    apiToken: appConfig.pretalx.apiToken,
    version: "v1",
  });

  const deconf = getDeconfClient(appConfig.deconf);

  // TODO: configure questions

  // Fetch the current deconf data,
  // not currenty used but useful to have around in the .cache for debugging
  const _schedule = await cacheToDisk(
    new URL("deconf.json", appConfig.cache.local),
    options.cache,
    () => deconf.getSchedule(appConfig.deconf.conference),
  );

  // Fetch information from pretalx
  const pretalx = await cacheToDisk(
    new URL("pretalx.json", appConfig.cache.local),
    options.cache,
    () => getPretalxData(event, appConfig),
  );

  const diff = await convertToDeconf(pretalx, appConfig);

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

/** Get all relevant information out of Pretalx */
export async function getPretalxData(
  event: PretalxEventClient,
  appConfig: AppConfig,
) {
  const questions = [appConfig.pretalx.questions.speakerSubtitle];

  const rooms = await event.listRooms();
  const slots = await event.listSlots();
  const speakers = await event.listSpeakers();
  const types = await event.listSubmissionTypes();
  const tags = await event.listTags();
  const tracks = await event.listTracks();
  const submissions = await event.listSubmissions();
  const answers = (
    await Promise.all(questions.map((q) => event.listAnswers(q)))
  ).flat();

  return { rooms, slots, speakers, types, tags, tracks, submissions, answers };
}

type PretalxData = Awaited<ReturnType<typeof getPretalxData>>;

/** A helper for conversion */
interface ConvertContext {
  id(): string;
  data: StagedDeconfData;
  publicTags: Set<number>;
  enhancements: any;
  questions: AppConfig["pretalx"]["questions"];
  answers: Map<number, Map<number, PretalxAnswer>>;
}

interface Taxonomies {
  themes: StagedTaxonomy;
  tracks: StagedTaxonomy;
  types: StagedTaxonomy;
}

/** Convert pretalx data into a staged Deconf schedule */
async function convertToDeconf(
  input: PretalxData,
  appConfig: AppConfig,
): Promise<StagedDeconfData> {
  const data: StagedDeconfData = {
    labels: [],
    people: [],
    sessionLabels: [],
    sessionLinks: [],
    sessionPeople: [],
    sessions: [],
    taxonomies: [],
    assets: [],
  };

  const publicTags = new Set(
    appConfig.pretalx.publicTags
      .split(",")
      .map((str) => parseInt(str.trim()))
      .filter((v) => !Number.isNaN(v)),
  );

  // The ids of questions we want to lookup the answers to
  const questions = [appConfig.pretalx.questions.speakerSubtitle];

  // This isn't ideal,
  // it creates a map of question id to a map of answers keyed by their own id
  // it means you can quickly get all the answers to a question and look up specific ones
  const answers = new Map(
    questions.map((question) => [
      question,
      new Map(
        input.answers
          .filter((a) => a.question === question)
          .map((a) => [a.id, a]),
      ),
    ]),
  );

  const ctx: ConvertContext = {
    id: () => `fake://${crypto.randomUUID()}`,
    data,
    publicTags,
    questions: appConfig.pretalx.questions,
    enhancements: appConfig.enhancements,
    answers,
  };

  // Create the static taxonomies so they can be referenced later
  const taxonomies: Taxonomies = {
    themes: {
      id: "legacy/themes",
      icon: "",
      title: { en: "Themes" },
      metadata: { ref: "legacy/themes" },
    },
    tracks: {
      id: "legacy/tracks",
      icon: "",
      title: { en: "Tracks" },
      metadata: { ref: "legacy/tracks" },
    },
    types: {
      id: "legacy/types",
      icon: "",
      title: { en: "Types" },
      metadata: { ref: "legacy/types" },
    },
  };

  // Also add the taxonomies into the staged data
  data.taxonomies.push(...Object.values(taxonomies));

  // Pretalx Rooms -> Deconf "track" labels
  for (const room of input.rooms) {
    upsertLabel(ctx, {
      id: `room/${room.guid ?? room.id}`,
      taxonomy: taxonomies.tracks.id,
      title: room.name,
    });
  }

  // Pretalx Types -> Deconf "type" labels
  for (const type of input.types) {
    upsertLabel(ctx, {
      id: `type/${type.id}`,
      taxonomy: taxonomies.types.id,
      title: type.name,
    });
  }

  // Pretalx Tracks -> Deconf "themes" labels
  for (const track of input.tracks) {
    upsertLabel(ctx, {
      id: `theme/${track.id}`,
      taxonomy: taxonomies.themes.id,
      title: track.name,
      description: track.description,
    });
  }

  // Pretalx Speakers -> Deconf People + assets
  for (const speaker of input.speakers) {
    await upsertPerson(ctx, speaker);
  }

  const slots = new Map(input.slots.map((s) => [s.id, s]));
  const visitedPeople = new Set<string>();

  // let limit = 10;

  for (const submission of input.submissions) {
    // //
    // // TODO: hack for testing
    // if (limit <= 0) continue;
    // limit--;

    if (convertState(submission.state) === "draft") continue;

    // TODO: revisit if submissions get scheduled more than once
    const slot = submission.slots[0]
      ? slots.get(submission.slots[0])
      : undefined;

    // Create the session + add it's links
    const sessionId = upsertSession(ctx, submission, slot);

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
  description?: Localised;
}

function upsertLabel(ctx: ConvertContext, init: LabelInit) {
  const id = `pretalx/${init.id}`;
  const enhancements = ctx.enhancements[id] ?? {};
  ctx.data.labels.push({
    id,
    icon: enhancements?.icon ?? "",
    taxonomy_id: init.taxonomy,
    title: init.title,
    metadata: {
      ref: id,
      description: init.description ?? undefined,
      preview_image: enhancements.preview_image ?? undefined,
    },
  });
}

async function upsertPerson(ctx: ConvertContext, speaker: PretalxSpeaker) {
  const id = `pretalx/speaker/${speaker.code}`;

  let avatarId: string | null = null;

  if (speaker.avatar_url) {
    avatarId = `pretalx/avatar:${await sha1Hash(speaker.avatar_url)}`;

    ctx.data.assets.push({
      id: avatarId,
      title: { en: `Headshot of ${speaker.name}` },
      url: speaker.avatar_url,
      metadata: {
        ref: avatarId,
      },
    });
  }

  const subtitle = lookupAnswer(
    ctx.answers,
    ctx.questions.speakerSubtitle,
    speaker.answers,
  );

  ctx.data.people.push({
    id,
    avatar_id: avatarId,
    bio: { en: speaker.biography ?? "" },
    name: speaker.name,
    subtitle: subtitle ? subtitle.answer : "",
    metadata: {
      ref: id,
    },
  });
}

/**
 * This is a bit backwards, but is the most efficient way with the way the pretalx API is structured.
 * To avoid adding ?expand=answers to endpoints, we find the intersection of
 * questions that were answered and answers that the record has.
 *
 * The intersection being the answer for a specific question
 */
function lookupAnswer(
  input: Map<number, Map<number, PretalxAnswer>>,
  question: number,
  potentials: number[],
) {
  // Find all answers to the specific question
  const answers = input.get(question);
  if (!answers) return undefined;

  // Loop through all "answered" questions
  // If a a record is found it is for the correct question
  for (const id of potentials) {
    const record = answers.get(id);
    if (record && record.question === question) {
      return record;
    }
  }
  return undefined;
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
  const isPublic = submission.tags.some((id) => ctx.publicTags.has(id));
  const extraMetadata: any = {};

  for (const resource of submission.resources) {
    // Generate session links for each resource
    ctx.data.sessionLinks.push({
      id: resource.resource,
      session_id: id,
      title: { en: resource.description },
      url: { en: resource.resource },
      metadata: {
        ref: resource.resource,
      },
    });

    // Set the first image-looking resource as the preview_image
    if (
      !extraMetadata.preview_image &&
      previewExtensions.some((ex) => ex.test(resource.resource))
    ) {
      extraMetadata.preview_image = resource.resource;
    }
  }

  ctx.data.sessions.push({
    id: id,
    title: { en: submission.title },
    slug: submission.code,
    summary: { en: submission.abstract ?? undefined },
    details: { en: submission.description ?? "" },
    languages: "en",
    visibility: isPublic ? "public" : "private",
    state: convertState(submission.state),
    start_date: slot?.start ? new Date(slot.start) : null,
    end_date: slot?.end ? new Date(slot.end) : null,
    metadata: {
      ...extraMetadata,
      ref: id,
    },
  });

  return id;
}

const previewExtensions = [/\.png$/i, /\.jpe?g$/i, /\.gif$/i, /\.webp$/i];

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
