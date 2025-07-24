import {
  Store,
  StoreSetOptions,
  MemoryStore as DeconfMemoryStore,
} from "gruber";
import { RedisClientType, createClient, SetOptions } from "redis";

export interface RedisOptions {
  url: URL;
  prefix: string;
}

/** An Gruber {@link Store} backed by Redis with AsyncDisposable support */
export class RedisStore implements Store {
  /** Helper to get a client from a URL and connect to it */
  static async getClient(url: URL): Promise<RedisClientType> {
    const client = createClient({
      url: url.toString(),
    });
    await client.connect();
    return client as any;
  }

  _client: RedisClientType | undefined;
  prefix: string;
  url: URL;

  constructor(options: RedisOptions) {
    this.prefix = options.prefix;
    this.url = options.url;

    this.getClient = async () => {
      if (!this._client) {
        this._client = await RedisStore.getClient(options.url);
      }
      return this._client!;
    };
  }

  async getClient(): Promise<RedisClientType> {
    if (!this._client) {
      this._client = await RedisStore.getClient(this.url);
    }
    return this._client!;
  }

  async get<T>(key: string): Promise<T | undefined> {
    const client = await this.getClient();
    const value = await client.get(this.prefix + key);
    return value ? JSON.parse(value) : undefined;
  }

  async set<T>(
    key: string,
    value: T,
    { maxAge }: StoreSetOptions = {},
  ): Promise<void> {
    const client = await this.getClient();
    const options: SetOptions = {};
    if (typeof maxAge === "number") {
      options.expiration = { type: "PX", value: maxAge };
    }
    await client.set(this.prefix + key, JSON.stringify(value), options);
  }

  async delete(key: string): Promise<void> {
    const client = await this.getClient();
    await client.del(this.prefix + key);
  }

  async close(): Promise<void> {
    const client = await this.getClient();
    if (client.isOpen) await client.quit();
  }

  async [Symbol.asyncDispose]() {
    await this.close();
  }
}

export class MemoryStore extends DeconfMemoryStore {
  async [Symbol.asyncDispose]() {}
}
