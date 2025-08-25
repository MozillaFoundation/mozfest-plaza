import os from "node:os";
import { useAppConfig } from "../config.ts";
import {
  getDeconfClient,
  MOZ_STUB,
  Semaphore,
  StagedDeconfData,
  StagedLabel,
  StagedPerson,
  StagedSession,
  StagedSessionLink,
  StagedTaxonomy,
  useStore,
} from "./mod.ts";
import { createDebug, MissingConfig } from "./utilities.ts";

const debug = createDebug("fake-schedule");

export interface FakeScheduleOptions {
  dryRun?: string;
}

/**
 * A command to generate a good-enough schedule with completely fake data
 */
export async function fakeSchedule(options: FakeScheduleOptions) {
  debug("dryRun=%o", options.dryRun);

  const appConfig = useAppConfig();
  await using _store = useStore();
  const semaphore = Semaphore.use();

  // Aquire a lock so that only one instance of this job can run exclusively
  await using _lock = await semaphore.aquire({
    name: "fetch_schedule",
    hostname: os.hostname(),
    maxAge: 10 * 60 * 1_000, // ten minutes
    debug: createDebug("semaphore"),
  });

  function id() {
    return "fake/" + crypto.randomUUID();
  }

  const data: StagedDeconfData = {
    taxonomies: [
      fakeTaxonomy("legacy/tracks", "Tracks"),
      fakeTaxonomy("legacy/themes", "Themes"),
      fakeTaxonomy("legacy/types", "Types"),
    ],
    labels: [
      fakeLabel("fake/track-a", "legacy/tracks", "Track A"),
      fakeLabel("fake/track-b", "legacy/tracks", "Track B"),
      fakeLabel("fake/track-c", "legacy/tracks", "Track C"),

      fakeLabel("fake/theme-a", "legacy/themes", "Theme A"),
      fakeLabel("fake/theme-b", "legacy/themes", "Theme B"),
      fakeLabel("fake/theme-c", "legacy/themes", "Theme C"),
      fakeLabel("fake/theme-d", "legacy/themes", "Theme D"),

      fakeLabel("fake/type-keynote", "legacy/types", "Keynote"),
      fakeLabel("fake/type-workshop", "legacy/types", "Workshop"),
      fakeLabel("fake/type-art", "legacy/types", "Art & Media"),
    ],
    people: [
      fakePerson("fake/person-a", "Geoff Testington", "Software Engineer"),
      fakePerson("fake/person-b", "Jess Fakerly", "Town Planner"),
      fakePerson("fake/person-c", "Kieran Johnstub", "Lead Architect"),
      fakePerson("fake/person-d", "Penelope Mockington", "Creative Designer"),
    ],
    sessions: [
      fakeSession(
        "fake/session-a",
        "The Great Virtual Jamboree",
        "2025-08-10 10:00:00",
      ),
      fakeSession(
        "fake/session-b",
        "Zooming Through the Zany",
        "2025-08-10 10:30:00",
      ),
      fakeSession(
        "fake/session-c",
        "Webinar Wonderland Extravaganza",
        "2025-08-10 10:30:00",
      ),
      fakeSession(
        "fake/session-d",
        "The Conference of Curious Cats",
        "2025-08-10 10:30:00",
      ),
      fakeSession(
        "fake/session-e",
        "Digital Doodle Fest",
        "2025-08-10 11:00:00",
      ),

      fakeSession("fake/art-a", "Pixel Playground"),
      fakeSession("fake/art-b", "Glitch & Glamour Gathering"),
      fakeSession("fake/art-c", "Virtual Brushstrokes"),
      fakeSession("fake/art-d", "Neon Dreams Workshop"),
      fakeSession("fake/art-e", "Digital Canvas Collective"),
    ],
    sessionPeople: [
      { id: id(), session_id: "fake/session-a", person_id: "fake/person-a" },
      { id: id(), session_id: "fake/session-a", person_id: "fake/person-b" },

      { id: id(), session_id: "fake/session-b", person_id: "fake/person-a" },
      { id: id(), session_id: "fake/session-c", person_id: "fake/person-b" },
      { id: id(), session_id: "fake/session-d", person_id: "fake/person-c" },

      { id: id(), session_id: "fake/session-e", person_id: "fake/person-d" },
      { id: id(), session_id: "fake/session-e", person_id: "fake/person-a" },
    ],
    sessionLabels: [
      { id: id(), session_id: "fake/session-a", label_id: "fake/track-a" },
      { id: id(), session_id: "fake/session-a", label_id: "fake/theme-a" },
      { id: id(), session_id: "fake/session-a", label_id: "fake/theme-b" },
      { id: id(), session_id: "fake/session-a", label_id: "fake/type-keynote" },

      { id: id(), session_id: "fake/session-b", label_id: "fake/track-a" },
      { id: id(), session_id: "fake/session-b", label_id: "fake/theme-b" },
      { id: id(), session_id: "fake/session-b", label_id: "fake/theme-c" },
      {
        id: id(),
        session_id: "fake/session-b",
        label_id: "fake/type-workshop",
      },

      { id: id(), session_id: "fake/session-c", label_id: "fake/track-b" },
      { id: id(), session_id: "fake/session-c", label_id: "fake/theme-a" },
      { id: id(), session_id: "fake/session-c", label_id: "fake/theme-c" },
      {
        id: id(),
        session_id: "fake/session-c",
        label_id: "fake/type-workshop",
      },

      { id: id(), session_id: "fake/session-d", label_id: "fake/track-c" },
      { id: id(), session_id: "fake/session-d", label_id: "fake/theme-a" },
      { id: id(), session_id: "fake/session-d", label_id: "fake/theme-b" },
      {
        id: id(),
        session_id: "fake/session-d",
        label_id: "fake/type-workshop",
      },

      { id: id(), session_id: "fake/session-e", label_id: "fake/track-a" },
      { id: id(), session_id: "fake/session-e", label_id: "fake/theme-c" },
      { id: id(), session_id: "fake/session-e", label_id: "fake/type-keynote" },

      { id: id(), session_id: "fake/art-a", label_id: "fake/type-art" },
      { id: id(), session_id: "fake/art-b", label_id: "fake/type-art" },
      { id: id(), session_id: "fake/art-c", label_id: "fake/type-art" },
      { id: id(), session_id: "fake/art-d", label_id: "fake/type-art" },
      { id: id(), session_id: "fake/art-e", label_id: "fake/type-art" },
    ],
    sessionLinks: [
      fakeLink(
        "YouTube video",
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "fake/session-a",
      ),
      fakeLink("Zoom call", "https://zoom.us/my/abcdef", "fake/session-b"),
      fakeLink("Miro Board", "https://miro.com/en", "fake/session-b"),
      fakeLink(
        "Live stream",
        "https://www.twitch.tv/bobross",
        "fake/session-c",
      ),
      fakeLink("Worksheet", "https://docs.google.com/abcdef", "fake/session-c"),
    ],
    assets: [],
  };

  if (options.dryRun === "client") {
    console.log(JSON.stringify(data));
    return;
  }

  if (appConfig.deconf.apiToken === MOZ_STUB) {
    throw new MissingConfig("deconf.apiToken");
  }

  const deconf = getDeconfClient(appConfig.deconf);

  const output = await deconf.putSchedule(
    appConfig.deconf.conference,
    data,
    options.dryRun === "server",
  );

  console.log(JSON.stringify(output));
}

