//
// repo-api-client@0.3.6 ~ modified a bit, ideally this would be TypeScript
//

/**
 * @typedef RepoApiInit
 * @property {string} [key]
 */

/**
 * @typedef RepoQueryOptions
 * @property {'csv' | 'json' | 'toml' | 'yaml' | 'markdown'} [format]
 * @property {string[]} [columns]
 */

/**
 * @typedef LogFilesOptions
 * @property {string[]} [paths]
 * @property {string} [since]
 * @property {string} [until]
 */

export class RepoApi {
  /**
   * @param {string|URL} url
   * @param {RepoApiInit} [init]
   */
  constructor(url, init = {}) {
    this.url = new URL(url);
    this.key = init.key;
  }

  /** @param {string|URL} input */
  endpoint(input) {
    if (typeof input === "string" && input.startsWith("/")) {
      throw new SyntaxError("RepoApi url must not start with '/'");
    }
    if (input instanceof URL && input.origin !== this.url.origin) {
      throw new SyntaxError("RepoApi url must not change origin");
    }
    return new URL(input, this.url);
  }

  /**
   * @param {string|URL} input
   * @param {RequestInit} [init]
   */
  fetch(input, init = {}) {
    const request = new Request(this.endpoint(input), init);
    if (this.key) request.headers.set("Authorization", `Bearer ${this.key}`);
    return fetch(request);
  }

  /**
   * @template [T=any]
   * @param {string} file
   * @param {RepoQueryOptions} options
   * @returns {Promise<T>}
   */
  async queryFile(file, options = {}) {
    const url = this.endpoint("./query");
    url.searchParams.set("file", file);
    if (options.format) url.searchParams.set("format", options.format);
    if (options.columns) {
      url.searchParams.set("columns", options.columns.join(","));
    }

    const res = await this.fetch(url);
    if (!res.ok) throw new Error(await res.text());

    // @ts-ignore
    return options.format ? res.json() : res.text();
  }

  /**
   * @template {string} [T=string]
   * @param {string} file
   * @param {T[]} columns
   * @returns {Promise<Record<T, string>[]>}
   */
  queryCsvFile(file, columns) {
    return this.queryFile(file, { format: "csv", columns });
  }

  /**
   * @template T
   * @param {string} glob
   * @param {RepoQueryOptions} options
   * @returns {Promise<Map<string, T>>}
   */
  async queryGlob(glob, { format, columns } = {}) {
    const url = this.endpoint("./query");
    url.searchParams.set("glob", glob);
    if (format) url.searchParams.set("format", format);
    if (columns) url.searchParams.set("columns", columns.join(","));

    const res = await this.fetch(url);
    if (!res.ok) throw new Error(await res.text());

    const data = await res.formData();
    const output = new Map();

    for (const [key, item] of data) {
      const text = typeof item === "string" ? item : await item.text();
      output.set(key, format ? JSON.parse(text) : text);
    }

    return output;
  }

  /**
   * @template {string} [T=string]
   * @param {string} glob
   * @param {T[]} columns
   * @returns {Promise<Map<string, Record<T, string>[]>>}
   */
  queryCsvGlob(glob, columns) {
    return this.queryGlob(glob, { format: "csv", columns });
  }

  /**
   * @param {string} file
   * @param {BodyInit} body
   * @param {string} [message]
   */
  async write(file, body, message = undefined) {
    const url = this.endpoint("./file");
    url.searchParams.set("file", file);
    if (message) url.searchParams.set("message", message);

    console.log("DEBUG repo-api path=%o\n", file, body);

    // const res = await this.fetch(url, { body, method: "PUT" });

    // if (!res.ok) throw new Error(await res.text());
  }

  /**
   * @param {string} glob
   * @returns {Promise<string[]>}
   */
  async expandGlob(glob) {
    const url = this.endpoint("./expand");
    url.searchParams.set("glob", glob);

    const res = await this.fetch(url);
    if (!res.ok) throw new Error(await res.text());

    return res.json();
  }

  /**
   * @param {LogFilesOptions} options
   * @returns {Promise<string[]>}
   */
  async changed(options) {
    const url = this.endpoint("./changed");
    options.paths?.forEach((path) => url.searchParams.append("paths", path));
    if (options.since) url.searchParams.set("since", options.since);
    if (options.until) url.searchParams.set("until", options.until);

    const res = await this.fetch(url);
    if (!res.ok) throw new Error(await res.text());

    return res.json();
  }
}
