import { computed, ref } from 'vue'
import type {
  AtriumOptions,
  CollageOptions,
  ContentOptions,
  GridOptions,
  MapOptions,
  PageConfig,
  TimelineOptions,
} from './constants.js'

type AllPages = Record<
  string,
  PageConfig<
    string,
    | TimelineOptions
    | GridOptions
    | ContentOptions
    | AtriumOptions
    | CollageOptions
    | MapOptions
  >
>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const pages: AllPages = (window as any).PAGES

export function getPageConfig<T>(name: string) {
  return pages[name] as PageConfig<string, T>
}
