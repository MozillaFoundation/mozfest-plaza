export * from './api.js'
export * from './constants.js'
export * from './deconf-hacks.js'
export * from './languages.js'
export * from './schedule.js'
export * from './external-scripts.js'
export * from './deconf-client.js'

import _pages from '@/data/pages.json'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const pages: typeof _pages = (window as any).PAGES ?? _pages
