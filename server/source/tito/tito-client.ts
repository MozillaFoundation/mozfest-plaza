//
// API Types
//

export interface TitoAccountInfo {
  authenticated: boolean;
  access_token: string;
  lookup_mode: string;
  accounts: string[];
}

export interface TitoRegistration {
  _type: "registration";
  id: number;
  slug: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export type TitoPage<T> = TitoMeta & Record<string, T[]>;

export interface TitoMeta {
  meta: {
    current_page: number | null;
    next_page: number | null;
    total_pages: number;
    total_count: number;
    per_page: number;
  };
}

// https://ti.to/docs/api/admin/3.0#tickets-attributes
export interface TitoTicket {
  _type: "ticket";
  id: number;
  slug: string;
  company_name: string;
  consented_at: string;
  created_at: string;
  email: string;
  first_name: string;
  last_name: string;
  metadata: any;
  name: string;
  registration: TitoRegistration;
  answers: TitoAnswer[];
}

// https://ti.to/docs/api/admin/3.0#answers-attributes
export interface TitoAnswer {
  id: number;
  alternate_response: string;
  primary_response: string;
  download_url: string | null;
  question_id: number;
  response: string;
  ticket_id: number;
}

export interface TitoEvent {
  id: number;
  created_at: string;
  updated_at: string;
  title: string;
  // ...
}

export interface TitoRelease {
  id: number;
  created_at: string;
  updated_at: string;
  slug: string;
  title: string;
  // ...
}

//
// Client
//

export interface TitoOptions {
  apiToken?: string;
  debug?: (...args: any) => void;
}

export class TitoEventV3Client {
  #url;
  #options;
  constructor(account: string, event: string, options: TitoOptions = {}) {
    this.#url = new URL(`https://api.tito.io/v3/${account}/${event}/`);
    this.#options = options;
  }

  //
  // Internal
  //

  debug(...args: any[]) {
    this.#options.debug?.(...args);
  }

  endpoint(input: string): URL {
    return new URL(input, this.#url);
  }

  fetch(input: URL | string | Request, init: RequestInit = {}) {
    if (typeof input === "string") input = this.endpoint(input);
    const request = new Request(input, init);
    if (this.#options.apiToken) {
      request.headers.set(
        "Authorization",
        `Token token=${this.#options.apiToken}`,
      );
    }
    return fetch(request);
  }

  async paginate<T>(url: URL, key: string): Promise<T[]> {
    this.debug("paginate url=%o", url.toString());
    const res = await this.fetch(url);

    if (!res.ok) {
      throw new Error(`Tito - ${res.statusText} ${await res.text()}`);
    }

    const items: T[] = [];
    for await (const values of this.iterate<T>(res, key)) {
      items.push(...values);
    }
    return items;
  }

  async *iterate<T>(res: Response, key: string): AsyncIterable<T[]> {
    this.debug("iterate status=%o page=%o", res.status, 1);

    if (!res.ok) console.error("iterate error", await res.text());

    while (res.ok) {
      const page: TitoPage<T> = await res.json();
      yield page[key];

      if (typeof page.meta?.next_page !== "number") break;

      const next = new URL(res.url);
      next.searchParams.set("page", page.meta.next_page.toString());
      res = await this.fetch(next);

      this.debug("iterate status=%o page=%o", res.status, page.meta?.next_page);
    }
  }

  //
  // Endpoints
  //
  async getAccount(): Promise<TitoAccountInfo | null> {
    const res = await this.fetch(new URL("https://api.tito.io/v3/hello"));
    return res.ok ? res.json() : null;
  }

  async listEvents(): Promise<TitoEvent[]> {
    const url = this.endpoint("../events");
    return this.paginate(url, "events");
  }

  async listTickets(since?: Date): Promise<TitoTicket[]> {
    const url = this.endpoint("tickets");
    url.searchParams.append("search[state]", "complete");
    url.searchParams.append("search[sort]", "created_at");
    url.searchParams.append("search[direction]", "desc");

    if (since) {
      url.searchParams.append(
        "search[updated_at][gt]",
        new Date(since).toISOString(),
      );
    }

    return this.paginate(url, "tickets");
  }

  async listRegistrations(since?: Date): Promise<TitoRegistration[]> {
    const url = this.endpoint("registrations");
    url.searchParams.append("search[state]", "complete");
    url.searchParams.append("search[sort]", "created_at");
    url.searchParams.append("search[direction]", "desc");

    if (since) {
      url.searchParams.append(
        "search[updated_at][gt]",
        new Date(since).toISOString(),
      );
    }

    return this.paginate(url, "registrations");
  }

  async listReleases(): Promise<TitoRelease[]> {
    const url = this.endpoint("releases");
    return this.paginate(url, "releases");
  }
}
