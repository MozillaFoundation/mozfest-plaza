export function loadScript(id: string, src: string, type?: string) {
  let script = document.getElementById(id)
  if (script) return

  script = document.createElement('script')
  script.setAttribute('id', id)
  script.setAttribute('src', src)
  if (type) script.setAttribute('type', type)
  document.body.append(script)
}
