<template>
  <ApiContent :slug="slug">
    <!-- feedback_form -->
    <template v-slot:feedback_form>
      <AirtableEmbed
        src="https://airtable.com/embed/shrSoLQIyaX54VlAy?backgroundColor=teal"
      />
    </template>

    <!-- callouts -->
    <template v-slot:callouts>
      <div class="buttons">
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
    </template>

    <!-- calendar -->
    <template v-slot:calendar>
      <section class="calendarWidget block">
        <PrivateCalendarCreator api-module="api" />
      </section>
    </template>

    <template v-slot:tito>
      <TitoWidget />
    </template>

    <template v-slot:feature_video>
      <PrimaryEmbed v-if="featuredVideoLink" :link="featuredVideoLink" />
    </template>

    <template v-slot:themes>
      <div class="atriumView-themes">
        <article class="atriumView-theme" v-for="theme in featuredThemes">
          <img :src="theme.image" :alt="localise(theme.title)" />
          <h3>{{ localise(theme.title) }}</h3>
          <p>{{ localise(theme.description) }}</p>
        </article>
      </div>
    </template>

    <template v-slot:pinned>
      <div class="atriumView-pinned">
        <SessionTile
          v-for="session in pinnedSessions"
          :key="session.id"
          slot-state="future"
          :session="session"
          :schedule="schedule!"
          :config="pinnedConfig"
        />
      </div>
    </template>

    <!-- ... -->
  </ApiContent>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import {
  ApiContent,
  localiseFromObject,
  PrimaryEmbed,
  PrivateCalendarCreator,
  type ScheduleConfig,
  SessionTile,
  FontAwesomeIcon,
} from '@openlab/deconf-ui-toolkit'

import TitoWidget from '@/components/TitoWidget.vue'
import AirtableEmbed from '@/components/AirtableEmbed.vue'
import { mapApiState } from '@/lib/module'
import type { Localized, Session, Theme } from '@openlab/deconf-shared'

export interface _PageTheme {
  title: Localized
  description: Localized
  image: string
}

export interface _DeconfTheme extends Theme {
  metadata: any
}

export default defineComponent({
  components: {
    ApiContent,
    FontAwesomeIcon,
    PrivateCalendarCreator,
    TitoWidget,
    AirtableEmbed,
    SessionTile,
    PrimaryEmbed,
  },
  props: {
    slug: { type: String, required: true },
  },
  computed: {
    ...mapApiState('api', ['schedule', 'settings']),
    featuredVideoLink(): string | undefined {
      try {
        const raw = this.settings?.content.atriumVideo
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
      if (!this.settings?.schedule.enabled) return []
      const sessions = new Map(this.schedule.sessions.map((s) => [s.id, s]))
      return this.settings.content.featuredSessions
        .map((id) => sessions.get(id) as Session)
        .filter((s) => Boolean(s))
    },

    // a "featured" theme is one that has a preview_image and description set in it's Deconf metadata field
    featuredThemes(): _PageTheme[] {
      if (!this.schedule) return []
      return (this.schedule.themes as _DeconfTheme[])
        .filter((t) => t.metadata.description && t.metadata.preview_image)
        .map((t) => ({
          title: t.title,
          description: t.metadata.description,
          image: t.metadata.preview_image,
        }))
    },
  },
  methods: {
    localise(input: Localized) {
      return localiseFromObject(this.$i18n.locale, input) as string
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
