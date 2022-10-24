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
      <PretalxDevBlock slot="extras" :dev-plugin="$dev" />
    </DevControl>
    <AppDialog :dialog-plugin="$dialog" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  AppLoading,
  DevControl,
  mapApiState,
  Routes,
} from '@openlab/deconf-ui-toolkit'
import { ConferenceConfig } from '@openlab/deconf-shared'
import { Location } from 'vue-router'

import MozApiError from '@/components/MozApiError.vue'
import AppDialog from '@/components/AppDialog.vue'
import PretalxDevBlock from '@/components/PretalxDevBlock.vue'

import { StorageKey } from '@/lib/module'
import { setLocale } from '@/i18n/module'

interface Data {
  timerId: null | number
}

export default Vue.extend({
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
    homeRoute(): Location {
      return { name: Routes.Atrium }
    },
    isDev(): boolean {
      return process.env.NODE_ENV === 'development'
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
    this.timerId = setInterval(
      () => this.$store.dispatch('api/fetchData'),
      this.randomTick()
    )
  },
  destroyed() {
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

        if (this.user) {
          setLocale(this.user.user_lang)
        } else {
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
//
// Fonts
//
@font-face {
  font-display: swap;
  font-family: 'Zilla Slab';
  font-style: normal;
  font-weight: 400;
  src: url('@/fonts/zilla/ZillaSlab-Regular.woff2') format('woff2'),
    url('@/fonts/zilla/ZillaSlab-Regular.woff') format('woff');
}

@font-face {
  font-display: swap;
  font-family: 'Zilla Slab';
  font-style: normal;
  font-weight: 700;
  src: url('@/fonts/zilla/ZillaSlab-Bold.woff2') format('woff2'),
    url('@/fonts/zilla/ZillaSlab-Bold.woff') format('woff');
}
@font-face {
  font-display: swap;
  font-family: 'Nunito Sans';
  font-style: normal;
  font-weight: 400;
  src: url('@/fonts/nunito/NunitoSans-Regular.woff2') format('woff2'),
    url('@/fonts/nunito/NunitoSans-Regular.ttf') format('ttf');
}

@font-face {
  font-display: swap;
  font-family: 'Nunito Sans';
  font-style: normal;
  font-weight: 700;
  src: url('@/fonts/nunito/NunitoSans-Bold.woff2') format('woff2'),
    url('@/fonts/nunito/NunitoSans-Bold.ttf') format('ttf');
}

@import '@openlab/deconf-ui-toolkit/theme.scss';
@import '@fortawesome/fontawesome-svg-core/styles.css';

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

//
// Hacks
//
.sideTabs {
  overflow-y: auto;
}

.addToCalendar {
  display: none !important;
}

.atriumLayout {
  overflow-x: hidden;
}

.sessionLayout-main {
  // https://weblog.west-wind.com/posts/2016/Feb/15/Flexbox-Containers-PRE-tags-and-managing-Overflow
  min-width: 0;
}
</style>
