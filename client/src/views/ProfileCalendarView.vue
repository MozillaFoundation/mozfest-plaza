<template>
  <MozUtilLayout class="profileCalendarView">
    <template v-slot:backButton>
      <BackButton :to="profileRoute">
        {{ localise('deconf.profile.title') }}
      </BackButton>
    </template>

    <div class="content">
      <h1>{{ localise('mozfest.profileCalendar.name') }}</h1>
      <p>{{ localise('mozfest.profileCalendar.info') }}</p>

      <hr />

      <h2>{{ localise('mozfest.profileCalendar.ical') }}</h2>
      <p>
        <router-link :to="calendarHelpRoute">
          {{ localise('mozfest.profileCalendar.moreInfo') }}
        </router-link>
      </p>
      <PrivateCalendarCreator />

      <hr />

      <h2>{{ localise('mozfest.profileCalendar.google') }}</h2>

      <template v-if="isAuthorized">
        <p>You're all set up!</p>

        <p>Last sync: {{ lastSync }}</p>

        <details>
          <summary>Danger zone</summary>

          <p>This will unlink the Google Calendar integration.</p>

          <div class="buttons">
            <button class="button is-danger">Unlink Google Calendar</button>
          </div>
        </details>
      </template>
      <template v-else-if="isGoogle">
        <p>
          Linking Google calendar will create a new
          <strong>MozFest 2024</strong> calendar on your account and synchronise
          the events in MySchedule with it.
        </p>

        <p>
          To do this you need, we will ask for offline permissions to your
          calendar
        </p>

        <div class="buttons">
          <a class="button is-primary" :href="authorizeUrl"
            >Request permission</a
          >
        </div>
      </template>
      <template v-else>
        <p>
          Unfortunatly, you need to have signed in with your Google account to
          use this feature.
        </p>
      </template>

      <DebugOutput :value="{ authorizeUrl, tokens }" />
    </div>
  </MozUtilLayout>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import MozUtilLayout from '@/components/MozUtilLayout.vue'
import {
  BackButton,
  Routes,
  PrivateCalendarCreator,
} from '@openlab/deconf-ui-toolkit'

import {
  ExtraRoutes,
  GOOGLE_CALENDAR_SCOPE,
  localise,
  mapApiState,
} from '@/lib/module.js'
import DebugOutput from '@/components/DebugOutput.vue'
import { env } from '@/plugins/env-plugin'

const fullDate = new Intl.DateTimeFormat(navigator.language, {
  dateStyle: 'medium',
  timeStyle: 'medium',
})

export default defineComponent({
  components: {
    MozUtilLayout,
    BackButton,
    PrivateCalendarCreator,
    DebugOutput,
  },
  computed: {
    ...mapApiState('api', ['profile', 'tokens']),
    profileRoute() {
      return { name: Routes.Profile }
    },
    calendarHelpRoute() {
      return { name: ExtraRoutes.Calendar }
    },
    localise: () => localise,
    isAuthorized() {
      if (!this.tokens) return false

      return this.tokens.some(
        (t) =>
          t.scope.split(' ').some((s) => s === GOOGLE_CALENDAR_SCOPE) &&
          t.hasRefresh
      )
    },
    isGoogle() {
      if (!this.tokens) return false
      return this.tokens.some((t) => t.kind === 'google')
    },
    authorizeUrl() {
      const url = new URL('./auth/oauth2/google', env.SERVER_URL)
      url.searchParams.set('mode', 'calendar')
      url.searchParams.set('redirect', '/profile/calendar')
      return url.toString()
    },
    lastSync() {
      const date = (this.profile?.userData as Record<string, string>)
        .googleCalendarDate
      if (date) return fullDate.format(new Date(date))
      return 'pending'
    },
  },
  mounted() {
    this.$store.dispatch('api/fetchProfile')
  },
})
</script>

<style lang="scss">
.profileCalendarView .privateCalendarCreator-title {
  display: none;
}
</style>
