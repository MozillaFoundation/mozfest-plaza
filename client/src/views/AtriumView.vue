<template>
  <MozAppLayout class="atriumView">
    <AtriumLayout>
      <HeroCard
        slot="top"
        :title="$t('mozfest.atrium.title')"
        :subtitle="$t('mozfest.atrium.subtitle')"
        coverImage="/atrium.jpg"
      />

      <BoxContent slot="left" :title="$t('mozfest.atrium.heading')">
        <div class="atriumView-content">
          <ApiContent :slug="contentSlug">
            <PrimaryEmbed
              slot="feature_video"
              link="https://vimeo.com/687248853"
            />
            <div
              slot="conference_over_message"
              class="notification is-warning"
              v-if="conferenceIsOver"
            >
              <ApiContent slug="conference-over" />
            </div>
            <AnchorFmEmbed
              slot="feature_audio_a"
              src="https://anchor.fm/letsgetlitical/embed/episodes/Google-tell-me-about-gender--AI--Do-the-gender-stereotypes-offline-replicate-themselves-online-featuring-Sapni-GK--Garnett-Achieng-Mozfest-e1d2ivd"
            />
          </ApiContent>
        </div>
      </BoxContent>

      <div slot="right">
        <ColorWidget
          v-if="!user && widgets.has('register')"
          kind="custom"
          class="is-register"
          :title="$t('mozfest.atrium.registerTitle')"
          :subtitle="$t('mozfest.atrium.registerSubtitle')"
          :href="$t('mozfest.atrium.registerUrl')"
          :icon="['fas', 'ticket-alt']"
        />
        <ColorWidget
          v-if="!user && widgets.has('login')"
          kind="custom"
          class="is-login"
          :title="$t('mozfest.atrium.logIn')"
          subtitle=""
          href="/login"
          :icon="['fas', 'envelope']"
        />
        <ColorWidget
          v-if="siteVisitorsIsEnabled && widgets.has('siteVisitors')"
          kind="secondary"
          :title="siteVisitorsTitle"
          :subtitle="$t('mozfest.atrium.onlineUsers')"
          :icon="['fas', 'users']"
        />
        <ColorWidget
          v-if="widgets.has('twitter')"
          kind="twitter"
          :title="$t('mozfest.atrium.twitterTitle')"
          :subtitle="$t('mozfest.atrium.twitterSubtitle')"
          :href="$t('mozfest.atrium.twitterUrl')"
          :icon="['fab', 'twitter']"
        />

        <!-- Spatial chat -->
        <ColorWidget
          v-if="widgets.has('spatialChat')"
          class="is-spatialChat"
          kind="custom"
          :title="$t('mozfest.atrium.spacialChatTitle')"
          :subtitle="$t('mozfest.atrium.spacialChatSubtitle')"
          :icon="['fas', 'headset']"
          :href="$t('mozfest.atrium.spacialChatUrl')"
        />
        <!-- Slack -->
        <ColorWidget
          v-if="widgets.has('slack')"
          class="is-slack"
          kind="custom"
          :title="$t('mozfest.atrium.slackTitle')"
          :subtitle="$t('mozfest.atrium.slackSubtitle')"
          :icon="['fab', 'slack']"
          :href="$t('mozfest.atrium.slackUrl')"
        />
        <!-- Family Resources -->
        <ColorWidget
          v-if="widgets.has('familyResources')"
          class="is-family"
          kind="custom"
          :title="$t('mozfest.atrium.familyTitle')"
          :subtitle="$t('mozfest.atrium.familySubtitle')"
          :icon="['fas', 'puzzle-piece']"
          :href="$t('mozfest.atrium.familyUrl')"
        />
        <!-- Book -->
        <ColorWidget
          v-if="widgets.has('mozfestBook')"
          class="is-book"
          kind="custom"
          :title="$t('mozfest.atrium.bookTitle')"
          :subtitle="$t('mozfest.atrium.bookSubtitle')"
          :icon="['fas', 'book']"
          :href="$t('mozfest.atrium.bookUrl')"
        />
        <FeaturedSessions
          v-if="user && featuredSessions && featuredSessions.length > 0"
          :featured="featuredSessions"
          :current-date="scheduleDate"
        />
      </div>

      <div slot="bottom">
        <SponsorGrid :groups="sponsors" />
      </div>
    </AtriumLayout>
  </MozAppLayout>
</template>

<script lang="ts">
import Vue from 'vue'
import { Location } from 'vue-router'
import {
  AtriumLayout,
  HeroCard,
  BoxContent,
  ColorWidget,
  SponsorGrid,
  FeaturedSessions,
  SponsorGroup,
  deepSeal,
  Routes,
  SessionAndSlot,
  mapApiState,
  mapMetricsState,
  ApiContent,
  PrimaryEmbed,
} from '@openlab/deconf-ui-toolkit'
import { SessionSlot } from '@openlab/deconf-shared'
import MozAppLayout from '@/components/MozAppLayout.vue'
import AnchorFmEmbed from '@/components/AnchorFmEmbed.vue'
import { MozConferenceConfig } from '@/lib/module'

import sponsorData from '@/data/sponsors.json'

interface Data {
  sponsors: SponsorGroup[]
}

// TODO filter out non art-gallery types, confirm with marc
// const featuredTypeBlocklist = new Set(['art-and-media'])

