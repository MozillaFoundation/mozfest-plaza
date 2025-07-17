//
// API Types
//

import { Localised } from "../lib/mod.ts";

export interface PretalxSlimEvent {
  name: Localised;
  slug: string;
  is_public: boolean;
  date_from: Date;
  date_to: Date;
  timezone: string | null;
}

export interface PretalxDetailEvent {
  name: Localised;
  slug: string;
  is_public: boolean;
  date_from: Date;
  date_to: Date;
  timezone: string | null;

  email: string;
  primary_color: string | null;
  custom_domain: string | null;
  logo: string | null;
  header_image: string | null;
  locale: string;
  locales: string[];
  content_locales: string[];
}

export interface PretalxResource {
  id: string;
  resource: string;
  description: string;
}

// https://docs.pretalx.org/api/resources/#tag/submissions/operation/submissions_list
export interface PretalxSubmission {
  code: string;
  title: string;
  speakers: string[];
  submission_type: number;
  track: number;
  tags: number[];
  state:
    | "submitted"
    | "accepted"
    | "confirmed"
    | "rejected"
    | "canceled"
    | "withdrawn"
    | "deleted"
    | "draft";
  abstract: string | null;
  description: string | null;
  duration: number;
  slot_count: number;
  content_locale: string;
  do_not_record: boolean;
  image: string;
  resources: PretalxResource[];
  slots: number[];
  answers: number[];
}

// https://docs.pretalx.org/api/resources/#tag/speakers/operation/speakers_list
export interface PretalxSpeaker {
  code: string;
  name: string;
  biography: string | null;
  submissions: string[];
  avatar_url: string;
  answers: number[];
  // email: string  ???
  // timezone: string  ???
  // locale: string  ???
  // has_arrived: boolean  ???
}

// https://docs.pretalx.org/api/resources/#tag/slots/operation/slots_list
export interface PretalxSlot {
  id: number;
  room: number;
  start: string | null;
  end: string;
  submission: string;
  schedule: number;
  description: Localised;
  duration: number;
}

// https://docs.pretalx.org/api/resources/#tag/submission-types
export interface PretalxSubmissionType {
  id: number;
  name: Localised;
  default_duration: number;
  deadline: string | number;
  requires_access_code: boolean;
}

// https://docs.pretalx.org/api/resources/#tag/tags
export interface PretalxTag {
  id: number;
  tag: string;
  description: Localised;
  color: string;
  is_public: boolean;
}

// https://docs.pretalx.org/api/resources/#tag/tracks
export interface PretalxTrack {
  id: number;
  name: Localised;
  description?: Localised;
  color: string;
  position: number | null;
  requires_access_code: boolean;
}

// https://docs.pretalx.org/api/resources/#tag/questions
export interface PretalxQuestion {
  id: number;
  question: Localised;
  help_text: Localised;
  default_answer: string;
  variant:
    | "boolean"
    | "choices"
    | "datetime"
    | "file"
    | "multiple_choice"
    | "number"
    | "string"
    | "text"
    | "url";
  target: "submission" | "speaker" | "reviewer";
  deadline: string | null;
  freeze_after: string | null;
  question_required: "optional" | "required" | "after_deadline";
  position: number;
  tracks: number[];
  submission_types: number[];
  options: number[];

  // length fields...
}

// https://docs.pretalx.org/api/resources/#tag/question-options
export interface PretalxQuestionOption {
  id: number;
  question: number;
  answer: Localised; // not sure this one is right
  position: number;
}

// https://docs.pretalx.org/api/resources/#tag/answers
export interface PretalxAnswer {
  id: number;
  question: number;
  answer: string;
  answer_file: string | null;
  submission: string;
  review: number;
  person: number | null;
  options: number[];
}

// https://docs.pretalx.org/api/resources/#tag/rooms
export interface PretalxRoom {
  id: number;
  name: Localised;
  description: Localised | null;
  uuid: string;
  guid: string | null;
  capacity: number;
  position: number | null;
}

//
// Client
//

export interface PretalxPage<T = unknown> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface PretalxClientOptions {
  baseUrl?: string | URL;
  apiToken?: string;
  version?: string;
  debug?: (...args: any) => void;
  pageSize?: number;
}

/**
 * A Pretalx API Client for a specific event and it's data
 */
