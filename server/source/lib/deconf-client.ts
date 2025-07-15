import pkg from "../../package.json" with { type: "json" };
import {
  ConferenceRecord,
  ContentRecord,
  LabelRecord,
  PersonRecord,
  SessionLabelRecord,
  SessionLinkRecord,
  SessionPersonRecord,
  SessionRecord,
  StagedContent,
  StagedDeconfData,
  StagedTitoData,
  TaxonomyRecord,
} from "../lib/mod.ts";

export interface DeconfSchedule {
  conference: ConferenceRecord;
  content: ContentRecord[];
  labels: LabelRecord[];
  people: PersonRecord[];
  sessionLabels: SessionLabelRecord[];
  sessionLinks: SessionLinkRecord[];
  sessionPeople: SessionPersonRecord[];
  sessions: SessionRecord[];
  taxonomies: TaxonomyRecord[];
}

/**
 * A shallow client for talking to Deconf admin API
 */
export class DeconfApiClient {
  authzToken?: string;
  authzCookie = false;
  url: URL;
  constructor(input: URL | string) {
    this.url = new URL(input);
  }

  /** construct an endpoint for the server */
  endpoint(input: string) {
    return new URL(input, this.url);
  }

  /** perform a fetch against the server, adding auth logic & resolving endpoints */
  async fetch(input: URL | string | Request, init: RequestInit = {}) {
    if (this.authzCookie) init.credentials = "include";

    if (typeof input === "string") input = this.endpoint(input);
    const request = new Request(input, init);

    if (this.authzToken) {
      request.headers.set("Authorization", `Bearer ${this.authzToken}`);
    }

    request.headers.set("User-Agent", `MozFest/${pkg.version}`);

    const res = await fetch(request);

    if (!res.ok) {
      throw new Error(`Deconf - ${res.statusText}` + (await res.text()));
    }

    return res;
  }

  /** Get the full schedule from the admin API */
  async getSchedule(conference: number | string): Promise<DeconfSchedule> {
    const res = await this.fetch(
      `./admin/v1/conferences/${conference}/schedule`,
    );

    return res.json();
  }

  /** Replace the full schedule using the admin API */
  async putSchedule(
    conference: number | string,
    data: StagedDeconfData,
    dryRun = false,
  ) {
    const url = this.endpoint(`./admin/v1/conferences/${conference}/schedule`);
    if (dryRun) url.searchParams.set("dryRun", "verbose");

    const res = await this.fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    return res.json();
  }

  async putContent(
    conference: number | string,
    data: StagedContent[],
    dryRun = false,
  ) {
    const url = this.endpoint(`./admin/v1/conferences/${conference}/content`);
    if (dryRun) url.searchParams.set("dryRun", "verbose");

    const res = await this.fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    return res.json();
  }

  async putRegistrations(
    conference: number | string,
    data: StagedTitoData,
    dryRun = false,
  ) {
    const url = this.endpoint(
      `./admin/v1/conferences/${conference}/registrations`,
    );
    if (dryRun) url.searchParams.set("dryRun", "verbose");

    const res = await this.fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    return res.json();
  }
}
