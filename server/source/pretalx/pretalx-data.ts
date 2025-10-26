import { useAppConfig } from "../config.ts";
import { createDebug, MissingConfig, MOZ_STUB } from "../lib/mod.ts";
import { PretalxEventClient } from "./pretalx-client.ts";

function dump(data: any) {
  console.log(JSON.stringify(data, null, 2));
}

export async function pretalxData(arg: string) {
  const appConfig = useAppConfig();

  if (appConfig.pretalx.event === MOZ_STUB) {
    throw new MissingConfig("pretalx.event");
  }
  if (appConfig.pretalx.apiToken === MOZ_STUB) {
    throw new MissingConfig("pretalx.apiToken");
  }

  const pretalx = new PretalxEventClient(appConfig.pretalx.event, {
    debug: createDebug("pretalx"),
    apiToken: appConfig.pretalx.apiToken,
    version: "v1",
  });

  if (arg === "questions") return dump(await pretalx.listQuestions());
  if (arg === "submissions") return dump(await pretalx.listSubmissions());
  if (arg === "speakers") return dump(await pretalx.listSpeakers());
  if (arg === "tags") return dump(await pretalx.listTags());
  if (arg === "types") return dump(await pretalx.listSubmissionTypes());
  if (arg === "tracks") return dump(await pretalx.listTracks());
  if (arg === "rooms") return dump(await pretalx.listRooms());
  if (arg === "slots") return dump(await pretalx.listSlots());
  if (arg === "answers") {
    return dump({
      speakerSubtitle: await pretalx.listAnswers(
        appConfig.pretalx.questions.speakerSubtitle,
      ),
    });
  }

  throw new Error("unknown command");
}
