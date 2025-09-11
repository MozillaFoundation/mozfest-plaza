#!/usr/bin/env npx tsx

import process from "node:process";
import { Buffer } from "node:buffer";
import { useAppConfig } from "../source/config.ts";

const usage = `
usage:
  ./scripts/fake-tito-webhook.js [email] [--dryRun] [--help]

info:
  Send a request to the tito fake webhook with the correct payload + signature

note:
  You can configure server.url and tito.securityToken to live values to test them too.
`;

const [email = "geoff@r0b.io"] = process.argv.slice(2);

// Stop and output help if requested
if (process.argv.includes("--help")) {
  console.log(usage.trim());
  process.exit();
}

const appConfig = useAppConfig();

// Generate the body to send to the webhook
const payload = JSON.stringify({
  _type: "ticket",
  name: "Geoff Testington",
  email,
});
console.log("body", payload);

// Create a HMAC key using the same value the server does
const encoder = new TextEncoder();
const key = await crypto.subtle.importKey(
  "raw",
  encoder.encode(appConfig.tito.securityToken),
  { name: "HMAC", hash: { name: "SHA-256" } },
  false,
  ["sign"],
);

// Sign the payload with the HMAC key to generate the signature
const signature = Buffer.from(
  await crypto.subtle.sign(key.algorithm, key, encoder.encode(payload)),
).toString("base64");

console.log("signature", Buffer.from(signature).toString("base64"));

// Construct the URL of the webhook endpoint, optionally adding the dryRun flag
const url = new URL("./tito/webhook", appConfig.server.url);

if (process.argv.includes("--dryRun")) {
  url.searchParams.set("dryRun", "verbose");
}

// Perform the webhook
const res = await fetch(url, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "tito-signature": signature,
    "x-webhook-name": "ticket.completed",
  },
  body: payload,
});

console.log("success=%o", res.ok);

if (!res.ok) {
  console.error("error", await res.text());
}
