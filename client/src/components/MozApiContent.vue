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
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  ApiContent,
  PrimaryEmbed,
  PrivateCalendarCreator,
  type ScheduleConfig,
  SessionTile,
} from '@openlab/deconf-ui-toolkit'

import TitoWidget from '@/components/TitoWidget.vue'
import AirtableEmbed from '@/components/AirtableEmbed.vue'
import { mapApiState } from '@/lib/module'
import type { Session } from '@openlab/deconf-shared'

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