function fakeTaxonomy(id: string, title: string): StagedTaxonomy {
  return {
    id: id,
    icon: "",
    title: { en: title },
    metadata: { ref: id },
  };
}

function fakeLabel(id: string, taxonomy: string, title: string): StagedLabel {
  return {
    id: id,
    icon: "",
    title: { en: title },
    taxonomy_id: taxonomy,
    metadata: { ref: id },
  };
}

function fakePerson(id: string, name: string, subtitle: string): StagedPerson {
  return {
    id: id,
    avatar_id: null,
    bio: {
      en: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur iaculis fermentum velit. Suspendisse lectus lorem, vehicula at metus nec, faucibus luctus arcu. Vivamus vitae nisi quis elit feugiat mattis eget vel felis. Nulla porta semper erat. Donec ultrices, dolor ut condimentum tincidunt, nisi elit viverra orci, in suscipit augue lectus in ligula.",
    },
    name: name,
    subtitle: subtitle,
    metadata: { ref: id },
  };
}

function fakeSession(
  id: string,
  title: string,
  start: string | null = null,
): StagedSession {
  const end = start ? new Date(start) : null;
  end?.setMinutes(end.getMinutes() + 30);

  return {
    id: id,
    title: { en: title },
    slug: id.replace("fake/", ""),
    summary: {
      en: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur iaculis fermentum velit. Suspendisse lectus lorem, vehicula at metus nec, faucibus luctus arcu.",
    },
    details: {
      en: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur iaculis fermentum velit. Suspendisse lectus lorem, vehicula at metus nec, faucibus luctus arcu. Vivamus vitae nisi quis elit feugiat mattis eget vel felis. Nulla porta semper erat. Donec ultrices, dolor ut condimentum tincidunt, nisi elit viverra orci, in suscipit augue lectus in ligula.",
    },
    languages: "en",
    visibility: "public",
    state: "confirmed",
    start_date: start ? new Date(start) : null,
    end_date: end,
    metadata: { ref: id },
  };
}

function fakeLink(
  title: string,
  url: string,
  session: string,
): StagedSessionLink {
  return {
    id: url,
    session_id: session,
    title: { en: title },
    url: { en: url },
    metadata: { ref: url },
  };
}
