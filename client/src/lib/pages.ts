import { computed, ref } from 'vue'
import type {
  AtriumOptions,
  ContentOptions,
  GridOptions,
  PageConfig,
  TimelineOptions,
} from './constants.js'

type AllPages = Record<
  string,
  PageConfig<
    string,
    TimelineOptions | GridOptions | ContentOptions | AtriumOptions
  >
>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const pages: AllPages = (window as any).PAGES

export function getPageConfig<T>(name: string) {
  return pages[name] as PageConfig<string, T>
}
