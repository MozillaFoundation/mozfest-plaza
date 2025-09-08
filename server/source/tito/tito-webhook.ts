import { createHmac } from "crypto";
import { assertRequestBody, defineRoute, HTTPError, Structure } from "gruber";

import { useAppConfig } from "../config.ts";
import {
  createDebug,
  structureInterface,
  useDeconfClient,
} from "../lib/mod.ts";
import { _convertTitoToDeconf } from "./fetch-registrations.ts";

const debug = createDebug("tito-webhook");

// A subset of the request tito will make
// https://help.tito.io/en/articles/2011381-webhooks
const _Request = structureInterface({
  _type: Structure.literal("ticket"),
  name: Structure.string(),
  email: Structure.string(),
});

// A utility to perform what request.json() usually does
// needed because the hash the raw body, then .json errors that the body has already been read
function _decodeJson(bytes: Uint8Array) {
  try {
    return JSON.parse(new TextDecoder("utf8").decode(bytes));
  } catch (error) {
    throw HTTPError.badRequest("invalid JSON body");
  }
}

export const titoWebhookRoute = defineRoute({
  method: "POST",
  pathname: "/tito/webhook",
  dependencies: {
    appConfig: useAppConfig,
    deconf: useDeconfClient,
  },
  async handler({ request, appConfig, deconf, url }) {
    const dryRun = url.searchParams.has("dryRun");

    // Get tito webhook headers
    const signature = request.headers.get("tito-signature");
    const webhook = request.headers.get("x-webhook-name");
    debug("webhook hook=%o signature=%o", webhook, signature);

    // Error if the wrong webhook was configured
    if (webhook !== "ticket.completed") throw HTTPError.notFound();

    // NOTE: it'd be nice to migrate this to web-standards crypto.subtle.digest

    // Read in the request body + generate the HMAC digest
    const body = await request.bytes();
    const digest = createHmac("sha256", appConfig.tito.securityToken)
      .update(body)
      .digest("base64");

    // Ensure the signature matches the digest with the pre-shared key
    debug("webhook compare", signature, digest);
    if (signature !== digest) throw HTTPError.unauthorized();

    // Generate diff data
    const ticket = assertRequestBody(_Request, _decodeJson(body));
    const data = await _convertTitoToDeconf([ticket]);

    // Perform the append
    const uploaded = await deconf.appendRegistration(
      appConfig.deconf.conference,
      data,
      dryRun,
      appConfig.tito.webhookNotify,
    );

    if (!uploaded) throw HTTPError.badRequest("failed to append registration");

    return new Response("ok");
  },
});
