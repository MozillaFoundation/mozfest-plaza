<template>
  <AppLayout class="atriumView">
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
          v-if="widgets.has('siteVisitors')"
          kind="secondary"
          :title="siteVisitorsTitle"
          :subtitle="$t('mozfest.atrium.onlineUsers')"
          :icon="['fas', 'users']"
        />

        <ColorWidget
          v-for="widget in activeStaticWidgets"
          :key="widget.key"
          :kind="widget.kind"
          :class="widget.classes"
          :title="$t(widget.title)"
          :subtitle="$t(widget.subtitle)"
          :icon="widget.icon"
          :href="$t(widget.href)"
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
  </AppLayout>
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
  mapMetricsState,
  ApiContent,
  PrimaryEmbed,
  getFeaturedSessions,
} from '@openlab/deconf-ui-toolkit'
import AppLayout from '@/components/MozAppLayout.vue'
import { mapApiState, MozConferenceConfig } from '@/lib/module'

import sponsorData from '@/data/sponsors.json'

interface StaticWidget {
  public: boolean
  key: string
  title: string
  subtitle?: string
  href?: string
  kind: string
  icon: [string, string]
  classes?: string
}

const staticWidgets: StaticWidget[] = deepSeal([
  {
    key: 'calendarHelp',
    public: false,
    kind: 'secondary',
    title: 'mozfest.atrium.calendarHelpTitle',
    subtitle: 'mozfest.atrium.calendarHelpSubtitle',
    href: 'mozfest.atrium.calendarHelpUrl',
    icon: ['fas', 'calendar-plus'],
  },
  {
    key: 'twitter',
    public: true,
    kind: 'twitter',
    title: 'mozfest.atrium.twitterTitle',
    subtitle: 'mozfest.atrium.twitterSubtitle',
    icon: ['fab', 'twitter'],
    href: 'mozfest.atrium.twitterUrl',
  },
  {
    key: 'spatialChat',
    public: false,
    kind: 'custom',
    classes: 'is-spatialChat',
    title: 'mozfest.atrium.spacialChatTitle',
    subtitle: 'mozfest.atrium.spacialChatSubtitle',
    icon: ['fas', 'headset'],
    href: 'mozfest.atrium.spacialChatUrl',
  },
  {
    key: 'hubs',
    public: false,
    kind: 'custom',
    classes: 'is-spatialChat',
    title: 'mozfest.atrium.hubsTitle',
    subtitle: 'mozfest.atrium.hubsSubtitle',
    icon: ['fas', 'cubes'],
    href: 'mozfest.atrium.hubsUrl',
  },
  {
    key: 'slack',
    public: true,
    kind: 'custom',
    classes: 'is-slack',
    title: 'mozfest.atrium.slackTitle',
    subtitle: 'mozfest.atrium.slackSubtitle',
    icon: ['fab', 'slack'],
    href: 'mozfest.atrium.slackUrl',
  },
  {
    key: 'discord',
    public: true,
    kind: 'custom',
    classes: 'is-discord',
    title: 'mozfest.atrium.discordTitle',
    subtitle: 'mozfest.atrium.discordSubtitle',
    icon: ['fab', 'discord'],
    href: 'mozfest.atrium.discordUrl',
  },
  {
    key: 'linkedin',
    public: true,
    kind: 'custom',
    classes: 'is-linkedin',
    title: 'mozfest.atrium.linkedinTitle',
    subtitle: 'mozfest.atrium.linkedinSubtitle',
    icon: ['fab', 'linkedin'],
    href: 'mozfest.atrium.linkedinUrl',
  },
  {
    key: 'submissions',
    public: true,
    kind: 'secondary',
    title: 'mozfest.atrium.submissionsTitle',
    subtitle: 'mozfest.atrium.submissionsSubtitle',
    icon: ['fas', 'lightbulb'],
    href: 'mozfest.atrium.submissionsUrl',
  },
  {
    key: 'familyResources',
    public: false,
    kind: 'custom',
    classes: 'is-family',
    title: 'mozfest.atrium.familyTitle',
    subtitle: 'mozfest.atrium.familySubtitle',
    icon: ['fas', 'puzzle-piece'],
    href: 'mozfest.atrium.familyUrl',
  },
  {
    key: 'mastodon',
    public: true,
    kind: 'custom',
    classes: 'is-mastodon',
    title: 'mozfest.atrium.mastodonTitle',
    subtitle: 'mozfest.atrium.mastodonSubtitle',
    icon: ['fab', 'mastodon'],
    href: 'mozfest.atrium.mastodonUrl',
  },
  {
    key: 'mozfestBook',
    public: true,
    kind: 'custom',
    classes: 'is-book',
    title: 'mozfest.atrium.bookTitle',
    subtitle: 'mozfest.atrium.bookSubtitle',
    icon: ['fas', 'book'],
    href: 'mozfest.atrium.bookUrl',
  },
])

interface Data {
  sponsors: SponsorGroup[]
  staticWidgets: StaticWidget[]
}

export default Vue.extend({
  components: {
    ApiContent,
    PrimaryEmbed,
    AppLayout,
    AtriumLayout,
    HeroCard,
    BoxContent,
    ColorWidget,
    SponsorGrid,
    FeaturedSessions,
  },
  data(): Data {
    return {
      sponsors: deepSeal(sponsorData),
      staticWidgets,
    }
  },
  computed: {
    ...mapApiState('api', ['schedule', 'user']),
    ...mapMetricsState('metrics', ['siteVisitors']),
    settings(): MozConferenceConfig | null {
      return this.schedule?.settings ?? null
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

    featuredSessions(): null | SessionAndSlot[] {
      if (!this.schedule) return null
      if (!this.schedule.settings.schedule.enabled) return null

      return (
        getFeaturedSessions(
          this.schedule,
          7,
          this.scheduleDate,
          (s) => Boolean(s.slot) && s.isFeatured
        )?.slice(0, 3) ?? null
      )
    },
    widgets(): Set<string> {
      return new Set(
        Object.entries(this.settings?.atriumWidgets ?? {})
          .filter((entry) => entry[1] === true)
          .map((entry) => entry[0])
      )
    },
    featuredVideoLink(): string | undefined {
      try {
        const raw = this.settings?.content.atriumVideo
        if (!raw) return undefined
        return new URL(raw).toString()
      } catch {
        return undefined
      }
    },
    activeStaticWidgets(): StaticWidget[] {
      return this.staticWidgets.filter((w) => this.showStaticWidget(w))
    },
  },
  methods: {
    showStaticWidget(widget: StaticWidget): boolean {
      if (!this.widgets.has(widget.key)) return false
      return widget.public ? true : Boolean(this.user)
    },
  },
})
</script>

<style lang="scss">
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
  .colorWidget.is-linkedin {
    background-color: $linkedin;
    &[href]:hover {
      background-color: darken($linkedin, 7%);
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
  .colorWidget.is-discord {
    background-color: $discord;
    &[href]:hover {
      background-color: darken($discord, 7%);
    }
  }
  .colorWidget.is-mastodon {
    background-color: $mastodon;
    &[href]:hover {
      background-color: #563acc;
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
      // max-width: 150px;
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

.atriumView-themes {
  display: grid;
  grid-gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(min(270px, 100%), 1fr));
}
.atriumView-theme {
}
.atriumView-theme img {
  width: 100%;
  height: auto;
  display: block;
}
.atriumView-theme h3 {
  margin-bottom: 0;
}
.atriumView-theme > * + * {
  margin-block-start: 0.5rem !important;
}
</style>
