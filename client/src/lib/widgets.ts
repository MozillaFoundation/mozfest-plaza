import i18n from '@/i18n/module.js'
import { loadScript } from '@/lib/external-scripts'
import { PrivateCalendarCreator } from '@openlab/deconf-ui-toolkit'
import { createApp } from 'vue'
import { setupApp } from '@/main.js'

// NOTE: an initial sketch of converting widgets into HTML custom elements

export function registerWidgets() {
  IframeEmbed.register()
  FeedbackForm.register()
  PrivateCalendar.register()
  TitoWidget.register()
}

export class IframeEmbed extends HTMLElement {
  static register() {
    window.customElements?.define('mzf-iframe', this)
  }
  static observedAttributes = ['src', 'allow']

  get source() {
    return this.getAttribute('src') ?? ''
  }
  get allow() {
    return this.getAttribute('allow') ?? ''
  }
  connectedCallback() {
    this.render()
    loadScript(
      'airtable-v1',
      'https://static.airtable.com/js/embed/embed_snippet_v1.js'
    )
  }
  attributeChangedCallback() {
    this.render()
  }
  render() {
    this.innerHTML = `
      <div class="iframeEmbed">
        <iframe
          class="iframeEmbed-iframe"
          width="100%"
          height="100%"
          src="${this.source}"
          frameborder="0"
          allow="${this.allow}"
          allowfullscreen
        ></iframe>
      </div>
    `
  }
}

export class FeedbackForm extends HTMLElement {
  static register() {
    window.customElements?.define('mzf-feedback', this)
  }
  static observedAttributes = ['src']
  get source() {
    return this.getAttribute('src') ?? ''
  }
  connectedCallback() {
    this.render()
  }
  attributeChangedCallback() {
    this.render()
  }
  render() {
    this.innerHTML = `
      <iframe
        class="airtable-embed airtable-dynamic-height"
        src="${this.source}"
        frameborder="0"
        onmousewheel=""
        width="100%"
        height="1770"
        style="background: transparent; border: 1px solid #ccc"
        loading="lazy"
      ></iframe>
    `
  }
}

// string tag to parse HTML and create a DocumentFragment
function html(strings: TemplateStringsArray, ...args: any[]) {
  let html = ''
  for (let i = 0; i < strings.length; i++) {
    html += strings[i]
    if (args[i]) html += args[i]
  }
  const frag = document.createDocumentFragment()
  // const temp = document.createElement('div')
  const parsed = new DOMParser().parseFromString(html, 'text/html')
  for (const node of parsed.body.childNodes) frag.appendChild(node)
  return frag
}

// TODO: callouts
// TODO: calendar

export class PrivateCalendar extends HTMLElement {
  static register() {
    window.customElements?.define('mzf-private-calendar', this)
  }
  connectedCallback() {
    this.innerHTML = `<section class="calendarWidget block"></section>`
    // const frag = html`<section class="calendarWidget block"></section>`
    const app = createApp(PrivateCalendarCreator, { apiModule: 'api' })
    setupApp(app)
    app.mount(this.querySelector('section')!)
    // // frag.querySelector('section')!
    // this.
  }
}

export class TitoWidget extends HTMLElement {
  static register() {
    window.customElements?.define('mzf-tito', this)
  }
  static observedAttributes = ['event']
  loaded = false
  get eventName() {
    return this.getAttribute('event') ?? ''
  }
  async connectedCallback() {
    this.render()
    await loadScript('tito-v2', 'https://js.tito.io/v2')
    this.loaded = true
    this.render()
  }
  attributeChangedCallback() {
    this.render()
  }
  render() {
    if (!this.loaded) return
    this.innerHTML = `
      <section class="titoWidget block">
        <tito-widget
          event="${this.eventName}"
          locale="${i18n.global.locale}"
        ></tito-widget>
      </section>
    `
  }
}

// TODO: feature_video
// TODO: themes
// TODO: pinned
