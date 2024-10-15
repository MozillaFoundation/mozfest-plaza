<template>
  <div id="app">
    <MozApiError v-if="apiState === 'error'" :home-route="homeRoute" />
    <router-view v-else-if="apiState === 'ready'" />
    <AppLoading v-else />

    <DevControl
      :dev-plugin="$dev"
      :force-enabled="isDev"
      :controls="['scheduleDate']"
    >
      <template v-slot:extras>
        <PretalxDevBlock :dev-plugin="$dev" />
      </template>
    </DevControl>
    <AppDialog :dialog-plugin="$dialog" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import {
  AppDialog,
  AppLoading,
  DevControl,
  mapApiState,
  Routes,
} from '@openlab/deconf-ui-toolkit'
import type { ConferenceConfig } from '@openlab/deconf-shared'
import type { RouteLocationRaw } from 'vue-router'

import MozApiError from '@/components/MozApiError.vue'
import PretalxDevBlock from '@/components/PretalxDevBlock.vue'

import { StorageKey } from '@/lib/module'
import { setLocale } from '@/i18n/module'

interface Data {
  timerId: null | number
}

export default defineComponent({
  components: {
    AppLoading,
    DevControl,
    MozApiError,
    AppDialog,
    PretalxDevBlock,
  },
  data(): Data {
    return { timerId: null }
  },
  computed: {
    ...mapApiState('api', ['apiState', 'schedule', 'user']),
    settings(): ConferenceConfig | null {
      return this.schedule?.settings ?? null
    },
    homeRoute(): RouteLocationRaw {
      return { name: Routes.Atrium }
    },
    isDev(): boolean {
      return import.meta.env.mode === 'development'
    },
  },
  async mounted() {
    this.fetchData()

    // Setup temporal plugin
    this.$temporal.setup()

    // Listen for site-visitors and update vuex
    this.$io?.socket.on('site-visitors', (count: number) => {
      this.$store.commit('metrics/siteVisitors', count)
    })

    // Setup a random tick to re-pull the schedule
    this.timerId = window.setInterval(
      () => this.$store.dispatch('api/fetchData'),
      this.randomTick(),
    )
  },
  unmounted() {
    this.$temporal.teardown()
    this.$io?.teardown()

    if (this.timerId) {
      clearInterval(this.timerId)
      this.timerId = null
    }
  },
  methods: {
    /** Generate a random number between x */
    randomTick(): number {
      return Math.round((3 + Math.random() * 4) * 60 * 1000)
    },
    async fetchData() {
      const token = localStorage.getItem(StorageKey.AuthToken)

      //
      // If there is a token stored, authenticate with it & fetch data
      //
      if (token) {
        await this.$store.dispatch('api/authenticate', { token })

        if (!this.user) {
          localStorage.removeItem(StorageKey.AuthToken)
        }
      }

      if (!this.user) {
        //
        // Fetch data
        //
        await this.$store.dispatch('api/fetchData')

        // If ?locale=value is set, use that locale
        if (typeof this.$route.query.locale === 'string') {
          setLocale(this.$route.query.locale)
        }
      }
    },
  },
})
</script>

<style lang="scss">
@import './scss/fonts.scss';
@import '@openlab/deconf-ui-toolkit/theme.scss';
@import '@fortawesome/fontawesome-svg-core/styles.css';
@import './scss/hacks.scss';

//
// Misc styles
//

.button {
  font-weight: $weight-bold;
}

.box.is-small {
  max-width: $tablet;
  margin: 0 auto;
}

.navbar.has-border:after {
  content: '';
  height: 1px;
  background-color: $border;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: -1;
}

.content {
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    @include title-font;
  }
}
</style>
