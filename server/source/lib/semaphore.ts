import { loader, Store } from "gruber";
import { useStore } from "./globals.ts";

export interface LockRecord {
  timestamp: number;
  hostname: string;
}

export interface LockInit {
  name: string;
  hostname: string;
  maxAge: number;
  debug?: (...args: any) => void;
}

export interface SemaphoreOptions {
  url: URL;
  prefix: string;
}

/**
 * A manager for locking a process for exclusive non-concurrent execution
 *
 * It stores a key in the store to reserve the execution for itself.
 * In the payload it stores the hostname of the aquirer and the timestamp for redundancy
 *
 * There is a rough idea that the host aquiring the lock might want to check it still has access,
 * but this isn't really used in this version.
 *
 * It will throw a {@link Semaphore.Error} if things go wrong
 */
export class Semaphore {
  static use = loader(() => new Semaphore(useStore()));

  static Error = class extends Error {};

  store;
  constructor(store: Store) {
    this.store = store;
  }

  /**
   * Aquire a lock on a key from a specific host for a specified duration.
   * Capture it with "using" or manually call {@link release}
   */
  async aquire({ name, hostname, maxAge, debug }: LockInit) {
    const key = `/semaphore/${name}`;

    debug?.("attempting key=%o", key);

    const lock = await this.store.get<LockRecord>(key);

    debug?.("lock=%O", lock);

    if (lock && Date.now() - lock.timestamp < maxAge) {
      throw new Semaphore.Error("failed to aquire lock");
    }

    await this.store.set<LockRecord>(
      key,
      { timestamp: Date.now(), hostname },
      { maxAge },
    );

    debug?.("aquired");

    const release = async () => {
      debug?.("releasing...");

      const value = await this.store.get<LockRecord>(key);
      debug?.("current=%O", value);

      if (value && value.hostname === hostname) {
        await this.store.delete(key);
        debug?.("...released");
      } else {
        throw new Semaphore.Error("lock not owned");
      }
    };

    return {
      key,
      [Symbol.asyncDispose]: release,
      release,
    };
  }
}
