import { onMounted, onUnmounted, ref } from 'vue'
import maplibre from 'maplibre-gl'

export function useColorScheme() {
  const query = window.matchMedia('(prefers-color-scheme: dark)')

  const scheme = ref<'dark' | 'light'>(query.matches ? 'dark' : 'light')

  function onChange(event: MediaQueryListEvent) {
    scheme.value = event.matches ? 'dark' : 'light'
  }

  onMounted(() => {
    query.addEventListener('change', onChange)
  })

  onUnmounted(() => {
    query.removeEventListener('change', onChange)
  })

  return scheme
}

export function once<T>(fn: () => T) {
  let result: T | undefined = undefined
  return () => (result ??= fn())
}
