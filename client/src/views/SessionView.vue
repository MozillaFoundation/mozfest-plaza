<template>
  <AppLayout v-if="session">
    <SessionView
      api-module="api"
      :class="extraClasses"
      :session="session"
      :schedule="schedule"
      :logged-in="Boolean(user)"
      :schedule-date="scheduleDate"
      @links="onLinks"
    >
      <BackButton slot="backButton" :to="backRoute">
        {{ $t('deconf.session.mozfest.backButton') }}
      </BackButton>

      <div
        class="notification is-warning"
        slot="afterAttributes"
        v-if="showExternalLinksWarning"
      >
        {{ $t('deconf.session.mozfest.externalLinks') }}
      </div>

      <template v-if="localeContent" slot="content">
        <div class="content" v-html="localeContent"></div>
      </template>
    </SessionView>
  </AppLayout>
  <NotFoundView v-else />
</template>

<script lang="ts">
import Vue from 'vue'
import { marked } from 'marked'
import {
  BackButton,
  SessionView,
  mapApiState,
  Routes,
  localiseFromObject,
} from '@openlab/deconf-ui-toolkit'
import { Location } from 'vue-router'
import AppLayout from '@/components/MozAppLayout.vue'
import { LocalisedLink, Session } from '@openlab/deconf-shared'
import NotFoundView from './NotFoundView.vue'
import { getSessionParentRoute } from '@/lib/module'

const internalDomains = [
  'mozilla.zoom.us',
  'spatial.chat',
  'miro.com',
  'hubs.mozilla.com',
  'youtube.com',
  'youtube-nocookie.com',
  'youtu.be',
  'vimeo.com',
  'mozilla.org',
  'mozillafestival.org',
  'mozfest.slack.com',
  'mozfest.gradu.al',
  'mozilla.hosted.panopto.com',
]

const nonTemporalTypes = new Set([
  'art-and-media',
  'skill-share--lightning-talk',
])

interface Data {
  links: LocalisedLink[] | null
}

export default Vue.extend({
  components: {
    AppLayout,
    SessionView,
    BackButton,
    NotFoundView,
  },
  props: {
    sessionId: { type: String, required: true },
  },
  data(): Data {
    return { links: null }
  },
  computed: {
    ...mapApiState('api', ['schedule', 'user']),
    session(): Session | null {
      if (!this.schedule) return null
      return this.schedule.sessions.find((s) => s.id === this.sessionId) ?? null
    },
    backRoute(): Location {
      if (!this.session) return { name: Routes.Schedule }
      return getSessionParentRoute(this.session)
    },
    scheduleDate(): Date {
      return this.$dev.scheduleDate ?? this.$temporal.date
    },
    showExternalLinksWarning(): boolean {
      if (!this.links) return false
      return this.links.some((l) => this.isExternal(l.url))
    },
    localeContent(): string | null {
      if (!this.session) return null
      const md = localiseFromObject(this.$i18n.locale, this.session.content)
      if (!md) return null
      return marked(md)
    },
    extraClasses(): unknown {
      return {
        'is-non-temporal':
          this.session && nonTemporalTypes.has(this.session.type),
      }
    },
  },
  methods: {
    onLinks(links: LocalisedLink[] | null) {
      this.links = links
    },
    /** Decide if a URL is external (not on-or sub- of the internal domains) */
    isExternal(input: string): boolean {
      try {
        const url = new URL(input)
        for (const domain of internalDomains) {
          if (url.hostname === domain || url.hostname.endsWith('.' + domain)) {
            return false
          }
        }
        return true
      } catch (error) {
        return true
      }
    },
  },
})
</script>

<style lang="scss">
.sessionView-help {
  margin-top: $block-spacing;
}

.sessionView.is-non-temporal {
  .sessionLayout-state,
  .sessionView-slot,
  .sessionView-actions {
    display: none;
  }
}
</style>
