import {
  assertRequestBody,
  defineRoute,
  HTTPError,
  Infer,
  Structure,
} from "gruber";
import { AppConfig, useAppConfig } from "../config.ts";

// A plain-text email
const PlainEmail = Structure.object({
  type: Structure.literal("plain"),
  to: Structure.object({
    emailAddress: Structure.string(),
  }),
  subject: Structure.string(),
  body: Structure.string(),
});

// A login templated email
const LoginEmail = Structure.object({
  type: Structure.literal("template"),
  template: Structure.literal("login"),
  to: Structure.object({
    emailAddress: Structure.string(),
  }),
  arguments: Structure.object({
    oneTimeCode: Structure.number(),
    magicLink: Structure.string(),
  }),
});

const TemplateEmail = Structure.union([LoginEmail]);

const _Request = Structure.union([PlainEmail, TemplateEmail]);

// Roughly get the bearer from the HTTP request
function getBearer(request: Request) {
  const value = request.headers.get("authorization");
  if (!value) return null;

  return value.match(/^bearer /i) ? value.replace(/^bearer /i, "") : null;
}

export const emailRoute = defineRoute({
  method: "POST",
  pathname: "/deconf/email",
  dependencies: {
    appConfig: useAppConfig,
  },
  async handler({ request, appConfig }) {
    // Assert the request has the pre-shared secret
    if (getBearer(request) !== appConfig.email.sharedSecret) {
      throw HTTPError.unauthorized();
    }

    // Ensure the body is a valid deconf email payload
    const body = await assertRequestBody(_Request, request);

    // Send a plain email
    if (body.type === "plain") {
      const success = await sendPlain(body, appConfig);
      return new Response(undefined, { status: success ? 200 : 400 });
    }

    // Send a templated
    if (body.type === "template") {
      if (body.template === "login") {
        const success = await sendTemplated(
          appConfig,
          body.to.emailAddress,
          appConfig.email.loginTemplate,
          {
            oneTimeCode: body.arguments.oneTimeCode.toString().padStart(6, "0"),
            magicLink: body.arguments.magicLink,
          },
        );
        return new Response(undefined, { status: success ? 200 : 400 });
      }
      // more templates? ...
    }

    throw HTTPError.badRequest("unknown email type");
  },
});

async function sendPlain(
  options: Infer<typeof PlainEmail>,
  appConfig: AppConfig,
) {
  const endpoint = new URL(
    `https://api.createsend.com/api/v3.3/transactional/classicEmail/send`,
  );
  endpoint.searchParams.set("clientID", appConfig.email.clientId);

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + btoa(appConfig.email.apiKey + ":"),
    },
    body: JSON.stringify({
      To: [options.to.emailAddress],
      From: appConfig.email.fromAddress,
      ReplyTo: appConfig.email.replyTo,
      Subject: options.subject,
      Text: options.body,

      // TODO: review these
      ConsentToTrack: "yes",
      TrackOpens: true,
      TrackClicks: true,
    }),
  });

  if (!res.ok) {
    console.error("CaMo Failed", await res.text());
  }

  return res.ok;
}

async function sendTemplated(
  appConfig: AppConfig,
  to: string,
  templateId: string,
  data: any,
) {
  const endpoint = new URL(
    `https://api.createsend.com/api/v3.2/transactional/smartemail/${templateId}/send`,
  );

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + btoa(appConfig.email.apiKey + ":"),
    },
    body: JSON.stringify({
      To: [to],
      Data: data,

      // TODO: review these
      ConsentToTrack: "yes",
      TrackOpens: true,
      TrackClicks: true,
    }),
  });

  if (!res.ok) {
    console.error("CaMo Failed", await res.text());
  }

  return res.ok;
}
