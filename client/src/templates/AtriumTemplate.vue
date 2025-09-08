<template>
  <AtriumLayout class="atriumView">
    <template v-slot:top>
      <HeroCard
        :title="localise(config.options.hero.title)"
        :subtitle="localise(config.options.hero.subtitle)"
        :coverImage="localise(config.options.hero.image)"
      />
    </template>

    <template v-slot:left>
      <BoxContent>
        <div class="atriumView-content">
          <ApiContent :slug="contentSlug" />
        </div>
      </BoxContent>
    </template>

    <template v-slot:right>
      <AtriumWidget
        v-for="widget in filteredWidgets"
        :key="widget.id"
        :config="widget"
      />

      <FeaturedSessions
        v-if="user && featuredSessions.length > 0"
        :featured="featuredSessions"
        :current-date="scheduleDate"
      />
    </template>

    <template v-slot:bottom>
      <SponsorGrid :groups="sponsors" />
    </template>
  </AtriumLayout>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import {
  AtriumLayout,
  HeroCard,
  BoxContent,
  SponsorGrid,
  FeaturedSessions,
  type SessionAndSlot,
  getFeaturedSessions,
  localiseFromObject,
  type SponsorGroup,
} from '@openlab/deconf-ui-toolkit'
import ApiContent from '@/components/MozApiContent.vue'
import AtriumWidget from '@/components/AtriumWidget.vue'

import {
  type AtriumOptions,
  type AtriumWidgetOptions,
  mapApiState,
  type PageConfig,
} from '@/lib/module'
import type { Localised } from '@openlab/deconf-shared'

type Config = PageConfig<string, AtriumOptions>

export default defineComponent({
  components: {
    ApiContent,
    AtriumLayout,
    AtriumWidget,
    BoxContent,
    FeaturedSessions,
    HeroCard,
    SponsorGrid,
  },
  props: {
    config: { type: Object as PropType<Config>, required: true },
  },
  computed: {
    ...mapApiState('api', ['user', 'schedule', 'settings']),
    filteredWidgets(): AtriumWidgetOptions[] {
      return this.config.options.widgets.filter((w) => this.exec(w.condition))
    },
    contentSlug(): string {
      return `${this.config.name}-${this.user ? 'active' : 'public'}`
    },
    scheduleDate(): Date {
      return this.$dev.scheduleDate ?? this.$temporal.date
    },
    featuredSessions(): SessionAndSlot[] {
      if (!this.schedule) return []
      if (!this.settings?.schedule.enabled) return []

      return (
        getFeaturedSessions(
          this.schedule,
          7,
          this.scheduleDate,
          (s) => Boolean(s.slot) && s.isFeatured
        )?.slice(0, 3) ?? []
      )
    },
    sponsors() {
      return this.config.options.sponsors as SponsorGroup[]
    },
  },
  methods: {
    // TODO: use an actual logic library if this needs to be terser
    exec(condition?: string) {
      if (!condition) return true
      if (condition === 'false') return false
      if (condition === 'true') return true
      if (condition.includes('!user') && this.user) return false
      else if (condition.includes('user') && !this.user) return false
      return true
    },
    localise(input: Localised) {
      return localiseFromObject(this.$i18n.locale, input) ?? ''
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

  .colorWidget.is-custom {
    color: $white;
    background-color: $primary;
    &[href]:hover {
      background-color: darken($primary, 7%);
    }
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
    color: $black;
    background-color: $secondary;
    &[href]:hover {
      background-color: darken($secondary, 7%);
    }
    * {
      color: $black;
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
    padding: 1em;
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
  max-width: 420px;
  border-radius: $radius;
}
.atriumView-theme h3 {
  margin-bottom: 0;
}
.atriumView-theme > * + * {
  margin-block-start: 0.5rem !important;
}
.atriumView-pinned {
  display: grid;
  grid-gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(min(190px, 100%), 1fr));
}
.atriumView-pinned > * {
  border: 1px solid $border;
  border-radius: $radius;
  padding: 1em;
  align-self: flex-start;
}
.atriumView-pinned .speakerGrid {
  display: none;
}
</style>
