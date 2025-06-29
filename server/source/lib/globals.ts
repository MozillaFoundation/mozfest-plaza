import { getTerminator, loader, Store } from "gruber";
import { useAppConfig } from "../config.ts";
import { RedisStore } from "./redis.ts";

//
// Things for re-use across the entire server,
// preferably "dependencies" using `loader`
//

/** A value to control how the server gracefully terminates */
export const useTerminator = loader(() => {
  return getTerminator({
    timeout: useAppConfig().env === "development" ? 0 : 5_000,
  });
});

/** Simplified access to a key-value store */
export const useStore = loader<Store & AsyncDisposable>(() => {
  return new RedisStore(useAppConfig().redis);
});

/** a configuration that was stubbed out for development */
export const MOZ_STUB = "moz://stub";