export default Vue.extend({
  components: {
    ApiContent,
    PrimaryEmbed,
    MozAppLayout,
    AtriumLayout,
    HeroCard,
    BoxContent,
    ColorWidget,
    SponsorGrid,
    FeaturedSessions,
    AnchorFmEmbed,
  },
  data(): Data {
    return {
      sponsors: deepSeal(sponsorData),
    }
  },
  computed: {
    ...mapApiState('api', ['schedule', 'user']),
    ...mapMetricsState('metrics', ['siteVisitors']),
    settings(): MozConferenceConfig | null {
      return (this.schedule?.settings as MozConferenceConfig) ?? null
    },
    siteVisitorsIsEnabled(): boolean {
      if (!this.settings) return false
      return !this.settings.isStatic
    },
    siteVisitorsTitle(): string {
      return this.siteVisitors?.toString() ?? '~'
    },
    contentSlug(): string {
      return this.user ? 'atrium-active' : 'atrium-public'
    },
    loginRoute(): Location {
      return { name: Routes.Login }
    },
    registerRoute(): Location {
      return { name: Routes.Register }
    },
    scheduleDate(): Date {
      return this.$dev.scheduleDate ?? this.$temporal.date
    },

    // TODO: migrate to deconf-ui's getFeaturedSessions
    featuredSessions(): null | SessionAndSlot[] {
      if (!this.schedule) return null
      if (!this.schedule.settings.schedule.enabled) return null

      const now = this.scheduleDate.getTime()
      const inAWeek = now + 7 * 24 * 60 * 60 * 1000
      const slotMap = new Map(this.schedule.slots.map((s) => [s.id, s]))

      return this.schedule.sessions
        .filter((session) => Boolean(session.slot) && session.isFeatured)
        .map((session) => ({
          slot: slotMap.get(session.slot as string) as SessionSlot,
          session: session,
        }))
        .filter(
          (group) =>
            Boolean(group.slot) &&
            group.slot.end.getTime() > now &&
            group.slot.start.getTime() < inAWeek
        )
        .sort((a, b) => a.slot?.start.getTime() - b.slot?.start.getTime())
        .slice(0, 3)
    },
    conferenceIsOver(): boolean {
      if (!this.settings) return false
      return this.scheduleDate.getTime() > this.settings.endDate.getTime()
    },
    widgets(): Set<string> {
      const widgets = new Set<string>()
      const conf = this.settings?.atriumWidgets

      if (conf?.siteVisitors) widgets.add('siteVisitors')
      if (conf?.twitter) widgets.add('twitter')
      if (conf?.login) widgets.add('login')
      if (conf?.register) widgets.add('register')
      if (conf?.spatialChat) widgets.add('spatialChat')
      if (conf?.slack) widgets.add('slack')
      if (conf?.familyResources) widgets.add('familyResources')
      if (conf?.mozfestBook) widgets.add('mozfestBook')

      return widgets
    },
  },
})
</script>

<style lang="scss">
$spatialChat: #ff04b1;
$slack: #b7007e;
$family: #ff4f5e;
$book: #a07dff;

.atriumView {
  .hero-body {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  .heroCard {
    background-size: cover;
    background-position: center;
  }
  .heroCard-subtitle,
  .heroCard-title {
    @include title-font();
    line-height: 1;
    display: inline-block;
    background: $black;
    color: $white;
    padding: 0 0.2em;
    margin-right: auto;
    font-size: $size-1;
    margin-bottom: 12px;
  }

  .colorWidget-subtitle {
    font-weight: $weight-normal;
  }

  .boxContent-title {
    @include title-font();
  }

  .colorWidget-title,
  .colorWidget-subtitle,
  .colorWidget-arrow {
    color: $white;
  }

  .colorWidget.is-spatialChat {
    background-color: $spatialChat;
    &[href]:hover {
      background-color: darken($spatialChat, 7%);
    }
  }
  .colorWidget.is-slack {
    background-color: $slack;
    &[href]:hover {
      background-color: darken($slack, 7%);
    }
  }
  .colorWidget.is-family {
    background-color: $family;
    &[href]:hover {
      background-color: darken($family, 7%);
    }
  }
  .colorWidget.is-book {
    background-color: $book;
    &[href]:hover {
      background-color: darken($book, 7%);
    }
  }
  .colorWidget.is-register {
    background-color: $secondary;
    &[href]:hover {
      background-color: darken($secondary, 7%);
    }
  }
  .colorWidget.is-login {
    background-color: $secondary;
    &[href]:hover {
      background-color: darken($secondary, 7%);
    }
  }

  .colorWidget:not(:last-child) {
    margin-bottom: 0.75em;
  }

  .content {
    img {
      max-width: 150px;
    }
  }

  .sponsorRow-image {
    border-radius: $radius;
    box-shadow: $box-shadow;
    background: $white;
  }

  @include mobile {
    .heroCard {
      padding: 2rem;
    }
    .heroCard-title {
      margin-bottom: 2rem;
    }
    .heroCard-title,
    .heroCard-subtitle {
      font-size: $size-3;
    }
    .boxContent {
      padding: 1rem;
    }

    .buttons {
      margin: $block-spacing;

      .button {
        width: 100%;
      }
    }
  }
}
</style>
