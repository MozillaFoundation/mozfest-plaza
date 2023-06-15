<template>
  <AppLayout v-if="session">
    <SessionView
      api-module="api"
      :class="extraClasses"
      :session="session"
      :schedule="schedule"
      :logged-in="Boolean(user) || isStaticMode"
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

      <!-- TODO: refactor this back to the framework properly -->
      <template slot="login" v-if="!isStaticMode">
        <p>
          {{ $t('deconf.session.logIn') }}
        </p>
        <p class="sessionView-login">
          <router-link :to="loginLink" class="button is-danger is-outlined">
            {{ $t('deconf.session.mozfest.logIn') }}
          </router-link>
        </p>
      </template>

      <div
        slot="footer"
        v-if="recommendations.length > 0"
        class="sessionView-recommendations"
      >
        <h2>{{ $t('deconf.session.mozfest.recommendations') }}</h2>
        <p>{{ $t('deconf.session.mozfest.recommendationsInfo') }}</p>

        <div class="sessionView-recommendationCards">
          <div
            class="recommendationCard"
            v-for="(session, index) in recommendations"
            :key="session.id"
          >
            <SessionTile
              slot-state="future"
              :session="session"
              :schedule="schedule"
              :config="recommendationConfig"
              :readonly="false"
              @click="onRecommendation(session, index)"
            />
          </div>
        </div>
      </div>
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
  ScheduleConfig,
  SessionTile,
} from '@openlab/deconf-ui-toolkit'
import { Location } from 'vue-router'
import AppLayout from '@/components/MozAppLayout.vue'
import { LocalisedLink, Session } from '@openlab/deconf-shared'
import NotFoundView from './NotFoundView.vue'
import { getSessionParentRoute, MozSession } from '@/lib/module'
import { env } from '@/plugins/env-plugin'

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
  'mozfest.myhubs.net',
  'discord.gg',
  'discord.com',
]

const recommendationConfig: ScheduleConfig = {
  tileHeader: ['type'],
  tileAttributes: ['track', 'themes'],
}

const nonTemporalTypes = new Set([
  'art-and-media',
  'skill-share--lightning-talk',
])

interface Data {
  links: LocalisedLink[] | null
  recommendationConfig: ScheduleConfig
}

export default Vue.extend({
  components: {
    AppLayout,
    SessionView,
    BackButton,
    NotFoundView,
    SessionTile,
  },
  props: {
    sessionId: { type: String, required: true },
  },
  data(): Data {
    return { links: null, recommendationConfig }
  },
  computed: {
    ...mapApiState('api', ['schedule', 'user']),
    session(): MozSession | null {
      if (!this.schedule) return null
      return (
        (this.schedule.sessions.find(
          (s) => s.id === this.sessionId
        ) as MozSession) ?? null
      )
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
    loginLink(): unknown {
      const redirect = this.$router.resolve({
        name: Routes.Session,
        params: { sessionId: this.sessionId },
      }).href

      return {
        name: Routes.Login,
        query: { redirect },
      }
    },
    recommendations(): unknown {
      if (
        !this.session ||
        !this.schedule ||
        !this.session.recommendations ||
        this.session.recommendations.length === 0
      ) {
        return []
      }
      const sessions = this.schedule.sessions

      return this.session.recommendations
        .map((l) => this.parseSessionUrl(l.url, sessions) as Session)
        .filter((s) => s)
    },
    isStaticMode(): boolean {
      return env.STATIC_BUILD === true
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
    parseSessionUrl(input: string, sessions: Session[]) {
      try {
        const url = new URL(input)

        const ids = new Set<string>()
        const allowed = new Set([
          'schedule.mozillafestival.org',
          'mozfest.openlab.dev',
          'localhost',
        ])
        if (allowed.has(url.hostname)) {
          ids.add(this.trimSlashes(url.pathname.replace('/session/', '')))
        }
        if (url.hostname === 'mzf.st') {
          ids.add(this.trimSlashes(url.pathname))
        }

        for (const s of sessions) {
          if (ids.has(s.id)) return s
        }
        return null
      } catch {
        return null
      }
    },
    trimSlashes(pathname: string) {
      return pathname.replace(/^\//, '').replace(/\/$/, '')
    },
    onRecommendation(session: Session, index: number) {
      if (typeof index !== 'number') index = parseInt(index)

      console.log('RECOMMEND', session, index)
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

.sessionView-login {
  margin-top: 1rem;
  font-weight: $weight-bold;
}
.sessionView-recommendations {
  & > h2 {
    font-family: $family-sans-serif;
    font-weight: $weight-bold;
    color: $text-strong;
    font-size: $size-4;
    margin-block-start: $block-spacing;
  }
}

.sessionView-recommendationCards {
  display: grid;
  align-items: flex-start;
  grid-gap: $block-spacing;
  grid-template-columns: repeat(auto-fill, minmax(min(25ch, 100%), 1fr));
}

.recommendationCard {
  background-color: hsl(0deg, 0%, 100%);
  border-radius: 6px;
  box-shadow: 0 0.5em 1em -0.125em rgb(10 10 10 / 2%),
    0 0px 0 1px rgb(10 10 10 / 1%);
  padding: 1em;
}
</style>
