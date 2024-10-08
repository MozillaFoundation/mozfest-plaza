<template>
  <ApiContent :slug="slug">
    <!-- feedback_form -->
    <AirtableEmbed
      slot="feedback_form"
      src="https://airtable.com/embed/shrSoLQIyaX54VlAy?backgroundColor=teal"
    />

    <!-- callouts -->
    <div class="buttons" slot="callouts">
      <a
        class="button is-large is-slack"
        href="http://mozillafestival.org/slack"
      >
        <span class="icon">
          <FontAwesomeIcon :icon="['fab', 'slack']" />
        </span>
        <span>Slack</span>
      </a>
      <a
        class="button is-large is-secondary"
        href="mailto:support@mozillafestival.org"
      >
        <span class="icon">
          <FontAwesomeIcon :icon="['fas', 'envelope']" />
        </span>
        <span>Email</span>
      </a>
      <a
        class="button is-large is-twitter"
        href="https://twitter.com/intent/tweet?hashtags=mozhelp"
      >
        <span class="icon">
          <FontAwesomeIcon :icon="['fab', 'twitter']" />
        </span>
        <span>Twitter</span>
      </a>
    </div>

    <!-- calendar -->
    <section slot="calendar" class="calendarWidget block">
      <PrivateCalendarCreator api-module="api" />
    </section>

    <TitoWidget slot="tito" />

    <PrimaryEmbed
      slot="feature_video"
      v-if="featuredVideoLink"
      :link="featuredVideoLink"
    />

    <div slot="themes" class="atriumView-themes">
      <article class="atriumView-theme">
        <img
          :src="$t('mozfest.atrium.theme1.image')"
          :alt="$t('mozfest.atrium.theme1.title')"
        />
        <h3>{{ $t('mozfest.atrium.theme1.title') }}</h3>
        <p>{{ $t('mozfest.atrium.theme1.content') }}</p>
      </article>
      <article class="atriumView-theme">
        <img
          :src="$t('mozfest.atrium.theme2.image')"
          :alt="$t('mozfest.atrium.theme2.title')"
        />
        <h3>{{ $t('mozfest.atrium.theme2.title') }}</h3>
        <p>{{ $t('mozfest.atrium.theme2.content') }}</p>
      </article>
      <article class="atriumView-theme">
        <img
          :src="$t('mozfest.atrium.theme3.image')"
          :alt="$t('mozfest.atrium.theme3.title')"
        />
        <h3>{{ $t('mozfest.atrium.theme3.title') }}</h3>
        <p>{{ $t('mozfest.atrium.theme3.content') }}</p>
      </article>
      <article class="atriumView-theme">
        <img
          :src="$t('mozfest.atrium.theme4.image')"
          :alt="$t('mozfest.atrium.theme4.title')"
        />
        <h3>{{ $t('mozfest.atrium.theme4.title') }}</h3>
        <p>{{ $t('mozfest.atrium.theme4.content') }}</p>
      </article>
    </div>

    <div slot="pinned" class="atriumView-pinned">
      <SessionTile
        v-for="session in pinnedSessions"
        :key="session.id"
        slot-state="future"
        :session="session"
        :schedule="schedule"
        :config="pinnedConfig"
      />
    </div>

    <!-- ... -->
  </ApiContent>
</template>

<script lang="ts">
import Vue from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  ApiContent,
  PrivateCalendarCreator,
  ScheduleConfig,
  SessionTile,
} from '@openlab/deconf-ui-toolkit'

import TitoWidget from '@/components/TitoWidget.vue'
import AirtableEmbed from '@/components/AirtableEmbed.vue'
import { mapApiState } from '@/lib/module'
import { Session } from '@openlab/deconf-shared'

export default Vue.extend({
  components: {
    ApiContent,
    FontAwesomeIcon,
    PrivateCalendarCreator,
    TitoWidget,
    AirtableEmbed,
    SessionTile,
  },
  props: {
    slug: { type: String, required: true },
  },
  computed: {
    ...mapApiState('api', ['schedule']),
    featuredVideoLink(): string | undefined {
      try {
        const raw = this.schedule.settings?.content.atriumVideo
        if (!raw) return undefined
        return new URL(raw).toString()
      } catch {
        return undefined
      }
    },
    pinnedConfig(): ScheduleConfig {
      return {
        tileHeader: ['type'],
        tileAttributes: ['track', 'themes'],
        tileActions: ['join'],
      }
    },
    pinnedSessions(): Session[] {
      if (!this.schedule) return []
      if (!this.schedule.settings.schedule.enabled) return []
      const sessions = new Map(this.schedule.sessions.map((s) => [s.id, s]))
      return this.schedule.settings.content.featuredSessions
        .map((id) => sessions.get(id) as Session)
        .filter((s) => Boolean(s))
    },
  },
})
</script>

<style lang="scss">
.calendarWidget {
  border: 3px solid $border;
  border-radius: $radius;
  padding: 1rem;
}
.calendarWidget > * {
  margin-bottom: 0;
}
</style>
