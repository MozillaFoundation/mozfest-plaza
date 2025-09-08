export function loadScript(
  id: string,
  src: string,
  attrs: Record<string, string> = {}
) {
  let script = document.getElementById(id)
  if (script) return Promise.resolve()

  script = document.createElement('script')
  script.setAttribute('id', id)
  script.setAttribute('src', src)
  for (const [key, value] of Object.entries(attrs)) {
    script.setAttribute(key, value)
  }
  document.body.append(script)

  return new Promise<void>((resolve) => {
    script?.addEventListener('load', () => resolve())
  })
}