export class PretalxEventClient {
  #url: URL;
  #options: PretalxClientOptions;
  constructor(eventSlug: string, options: PretalxClientOptions = {}) {
    this.#url = new URL(
      `./events/${eventSlug}/`,
      options.baseUrl ?? "https://pretalx.com/api/",
    );
    this.#options = options;
  }

  /** Log a message, if in debug mode */
  debug(...args: any[]) {
    this.#options.debug?.(...args);
  }

  /** construct an endpoint for the server */
  endpoint(input: string): URL {
    const url = new URL(input, this.#url);
    if (this.#options.pageSize) {
      url.searchParams.set("page_size", this.#options.pageSize.toString());
    }
    return url;
  }

  /** Generate headers to accompany a HTTP request */
  headers() {
    const headers = new Headers({
      Accept: "application/json",
    });

    if (this.#options.apiToken) {
      headers.set("Authorization", `Token ${this.#options.apiToken}`);
    }
    if (this.#options.version) {
      headers.set("Pretalx-Version", this.#options.version);
    }

    this.debug("headers", headers);

    return headers;
  }

  fetch(url: URL | string) {
    this.debug("fetch", url.toString());
    return fetch(url, { headers: this.headers() });
  }

  // https://docs.pretalx.org/api/resources/#tag/questions/operation/questions_list
  async listQuestions() {
    const url = this.endpoint(`questions`);
    return this.paginate<PretalxQuestion>(url);
  }

  // https://docs.pretalx.org/api/resources/#tag/submissions/operation/submissions_list
  async listSubmissions(questions?: string[]) {
    const url = this.endpoint(`submissions`);
    url.searchParams.set("expand", "resources");
    if (questions) url.searchParams.set("questions", questions.join(","));
    return this.paginate<PretalxSubmission>(url);
  }

  // https://docs.pretalx.org/api/resources/#tag/speakers/operation/speakers_list
  async listSpeakers(questions?: string[]) {
    const url = this.endpoint(`speakers`);
    if (questions) url.searchParams.set("questions", questions.join(","));
    return this.paginate<PretalxSpeaker>(url);
  }

  // https://docs.pretalx.org/api/resources/#tag/tags/operation/tags_list
  async listTags() {
    const url = this.endpoint(`tags`);
    return this.paginate<PretalxTag>(url);
  }

  // https://docs.pretalx.org/api/resources/#tag/submission-types/operation/submission_types_list
  async listSubmissionTypes() {
    const url = this.endpoint(`submission-types`);
    return this.paginate<PretalxSubmissionType>(url);
  }

  // https://docs.pretalx.org/api/resources/#tag/tracks
  async listTracks() {
    const url = this.endpoint(`tracks`);
    return this.paginate<PretalxTrack>(url);
  }

  // https://docs.pretalx.org/api/resources/#tag/rooms/operation/rooms_list
  async listRooms() {
    const url = this.endpoint(`rooms`);
    return this.paginate<PretalxRoom>(url);
  }

  // https://docs.pretalx.org/api/resources/#tag/slots/operation/slots_list
  async listSlots() {
    const url = this.endpoint(`slots`);
    return this.paginate<PretalxSlot>(url);
  }

  //
  // Internal
  //

  /** Go though all responses of an endpoint */
  async paginate<T = unknown>(url: URL) {
    this.debug("paginate", url.toString());
    let res = await this.fetch(url);

    let items: T[] = [];
    for await (const results of this._iterate<T>(res)) {
      items = items.concat(results);
    }

    return items;
  }

  /** Iterate through the pagination and apply retry-headers when asked to */
  async *_iterate<T = unknown>(response: Response) {
    this.debug("iterate", response.status, response.headers);

    if (!response.ok) console.error("iterate error", await response.json());

    while (response.ok) {
      // Load response and yied it
      const json: PretalxPage = await response.json();
      yield json.results as T;

      // If there are no more pages, break out
      if (!json.next) break;

      // Load the next page
      response = await this.fetch(json.next);

      this.debug("iterate status =", response.status);

      // Handle HTTP 429
      if (response.status === 429 && response.headers.has("Retry-After")) {
        const retryAfter = this._parseRetry(
          response.headers.get("Retry-After"),
        );
        this.debug("retry-after", retryAfter);

        // If we recieved a valid retry-after, wait for that duration
        if (retryAfter) {
          const ms = retryAfter.getTime() - Date.now();
          await new Promise((resolve) => setTimeout(resolve, ms));
          response = await this.fetch(json.next);
        }
      }
    }
  }

  /** Parse the retry-after header and get the date when allowed to request again */
  _parseRetry(input: string | undefined | null) {
    if (!input) return undefined;

    // try to parse it as a date first
    const date = new Date(input);
    if (!Number.isNaN(date.getTime())) return date;

    // try to parse it as a timestamp in seconds
    const seconds = parseFloat(input);
    if (!Number.isNaN(seconds)) return new Date(Date.now() + seconds * 1_000);

    return undefined;
  }
}
