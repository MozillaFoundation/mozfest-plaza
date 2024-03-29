export function loadScript(id: string, src: string, type?: string) {
  let script = document.getElementById(id)
  if (script) return Promise.resolve()

  script = document.createElement('script')
  script.setAttribute('id', id)
  script.setAttribute('src', src)
  if (type) script.setAttribute('type', type)
  document.body.append(script)

  return new Promise<void>((resolve) => {
    script?.addEventListener('load', () => resolve())
  })
}
